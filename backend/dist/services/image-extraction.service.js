"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageExtractionError = void 0;
exports.extractImageData = extractImageData;
const genai_1 = require("@google/genai");
const genai_2 = require("@google/genai");
const image_types_1 = require("../types/image.types");
/**
 * Errors raised by this service carry an
 * HTTP status so the controller can
 * forward the correct code.
 */
class ImageExtractionError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.name = "ImageExtractionError";
        this.statusCode = statusCode;
    }
}
exports.ImageExtractionError = ImageExtractionError;
/*
 * Guards against a screenshot that the
 * model refuses to read, such as a blank
 * or extremely large image.
 */
const REQUEST_TIMEOUT_MS = 120_000;
/*
 * The structured schema is large, so a busy
 * screenshot can need a lot of tokens before
 * the JSON object is closed. Sizing this too
 * low makes the response stop early with
 * finish reason MAX_TOKENS and half written
 * JSON.
 */
const MAX_OUTPUT_TOKENS = 32_000;
const EXTRACTION_INSTRUCTIONS = [
    "You are a website screenshot data extractor.",
    "",
    "Read every visible element in the screenshot and return a",
    "single structured JSON object that describes the website or",
    "web application shown in the image.",
    "",
    "Rules:",
    "1. Only report text and elements that are actually visible in",
    "   the screenshot. Never invent, guess or complete content.",
    "   Do not describe what a website of this kind usually contains.",
    "2. Preserve the original wording, casing and numbers exactly.",
    "   Do not translate.",
    "3. Use null for a value that is not visible or cannot be read",
    "   with confidence. Use an empty array when nothing of that",
    "   kind is visible. Never return placeholder values.",
    "4. Keep every array in the reading order of the page, from top",
    "   to bottom.",
    "5. Do not repeat the same text in more than one array unless it",
    "   genuinely appears more than once on the page.",
    "6. Collapse whitespace so each paragraph is a single line.",
    "7. URLs that are not readable from the screenshot must be null.",
    "   Never fabricate a URL from a button label.",
    "8. Ignore the browser chrome and any editor or debug overlay.",
    "9. Return only the JSON object. No Markdown, no code fences and",
    "   no commentary.",
].join("\n");
const TEXT_INSTRUCTIONS = [
    "Analyse the attached screenshot and return the website data as",
    "a single JSON object using exactly this shape:",
    "",
    "{",
    '  "page": { "title": string|null, "description": string|null },',
    '  "headings": { "h1": string[], "h2": string[], "h3": string[] },',
    '  "content": { "paragraphs": string[] },',
    '  "navigation": [',
    '    { "label": string, "href": string|null,',
    '      "location": "header"|"sidebar"|"footer"|"menu"|"other" }',
    "  ],",
    '  "buttons": [',
    '    { "text": string,',
    '      "style": "primary"|"secondary"|"link"|"other",',
    '      "purpose": string|null }',
    "  ],",
    '  "links": [ { "text": string, "url": string|null } ],',
    '  "statistics": [',
    '    { "label": string, "value": string, "context": string|null }',
    "  ],",
    '  "sections": [',
    '    { "title": string|null, "description": string|null,',
    '      "type": string|null, "items": string[] }',
    "  ],",
    '  "forms": [',
    '    { "name": string|null, "action": string|null,',
    '      "fields": [',
    '        { "name": string|null, "label": string|null,',
    '          "type": "text"|"email"|"password"|"number"|"tel"|"url"|',
    '"search"|"textarea"|"select"|"checkbox"|"radio"|"file"|"date"|',
    '"submit"|"other",',
    '          "placeholder": string|null, "required": boolean|null }',
    "      ] }",
    "  ],",
    '  "images": [',
    '    { "description": string|null, "alt": string|null,',
    '      "context": string|null }',
    "  ],",
    '  "contact": [',
    '    { "type": "email"|"phone"|"address"|"other",',
    '      "value": string, "label": string|null }',
    "  ],",
    '  "social": [',
    '    { "platform": string, "handle": string|null,',
    '      "url": string|null }',
    "  ],",
    '  "ctas": [',
    '    { "text": string,',
    '      "style": "primary"|"secondary"|"link"|"banner"|"other",',
    '      "href": string|null, "placement": string|null }',
    "  ]",
    "}",
    "",
    'The "ctas" array holds the visible calls to action: the',
    "prominent elements that ask the visitor to sign up, buy,",
    "subscribe, download, call or contact. A call to action may",
    'also appear in "buttons"; list it in both places when it is',
    "a real call to action.",
    "",
    "Then apply these rules:",
    "",
    EXTRACTION_INSTRUCTIONS,
].join("\n");
/**
 * Lazily created client so a missing API
 * key never breaks the rest of the server
 * on startup.
 */
