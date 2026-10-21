/*
 * JSON <-> CSV conversion helpers.
 *
 * Everything runs in the browser: no request
 * is made and nothing is uploaded.
 */

export type CsvDirection = "json2csv" | "csv2json";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/*
 * Flatten nested objects into dot paths, for
 * example {"page":{"title":"x"}} becomes
 * {"page.title":"x"}. Arrays and nulls are
 * stored as their string form so a single
 * scalar per cell is kept.
 */
function flattenRow(
  value: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(entry)) {
      if (Object.keys(entry).length === 0) {
        out[path] = "{}";

        continue;
      }

      flattenRow(entry, path, out);
    } else if (Array.isArray(entry)) {
      out[path] = JSON.stringify(entry);
    } else if (entry === null || entry === undefined) {
      out[path] = "";
    } else {
      out[path] = String(entry);
    }
  }

  return out;
}

function escapeCsvField(field: string): string {
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

/**
 * Convert any JSON value into CSV text.
 *
 * An array of objects becomes one row per
 * entry; a single object becomes one row;
 * a flat array of primitives becomes one
 * "value" column. Nested objects are expanded
 * with dot separated headers.
 */
export function jsonToCsv(value: unknown): string {
  let rows: unknown[];

  if (Array.isArray(value)) {
    rows = value;
  } else if (isPlainObject(value)) {
    rows = [value];
  } else {
    throw new Error(
      'The JSON must be an array of objects (for example [{ "a": 1 }]) or a single object.',
    );
  }

  if (rows.length === 0) {
    throw new Error("The JSON array is empty, so there is nothing to convert.");
  }

  const flattened = rows.map((row) =>
    isPlainObject(row) ? flattenRow(row) : { value: toScalar(row) },
  );

  const headers: string[] = [];

  for (const row of flattened) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    }
  }

  if (headers.length === 0) {
    throw new Error("The JSON objects have no fields to convert.");
  }

  const lines = [headers.map(escapeCsvField).join(",")];

  for (const row of flattened) {
    lines.push(
      headers
        .map((header) => escapeCsvField(row[header] ?? ""))
        .join(","),
    );
  }

  return lines.join("\n");
}

function toScalar(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/*
 * Delimiters that are detected automatically:
 * comma, tab and semicolon. The order also
 * settles ties in favour of the comma.
 */
const DELIMITER_CANDIDATES = [",", "\t", ";"];

/*
 * Only a plain, unambiguous number may become
 * a JSON number: optional sign, digits with an
 * optional decimal part and an optional
 * exponent. Dates, identifiers and values such
 * as "1,234" never match.
 */
const NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/*
 * Count the candidate delimiters that appear
 * outside quoted values over the first
 * `maxRecords` rows, so a comma inside quotes
 * never skews the result.
 */
function countDelimiters(
  text: string,
  maxRecords: number,
): Map<string, number> {
  const counts = new Map<string, number>(
    DELIMITER_CANDIDATES.map((delimiter) => [delimiter, 0]),
  );

  let inQuotes = false;

  let records = 0;

  for (let index = 0; index < text.length && records < maxRecords; index++) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          index++;
        } else {
          inQuotes = false;
        }
      }

      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === "\n") {
      records++;
    } else {
      const count = counts.get(character);

      if (count !== undefined) {
        counts.set(character, count + 1);
      }
    }
  }

  return counts;
}

function pickDelimiter(counts: Map<string, number>): string | null {
  let best: string | null = null;

  let bestCount = 0;

  for (const candidate of DELIMITER_CANDIDATES) {
    const count = counts.get(candidate) ?? 0;

    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }

  return best;
}

/**
 * Detect which delimiter a CSV uses.
 *
 * The header row decides: the candidate that
 * appears most often outside quoted values
 * wins. If the header has none of them the
 * first rows are scanned, and a plain comma
 * remains the final fallback.
 */
export function detectDelimiter(text: string): string {
  const sample = text.replace(/^\uFEFF/, "").trim();

  if (!sample) {
    return ",";
  }

  const fromHeader = pickDelimiter(countDelimiters(sample, 1));

  if (fromHeader) {
    return fromHeader;
  }

  return pickDelimiter(countDelimiters(sample, 10)) ?? ",";
}

