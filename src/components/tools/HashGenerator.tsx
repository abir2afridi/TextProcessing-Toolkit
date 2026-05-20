import { useState, useEffect } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { hash } from "@/lib/text-utils";

const algos = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof algos)[number];

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [output, setOutput] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!input) { setOutput(""); return; }
    hash(input, algo).then((h) => { if (!cancelled) setOutput(h); });
    return () => { cancelled = true; };
  }, [input, algo]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {algos.map((a) => (
          <Button key={a} size="sm" variant={algo === a ? "default" : "ghost"} onClick={() => setAlgo(a)} className="h-7 rounded-sm font-mono text-[11px]">
            {a}
          </Button>
        ))}
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Type to hash…" />
        <IOPanel label={`${algo} digest`} value={output} readOnly rows={6} />
      </div>
    </div>
  );
}