let client = null;
function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        throw new ImageExtractionError("Gemini API key is not configured", 500);
    }
    if (!client) {
        client = new genai_2.GoogleGenAI({
            apiKey: apiKey.trim(),
            httpOptions: {
                timeout: REQUEST_TIMEOUT_MS,
            },
        });
    }
    return client;
}
/**
 * Build the Gemini request.
 *
 * The screenshot is attached as inline
 * image data, so the model reads the
 * pixels itself and nothing is stored on
 * disk or fetched from a URL.
 */
function buildRequest(image, mode) {
    const parts = [
        {
            text: TEXT_INSTRUCTIONS,
        },
        {
            inlineData: {
                mimeType: image.mimetype,
                data: image.buffer.toString("base64"),
            },
        },
    ];
    const base = {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
    };
    /*
     * "schema" asks Gemini for structured
     * output that follows the JSON schema.
     * The other two modes are only used as
     * a fallback when the model or the API
     * rejects it.
     */
    const config = mode === "schema"
        ? {
            ...base,
            responseMimeType: "application/json",
            responseJsonSchema: image_types_1.IMAGE_EXTRACTION_SCHEMA,
        }
        : mode === "json"
            ? {
                ...base,
                responseMimeType: "application/json",
            }
            : base;
    return {
        model: image_types_1.IMAGE_MODEL,
        contents: [
            {
                role: "user",
                parts,
            },
        ],
        config,
    };
}
/**
 * Send one screenshot to Gemini.
 */
async function runModel(image, mode) {
    const gemini = getClient();
    const response = await gemini.models.generateContent(buildRequest(image, mode));
    const text = response.text;
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
        throw new ImageExtractionError(describeEmptyResponse(finishReason), 502);
    }
    if (!text || typeof text !== "string" || !text.trim()) {
        /*
         * If the response was cut off, the client
         * should see a 502 instead of the default
         * "malformed JSON" message.
         */
        throw new ImageExtractionError(describeEmptyResponse(finishReason, response.promptFeedback?.blockReason), 502);
    }
    return text;
}
/**
 * Reason why a response carried no text.
 */
function describeEmptyResponse(finishReason, blockReason) {
    if (blockReason) {
        return `The image was blocked by Gemini safety filters (${blockReason})`;
    }
    if (finishReason === "MAX_TOKENS") {
        return "The model output was truncated (maxOutputTokens exceeded). Try a smaller image or a simpler page.";
    }
    if (finishReason === "SAFETY" ||
        finishReason === "PROHIBITED_CONTENT" ||
        finishReason === "BLOCKLIST" ||
        finishReason === "IMAGE_SAFETY" ||
        finishReason === "SPII") {
        return `Gemini stopped generating a response (${finishReason})`;
    }
    return "The model returned an empty response";
}
/**
 * Decide whether a failure means the
 * requested output format is unsupported,
 * which makes it worth retrying with a
 * weaker format.
 */
function isFormatUnsupported(error) {
    if (!(error instanceof genai_1.ApiError)) {
        return false;
    }
    /*
     * Gemini reports a rejected request
     * parameter as a 400.
     */
    if (error.status !== 400) {
        return false;
    }
    const message = String(error.message ?? "").toLowerCase();
    const hints = [
        "responsejsonschema",
        "response_json_schema",
        "response schema",
        "response_schema",
        "responsemimetype",
        "response_mime_type",
        "response mime type",
        "json schema",
        "json_schema",
        "schema",
        "unsupported",
        "not supported",
        "unknown field",
        "unknown parameter",
        "unrecognized",
        "invalid argument",
    ];
    return hints.some((hint) => message.includes(hint));
}
/**
 * True when the failure is a transport
 * problem rather than an API answer.
 */
function isConnectionFailure(error) {
    if (!(error instanceof Error)) {
        return false;
    }
    const name = error.name.toLowerCase();
    if (name === "aborterror" ||
        name === "timeouterror" ||
        name === "fetcherror") {
        return true;
    }
    const message = String(error.message ?? "").toLowerCase();
    return (message.includes("fetch failed") ||
        message.includes("econnrefused") ||
        message.includes("etimedout") ||
        message.includes("socket hang up") ||
        message.includes("network"));
}
/**
 * Translate a Gemini SDK failure into a
 * readable API error.
 */
