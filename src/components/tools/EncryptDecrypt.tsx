import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CryptoJS from "crypto-js";

export default function EncryptDecrypt() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");

  const process = () => {
    if (!text || !password) return;
    try {
      if (mode === "encrypt") {
        const encrypted = CryptoJS.AES.encrypt(text, password).toString();
        setOutput(encrypted);
      } else {
        const decrypted = CryptoJS.AES.decrypt(text, password).toString(CryptoJS.enc.Utf8);
        setOutput(decrypted || "[error] invalid ciphertext or wrong key");
      }
    } catch { setOutput("[error] operation failed"); }
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "encrypt" ? "default" : "ghost"} onClick={() => { setMode("encrypt"); setOutput(""); }} className="h-7 rounded-sm font-mono text-[11px]">Encrypt</Button>
        <Button size="sm" variant={mode === "decrypt" ? "default" : "ghost"} onClick={() => { setMode("decrypt"); setOutput(""); }} className="h-7 rounded-sm font-mono text-[11px]">Decrypt</Button>
      </OptionRow>
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-7 w-48 rounded-sm font-mono text-xs" placeholder="Enter secret key…" />
        </div>
        <Button size="sm" onClick={process} disabled={!text || !password} className="h-7 rounded-sm font-mono text-[11px]">{mode === "encrypt" ? "Encrypt" : "Decrypt"}</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "encrypt" ? "Plain text" : "Ciphertext"} value={text} onChange={setText} placeholder={mode === "encrypt" ? "Enter plain text…" : "Enter ciphertext…"} />
        <IOPanel label={mode === "encrypt" ? "Ciphertext" : "Plain text"} value={output} readOnly />
      </div>
    </div>
  );
}
