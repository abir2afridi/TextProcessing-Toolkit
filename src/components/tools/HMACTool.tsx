import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HmacMD5, HmacRIPEMD160, HmacSHA1, HmacSHA224, HmacSHA256, HmacSHA3, HmacSHA384, HmacSHA512, enc } from "crypto-js";
import type { lib } from "crypto-js";

const algos = { MD5: HmacMD5, RIPEMD160: HmacRIPEMD160, SHA1: HmacSHA1, SHA3: HmacSHA3, SHA224: HmacSHA224, SHA256: HmacSHA256, SHA384: HmacSHA384, SHA512: HmacSHA512 } as const;
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
  return hex.trim().split("").map((c) => Number.parseInt(c, 16).toString(2).padStart(4, "0")).join("");
}

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === "Bin") return convertHexToBin(words.toString(enc.Hex));
  return words.toString(enc[encoding]);
}

export default function HMACTool() {
  const [text, setText] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<AlgoName>("SHA256");
  const [encoding, setEncoding] = useState<Encoding>("Hex");

  const hmac = useMemo(() => {
    if (!text || !secret) return "";
    try {
      return formatWithEncoding(algos[algo](text, secret), encoding);
    } catch { return ""; }
  }, [text, secret, algo, encoding]);

  return (
    <div className="space-y-4">
      <IOPanel label="Plain text to compute the hash" value={text} onChange={setText} placeholder="Plain text to compute the hash..." rows={3} />
      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Secret key</Label>
        <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter the secret key..." className="h-7 flex-1 rounded-sm font-mono text-xs" />
      </OptionRow>
      <OptionRow>
        <div className="flex flex-wrap items-center gap-2">
          {algoNames.map((a) => (
            <Button key={a} size="sm" variant={algo === a ? "default" : "ghost"} onClick={() => setAlgo(a)} className="h-7 rounded-sm font-mono text-[11px]">
              {a}
            </Button>
          ))}
        </div>
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
      <IOPanel label="HMAC of your text" value={hmac} readOnly rows={4} />
      <div className="flex justify-center">
        <Button size="sm" onClick={() => { navigator.clipboard.writeText(hmac); toast.success("Copied HMAC"); }} disabled={!hmac} className="h-8 rounded-sm font-mono text-[11px]">
          Copy HMAC
        </Button>
      </div>
    </div>
  );
}