function toExtractionError(error) {
    if (error instanceof ImageExtractionError) {
        return error;
    }
    if (error instanceof genai_1.ApiError) {
        const status = error.status;
        if (status === 401 || status === 403) {
            return new ImageExtractionError("Gemini rejected the API key", 500);
        }
        if (status === 429) {
            return new ImageExtractionError("Gemini rate limit reached. Please try again shortly.", 429);
        }
        if (status === 400 || status === 404 || status >= 500) {
            return new ImageExtractionError(`Gemini request failed: ${error.message}`, 502);
        }
        return new ImageExtractionError(`Gemini request failed: ${error.message}`, 502);
    }
    if (isConnectionFailure(error)) {
        return new ImageExtractionError("Could not reach Gemini. Please try again.", 502);
    }
    console.error("Unexpected image extraction error:", error);
    return new ImageExtractionError("Image extraction failed", 500);
}
/**
 * Pull the first complete JSON value out of
 * a model response.
 *
 * Structured output already returns clean
 * JSON. The plain text fallback can wrap
 * the object in a code fence or add a
 * sentence around it, so the outer braces
 * are located by hand.
 */
function parseModelJson(raw) {
    const text = raw
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
        }
        throw new Error("The model did not return a JSON object");
    }
    catch {
        /*
         * Fall through to a brace scan.
         */
    }
    const start = text.indexOf("{");
    if (start === -1) {
        throw new ImageExtractionError("The model returned malformed JSON", 502);
    }
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index++) {
        const character = text[index];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (character === "\\") {
            escaped = true;
            continue;
        }
        if (character === '"') {
            inString = !inString;
            continue;
        }
        if (inString) {
            continue;
        }
        if (character === "{") {
            depth++;
            continue;
        }
        if (character === "}") {
            depth--;
            if (depth === 0) {
                const candidate = text.slice(start, index + 1);
                try {
                    const parsed = JSON.parse(candidate);
                    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        return parsed;
                    }
                }
                catch {
                    // Keep scanning.
                }
            }
        }
    }
    throw new ImageExtractionError("The model returned malformed JSON", 502);
}
/*
 * Normalisation helpers.
 *
 * The response contract must stay stable,
 * so every field is rebuilt from whatever
 * the model returned instead of being
 * passed through.
 */
