import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function convertTextToAsciiBinary(text: string, { separator = " " } = {}): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(separator);
}

function convertAsciiBinaryToText(binary: string): string {
  const cleanBinary = binary.replace(/[^01]/g, "");
  if (cleanBinary.length % 8) {
    throw new Error("Invalid binary string");
  }
  return cleanBinary
    .split(/(\d{8})/)
    .filter(Boolean)
    .map((bits) => String.fromCharCode(Number.parseInt(bits, 2)))
    .join("");
}

export default function TextToBinary() {
  const [inputText, setInputText] = useState("");
  const [inputBinary, setInputBinary] = useState("");

  const binaryFromText = useMemo(() => convertTextToAsciiBinary(inputText), [inputText]);

  const textFromBinary = useMemo(() => {
    try {
      return convertAsciiBinaryToText(inputBinary);
    } catch {
      return "";
    }
  }, [inputBinary]);

  const binaryInvalid =
    inputBinary.trim() !== "" &&
    (() => {
      try {
        convertAsciiBinaryToText(inputBinary);
        return false;
      } catch {
        return true;
      }
    })();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Text to ASCII binary</div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Enter text to convert to binary</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Hello world'"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Binary from your text</div>
          <textarea
            value={binaryFromText}
            readOnly
            placeholder="The binary representation of your text will be here"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="sm"
            disabled={!binaryFromText}
            onClick={() => {
              navigator.clipboard.writeText(binaryFromText);
              toast.success("Binary copied to the clipboard");
            }}
            className="h-8 rounded-sm font-mono text-xs"
          >
            Copy binary to clipboard
          </Button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">ASCII binary to text</div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Enter binary to convert to text</div>
          <textarea
            value={inputBinary}
            onChange={(e) => setInputBinary(e.target.value)}
            placeholder="e.g. '01001000 01100101 01101100 01101100 01101111'"
            rows={5}
            className={`w-full rounded-sm border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring ${binaryInvalid ? "border-destructive" : "border-border"}`}
          />
          {binaryInvalid && (
            <span className="mt-1 block font-mono text-[10px] text-destructive">
              Binary should be a valid ASCII binary string with multiples of 8 bits
            </span>
          )}
        </div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Text from your binary</div>
          <textarea
            value={textFromBinary}
            readOnly
            placeholder="The text representation of your binary will be here"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="sm"
            disabled={!textFromBinary}
            onClick={() => {
              navigator.clipboard.writeText(textFromBinary);
              toast.success("Text copied to the clipboard");
            }}
            className="h-8 rounded-sm font-mono text-xs"
          >
            Copy text to clipboard
          </Button>
        </div>
      </div>
    </div>
  );
}
