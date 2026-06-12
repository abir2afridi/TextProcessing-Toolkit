export interface PandocConvertResult {
  stdout: string;
  stderr: string;
  warnings: unknown[];
  files: Record<string, Blob | string>;
  mediaFiles: Record<string, Blob>;
}

export interface PandocQueryOptions {
  query:
    | "version"
    | "input-formats"
    | "output-formats"
    | "highlight-styles"
    | "highlight-languages"
    | "default-template"
    | "extensions-for-format";
  format?: string;
}

export interface PandocInstance {
  convert(
    options: Record<string, unknown>,
    stdin: string | null,
    files: Record<string, Blob | string>
  ): Promise<PandocConvertResult>;
  query(options: PandocQueryOptions): unknown;
  pandoc(
    argsStr: string,
    inData: string | Blob | null,
    resources?: Array<{ filename: string; contents: string | Blob }>
  ): Promise<{ out: string | Blob; mediaFiles: Map<string, string | Blob> }>;
}

export function createPandocInstance(
  wasmBinary: ArrayBuffer | Uint8Array
): Promise<PandocInstance>;
