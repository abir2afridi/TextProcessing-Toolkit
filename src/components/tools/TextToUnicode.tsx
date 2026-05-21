import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function convertTextToUnicode(text: string): string {
  return text.split("").map((value) => `&#${value.charCodeAt(0)};`).join("");
}

function convertUnicodeToText(unicodeStr: string): string {
  return unicodeStr.replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(dec));
}

export default function TextToUnicode() {
  const [inputText, setInputText] = useState("");
  const [inputUnicode, setInputUnicode] = useState("");

  const unicodeFromText = useMemo(() => convertTextToUnicode(inputText), [inputText]);
  const textFromUnicode = useMemo(() => convertUnicodeToText(inputUnicode), [inputUnicode]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Text to Unicode</div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Enter text to convert to unicode</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Hello Avengers'"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Unicode from your text</div>
          <textarea
            value={unicodeFromText}
            readOnly
            placeholder="The unicode representation of your text will be here"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="sm"
            disabled={!unicodeFromText}
            onClick={() => {
              navigator.clipboard.writeText(unicodeFromText);
              toast.success("Unicode copied to the clipboard");
            }}
            className="h-8 rounded-sm font-mono text-xs"
          >
            Copy unicode to clipboard
          </Button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Unicode to Text</div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Enter unicode to convert to text</div>
          <textarea
            value={inputUnicode}
            onChange={(e) => setInputUnicode(e.target.value)}
            placeholder="Input Unicode"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Text from your Unicode</div>
          <textarea
            value={textFromUnicode}
            readOnly
            placeholder="The text representation of your unicode will be here"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="sm"
            disabled={!textFromUnicode}
            onClick={() => {
              navigator.clipboard.writeText(textFromUnicode);
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