/**
 * Split CSV text into rows of raw cells.
 *
 * Handles quoted fields, doubled quotes and
 * newlines inside quotes. Only a quote that
 * starts a field is special, so a stray quote
 * inside a plain value is kept as written.
 */
export function parseCsvRows(text: string, delimiter = ","): string[][] {
  const normalized = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const rows: string[][] = [];

  let row: string[] = [];

  let field = "";

  let inQuotes = false;

  for (let index = 0; index < normalized.length; index++) {
    const character = normalized[index];

    if (inQuotes) {
      if (character === '"') {
        if (normalized[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }

      continue;
    }

    if (character === '"') {
      if (field === "") {
        inQuotes = true;
      } else {
        field += character;
      }
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (inQuotes) {
    throw new Error("The CSV has an unclosed quoted value.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/*
 * Keep every header unique so no column is
 * ever dropped: repeats get a _2, _3 suffix
 * and a clash with an existing name is skipped.
 */
function uniqueHeader(name: string, seen: Set<string>): string {
  let unique = name;

  let suffix = 1;

  while (seen.has(unique)) {
    suffix++;
    unique = `${name}_${suffix}`;
  }

  seen.add(unique);

  return unique;
}

/*
 * Turn one raw CSV cell into a JSON value.
 *
 * Plain numbers become JSON numbers so
 * quantities, prices and totals are usable.
 * Empty cells, leading-zero identifiers,
 * dates and anything else stay exactly as
 * written. Integers too large for JavaScript
 * to hold exactly stay strings as well.
 */
function coerceCell(raw: string): string | number {
  const value = raw.trim();

  if (!NUMBER_PATTERN.test(value)) {
    return raw;
  }

  const unsigned = value.replace(/^[+-]/, "");

  const integerPart = unsigned.split(/[.eE]/)[0];

  if (integerPart.length > 1 && integerPart.startsWith("0")) {
    return raw;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return raw;
  }

  if (!/[.eE]/.test(value) && !Number.isSafeInteger(parsed)) {
    return raw;
  }

  return parsed;
}

/**
 * Convert CSV text into an array of objects.
 *
 * The delimiter (comma, tab or semicolon) is
 * detected automatically unless one is passed
 * in. The first row is the header. Empty or
 * duplicate header names get a generated name
 * so no column is ever dropped, blank rows are
 * skipped, and every value is mapped to its
 * own column. Rows that do not match the
 * header, or a file without a header, produce
 * a clear error instead of misleading JSON.
 */
export function csvToJson(
  text: string,
  delimiter?: string,
): Record<string, unknown>[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();

  if (!cleaned) {
    throw new Error("The CSV input is empty.");
  }

  const rows = parseCsvRows(cleaned, delimiter ?? detectDelimiter(cleaned));

  if (rows.length === 0) {
    throw new Error("The CSV input is empty.");
  }

  const headerCells = rows[0];

  if (headerCells.every((cell) => cell.trim() === "")) {
    throw new Error(
      "The CSV is missing a header row: the first row contains no column names.",
    );
  }

  const seen = new Set<string>();

  const headers = headerCells.map((raw, index) =>
    uniqueHeader(raw.trim() || `column${index + 1}`, seen),
  );

  const objects: Record<string, unknown>[] = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const cells = rows[rowIndex];

    if (cells.every((cell) => cell.trim() === "")) {
      continue;
    }

    if (cells.length !== headers.length) {
      throw new Error(
        `Row ${rowIndex + 1} has ${cells.length} column${cells.length === 1 ? "" : "s"}, but the header row has ${headers.length}. Every row must match the header.`,
      );
    }

    const entry: Record<string, unknown> = {};

    cells.forEach((cell, index) => {
      entry[headers[index]] = coerceCell(cell);
    });

    objects.push(entry);
  }

  if (objects.length === 0) {
    throw new Error("The CSV has a header row but no data rows.");
  }

  return objects;
}
