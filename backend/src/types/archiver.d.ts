/*
 * Local type declarations for archiver v8.
 *
 * archiver v8 is ESM-only and ships no types of its own. The DefinitelyTyped
 * package @types/archiver@8 declares the same named exports, but those are not
 * visible to the TypeScript 7 compiler used by this project, so the resolved
 * module appears to have no members at all. This file is mapped in via the
 * "paths" entry in tsconfig.json and supplies the real v8 surface.
 */
declare module "archiver" {
  import type { Transform, TransformOptions } from "stream";
  import type { ZlibOptions } from "zlib";

  export interface EntryData {
    name: string;
    type?: "directory" | "file" | "symlink";
    date?: Date | string;
    mode?: number;
    prefix?: string;
  }

  export interface CoreOptions {
    statsConcurrency?: number;
    store?: boolean;
    comment?: string | Buffer;
  }

  export interface ZipOptions {
    zlib?: ZlibOptions | false;
    forceLocalTime?: boolean;
    forceZip64?: boolean;
    zip64?: boolean;
  }

  export interface TarOptions {
    gzip?: boolean;
    gzipOptions?: ZlibOptions;
  }

  export type ArchiverOptions = CoreOptions &
    TransformOptions &
    ZipOptions &
    TarOptions;

  export class Archiver extends Transform {
    constructor(options?: ArchiverOptions);

    abort(): this;

    append(
      source: string | Buffer | NodeJS.ReadableStream,
      data?: EntryData,
    ): this;

    directory(
      dirpath: string,
      destpath?: string,
      data?: Partial<EntryData>,
    ): this;

    glob(
      pattern: string,
      options?: Record<string, unknown>,
      data?: Partial<EntryData>,
    ): this;

    finalize(): Promise<void>;

    pointer(): number;
  }

  export class ZipArchive extends Archiver {
    constructor(options?: ArchiverOptions);
  }

  export class TarArchive extends Archiver {
    constructor(options?: ArchiverOptions);
  }

  export class JsonArchive extends Archiver {
    constructor(options?: ArchiverOptions);
  }
}