function asRecord(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    return {};
}
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
function cleanText(value) {
    if (typeof value !== "string") {
        return null;
    }
    const text = value.replace(/\s+/g, " ").trim();
    return text.length > 0 ? text : null;
}
function asString(value) {
    return cleanText(value);
}
function asStringList(value) {
    const items = asArray(value)
        .map(cleanText)
        .filter((item) => item !== null);
    return items;
}
function asBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    return null;
}
function asEnum(value, allowed) {
    if (typeof value !== "string") {
        return null;
    }
    const match = allowed.find((entry) => entry.toLowerCase() === value.trim().toLowerCase());
    return match ?? null;
}
const NAVIGATION_LOCATIONS = [
    "header",
    "sidebar",
    "footer",
    "menu",
    "other",
];
const BUTTON_STYLES = [
    "primary",
    "secondary",
    "link",
    "other",
];
const CTA_STYLES = [
    "primary",
    "secondary",
    "link",
    "banner",
    "other",
];
const FORM_FIELD_TYPES = [
    "text",
    "email",
    "password",
    "number",
    "tel",
    "url",
    "search",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "file",
    "date",
    "submit",
    "other",
];
const CONTACT_TYPES = [
    "email",
    "phone",
    "address",
    "other",
];
function normalizeNavigation(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const label = asString(item.label);
        if (!label) {
            return null;
        }
        return {
            label,
            href: asString(item.href),
            location: asEnum(item.location, NAVIGATION_LOCATIONS) ?? "other",
        };
    })
        .filter((item) => item !== null);
}
function normalizeButtons(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const text = asString(item.text);
        if (!text) {
            return null;
        }
        return {
            text,
            style: asEnum(item.style, BUTTON_STYLES) ?? "other",
            purpose: asString(item.purpose),
        };
    })
        .filter((item) => item !== null);
}
function normalizeLinks(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const text = asString(item.text);
        if (!text) {
            return null;
        }
        return {
            text,
            url: asString(item.url),
        };
    })
        .filter((item) => item !== null);
}
function normalizeStatistics(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const label = asString(item.label);
        const statValue = asString(item.value);
        if (!statValue) {
            return null;
        }
        return {
            label: label ?? "",
            value: statValue,
            context: asString(item.context),
        };
    })
        .filter((item) => item !== null);
}
function normalizeSections(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const section = {
            title: asString(item.title),
            description: asString(item.description),
            type: asString(item.type),
            items: asStringList(item.items),
        };
        /*
         * Drop sections that carry no
         * information at all.
         */
        if (!section.title &&
            !section.description &&
            !section.type &&
            section.items.length === 0) {
            return null;
        }
        return section;
    })
        .filter((item) => item !== null);
}
function normalizeForms(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const fields = asArray(item.fields)
            .map((fieldEntry) => {
            const field = asRecord(fieldEntry);
            const label = asString(field.label);
            const placeholder = asString(field.placeholder);
            const name = asString(field.name);
            if (!label && !placeholder && !name) {
                return null;
            }
            return {
                name,
                label,
                type: asEnum(field.type, FORM_FIELD_TYPES) ?? "other",
                placeholder,
                required: asBoolean(field.required),
            };
        })
            .filter((field) => field !== null);
        const name = asString(item.name);
        const action = asString(item.action);
        if (!name && !action && fields.length === 0) {
            return null;
        }
        return {
            name,
            action,
            fields,
        };
    })
        .filter((item) => item !== null);
}
function normalizeImages(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const image = {
            description: asString(item.description),
            alt: asString(item.alt),
            context: asString(item.context),
        };
        if (!image.description && !image.alt && !image.context) {
            return null;
        }
        return image;
    })
        .filter((item) => item !== null);
}
function normalizeContact(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const contactValue = asString(item.value);
        if (!contactValue) {
            return null;
        }
        return {
            type: asEnum(item.type, CONTACT_TYPES) ?? "other",
            value: contactValue,
            label: asString(item.label),
        };
    })
        .filter((item) => item !== null);
}
function normalizeSocial(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const platform = asString(item.platform);
        if (!platform) {
            return null;
        }
        return {
            platform,
            handle: asString(item.handle),
            url: asString(item.url),
        };
    })
        .filter((item) => item !== null);
}
function normalizeCtas(value) {
    return asArray(value)
        .map((entry) => {
        const item = asRecord(entry);
        const text = asString(item.text);
        if (!text) {
            return null;
        }
        return {
            text,
            style: asEnum(item.style, CTA_STYLES) ?? "other",
            href: asString(item.href),
            placement: asString(item.placement),
        };
    })
        .filter((item) => item !== null);
}
/**
 * Rebuild the response contract from the
 * raw model output.
 */
function normalizeData(raw) {
    const page = asRecord(raw.page);
    const headings = asRecord(raw.headings);
    const content = asRecord(raw.content);
    return {
        source: {
            type: "image",
        },
        page: {
            title: asString(page.title),
            description: asString(page.description),
        },
        headings: {
            h1: asStringList(headings.h1),
            h2: asStringList(headings.h2),
            h3: asStringList(headings.h3),
        },
        content: {
            paragraphs: asStringList(content.paragraphs),
        },
        navigation: normalizeNavigation(raw.navigation),
        buttons: normalizeButtons(raw.buttons),
        links: normalizeLinks(raw.links),
        statistics: normalizeStatistics(raw.statistics),
        sections: normalizeSections(raw.sections),
        forms: normalizeForms(raw.forms),
        images: normalizeImages(raw.images),
        contact: normalizeContact(raw.contact),
        social: normalizeSocial(raw.social),
        ctas: normalizeCtas(raw.ctas),
    };
}
/**
 * Analyse one uploaded screenshot and
 * return the structured website data.
 *
 * The image is sent to Gemini as inline
 * image data and is never stored.
 */
async function extractImageData(image) {
    const modes = ["schema", "json", "text"];
    let raw = "";
    let lastError = null;
    for (let index = 0; index < modes.length; index++) {
        const mode = modes[index];
        try {
            raw = await runModel(image, mode);
            break;
        }
        catch (error) {
            lastError = error;
            /*
             * Only retry when Gemini rejected the
             * output format itself. Every other
             * failure is final.
             */
            const canRetry = index < modes.length - 1 && isFormatUnsupported(error);
            if (!canRetry) {
                throw toExtractionError(error);
            }
            console.warn(`Image extraction: retrying without "${mode}" output format`);
        }
    }
    if (!raw) {
        throw toExtractionError(lastError);
    }
    const parsed = parseModelJson(raw);
    return normalizeData(parsed);
}
