import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bcrypt from "bcryptjs";

export default function BcryptTool() {
  const [mode, setMode] = useState<"hash" | "verify">("hash");
  const [text, setText] = useState("");
  const [saltRounds, setSaltRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [verifyPlain, setVerifyPlain] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!text) return;
    setBusy(true);
    try {
      const h = await bcrypt.hash(text, saltRounds);
      setHash(h);
    } catch { setHash("[error] hash failed"); }
    setBusy(false);
  };

  const doVerify = () => {
    if (!hash || !verifyPlain) return;
    try {
      setVerifyResult(bcrypt.compareSync(verifyPlain, hash));
    } catch { setVerifyResult(null); }
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "hash" ? "default" : "ghost"} onClick={() => setMode("hash")} className="h-7 rounded-sm font-mono text-[11px]">Hash</Button>
        <Button size="sm" variant={mode === "verify" ? "default" : "ghost"} onClick={() => setMode("verify")} className="h-7 rounded-sm font-mono text-[11px]">Verify</Button>
      </OptionRow>
      {mode === "hash" ? (
        <>
          <OptionRow>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Salt rounds</Label>
              <Input type="number" min={4} max={20} value={saltRounds} onChange={(e) => setSaltRounds(Math.max(4, Math.min(20, Number(e.target.value) || 4)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
            </div>
            <Button size="sm" onClick={generate} disabled={busy || !text} className="h-7 rounded-sm font-mono text-[11px]">{busy ? "Generating…" : "Generate"}</Button>
          </OptionRow>
          <div className="grid gap-4 lg:grid-cols-2">
            <IOPanel label="Plain text" value={text} onChange={setText} placeholder="Enter text to hash…" />
            <IOPanel label="Bcrypt hash" value={hash} readOnly />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <IOPanel label="Bcrypt hash" value={hash} onChange={setHash} placeholder="Enter hash…" />
            <IOPanel label="Plain text" value={verifyPlain} onChange={setVerifyPlain} placeholder="Enter text to verify…" />
          </div>
          <OptionRow>
            <Button size="sm" onClick={doVerify} disabled={!hash || !verifyPlain} className="h-7 rounded-sm font-mono text-[11px]">Verify</Button>
            {verifyResult !== null && (
              <span className={`font-mono text-[11px] ${verifyResult ? "text-green-500" : "text-red-500"}`}>
                {verifyResult ? "✓ Match" : "✗ No match"}
              </span>
            )}
          </OptionRow>
        </>
      )}
    </div>
  );
}
