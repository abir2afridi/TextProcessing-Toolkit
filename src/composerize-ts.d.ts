declare module "composerize-ts" {
  export enum MessageType {
    notImplemented = "notImplemented",
    notTranslatable = "notTranslatable",
    errorDuringConversion = "errorDuringConversion",
  }

  export interface Message {
    type: MessageType;
    value: string;
  }

  export interface ComposerizeResult {
    yaml: string;
    messages: Message[];
  }

  export function composerize(arg: string): ComposerizeResult;
  export function listSupportedOptions(): string[];
}
