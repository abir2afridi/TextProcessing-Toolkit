declare module "mime-types" {
  export const types: Record<string, string>;
  export const extensions: Record<string, string[]>;
  export function lookup(path: string): string | false;
  export function contentType(filename: string): string | false;
  export function extension(mimeType: string): string | false;
  export function charset(type: string): string | false;
}
