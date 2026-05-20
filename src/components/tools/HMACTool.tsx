import { useState, useEffect } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateHMAC } from "@/lib/text-utils";

const algos = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof algos)[number];

export default function HMACTool() {
  const [text, setText] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!text || !secret) { setOutput(""); return; }
    let cancelled = false;
    generateHMAC(text, secret, algo).then((h) => { if (!cancelled) setOutput(h); });
    return () => { cancelled = true; };
  }, [text, secret, algo]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {algos.map((a) => (
          <Button key={a} size="sm" variant={algo === a ? "default" : "ghost"} onClick={() => setAlgo(a)} className="h-7 rounded-sm font-mono text-[11px]">
            {a}
          </Button>
        ))}
      </OptionRow>
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Secret key</Label>
          <Input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} className="h-7 w-48 rounded-sm font-mono text-xs" placeholder="Enter secret key…" />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={text} onChange={setText} placeholder="Type to HMAC…" />
        <IOPanel label={`HMAC-${algo}`} value={output} readOnly rows={6} />
      </div>
    </div>
  );
}
