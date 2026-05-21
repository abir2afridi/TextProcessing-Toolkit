import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AES, TripleDES, Rabbit, RC4, enc } from "crypto-js";

const algos = { AES, TripleDES: TripleDES, Rabbit, RC4 } as const;
type AlgoName = keyof typeof algos;
const algoNames = Object.keys(algos) as AlgoName[];

export default function EncryptDecrypt() {
  const [encryptText, setEncryptText] = useState("Lorem ipsum dolor sit amet");
  const [encryptSecret, setEncryptSecret] = useState("my secret key");
  const [encryptAlgo, setEncryptAlgo] = useState<AlgoName>("AES");

  const [decryptInput, setDecryptInput] = useState("U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs");
  const [decryptSecret, setDecryptSecret] = useState("my secret key");
  const [decryptAlgo, setDecryptAlgo] = useState<AlgoName>("AES");

  const encryptOutput = useMemo(() => {
    if (!encryptText || !encryptSecret) return "";
    try { return algos[encryptAlgo].encrypt(encryptText, encryptSecret).toString(); }
    catch { return "[error] encryption failed"; }
  }, [encryptText, encryptSecret, encryptAlgo]);

  const [decryptOutput, decryptError] = useMemo(() => {
    if (!decryptInput || !decryptSecret) return ["", null as string | null];
    try {
      const result = algos[decryptAlgo].decrypt(decryptInput, decryptSecret).toString(enc.Utf8);
      if (!result) return ["", "Unable to decrypt your text"];
      return [result, null];
    } catch {
      return ["", "Unable to decrypt your text"];
    }
  }, [decryptInput, decryptSecret, decryptAlgo]);

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Encrypt</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <IOPanel label="Your text:" value={encryptText} onChange={setEncryptText} placeholder="The string to cypher" rows={4} />
          </div>
          <div className="flex w-64 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="w-28 flex-shrink-0 font-mono text-[11px] text-muted-foreground">Your secret key:</Label>
              <Input value={encryptSecret} onChange={(e) => setEncryptSecret(e.target.value)} className="h-8 flex-1 rounded-sm font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-28 flex-shrink-0 font-mono text-[11px] text-muted-foreground">Encryption algorithm:</Label>
              <select value={encryptAlgo} onChange={(e) => setEncryptAlgo(e.target.value as AlgoName)} className="h-8 flex-1 rounded-sm border border-border bg-surface px-2 font-mono text-[11px] text-foreground">
                {algoNames.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <IOPanel label="Your text encrypted:" value={encryptOutput} readOnly rows={3} />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Decrypt</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <IOPanel label="Your encrypted text:" value={decryptInput} onChange={setDecryptInput} placeholder="The string to cypher" rows={4} />
          </div>
          <div className="flex w-64 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="w-28 flex-shrink-0 font-mono text-[11px] text-muted-foreground">Your secret key:</Label>
              <Input value={decryptSecret} onChange={(e) => setDecryptSecret(e.target.value)} className="h-8 flex-1 rounded-sm font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-28 flex-shrink-0 font-mono text-[11px] text-muted-foreground">Encryption algorithm:</Label>
              <select value={decryptAlgo} onChange={(e) => setDecryptAlgo(e.target.value as AlgoName)} className="h-8 flex-1 rounded-sm border border-border bg-surface px-2 font-mono text-[11px] text-foreground">
                {algoNames.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
            </div>
          </div>
        </div>
        {decryptError ? (
          <div className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 font-mono text-xs text-destructive">{decryptError}</div>
        ) : (
          <div className="mt-5">
            <IOPanel label="Your decrypted text:" value={decryptOutput} readOnly rows={3} />
          </div>
        )}
      </div>
    </div>
  );
}
