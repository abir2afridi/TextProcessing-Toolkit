import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA384, SHA512, SHA3, enc } from "crypto-js";
import type { lib } from "crypto-js";

const algos = { MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3, RIPEMD160 } as const;
type AlgoName = keyof typeof algos;
const algoNames = Object.keys(algos) as AlgoName[];

type Encoding = "Hex" | "Base64" | "Base64url" | "Bin";
const encodingOptions: { label: string; value: Encoding }[] = [
  { label: "Binary (base 2)", value: "Bin" },
  { label: "Hexadecimal (base 16)", value: "Hex" },
  { label: "Base64 (base 64)", value: "Base64" },
  { label: "Base64url (base 64 with url safe chars)", value: "Base64url" },
];

function convertHexToBin(hex: string) {
  return hex
    .trim()
    .split("")
    .map((c) => Number.parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
}

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === "Bin") return convertHexToBin(words.toString(enc.Hex));
  return words.toString(enc[encoding]);
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [encoding, setEncoding] = useState<Encoding>("Hex");

  return (
    <div className="space-y-4">
      <IOPanel label="Your text to hash:" value={input} onChange={setInput} placeholder="Your string to hash..." rows={3} />

      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Digest encoding</Label>
        <select
          value={encoding}
          onChange={(e) => setEncoding(e.target.value as Encoding)}
          className="h-8 rounded-sm border border-border bg-surface px-2 font-mono text-[11px] text-foreground"
        >
          {encodingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </OptionRow>

      <div className="space-y-1.5">
        {algoNames.map((algo) => {
          const hashValue = input
            ? formatWithEncoding(algos[algo](input), encoding)
            : "";
          return (
            <div key={algo} className="flex items-stretch rounded-sm border border-border bg-surface">
              <div className="flex w-[120px] flex-shrink-0 items-center border-r border-border px-3 font-mono text-[11px] font-semibold text-muted-foreground">
                {algo}
              </div>
              <input
                value={hashValue}
                readOnly
                placeholder="..."
                className="h-10 flex-1 bg-transparent px-3 font-mono text-xs text-primary outline-none"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 flex-shrink-0 rounded-none rounded-r-sm border-l border-border"
                disabled={!hashValue}
                onClick={() => {
                  navigator.clipboard.writeText(hashValue);
                  toast.success(`Copied ${algo}`);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
