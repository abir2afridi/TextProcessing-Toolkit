import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { caesar, rot13, atbash } from "@/lib/text-utils";

export default function Cipher() {
  const [input, setInput] = useState("Hello World");
  const [mode, setMode] = useState<"caesar" | "rot13" | "atbash">("caesar");
  const [shift, setShift] = useState(3);
  const output = useMemo(() => {
    if (mode === "rot13") return rot13(input);
    if (mode === "atbash") return atbash(input);
    return caesar(input, shift);
  }, [input, mode, shift]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {(["caesar","rot13","atbash"] as const).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "ghost"} onClick={() => setMode(m)} className="h-7 rounded-sm font-mono text-[11px] uppercase">{m}</Button>
        ))}
        {mode === "caesar" && (
          <div className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">shift</Label>
            <Input type="number" value={shift} onChange={(e) => setShift(Number(e.target.value) || 0)} className="h-7 w-20 rounded-sm font-mono text-xs" />
          </div>
        )}
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Cipher" value={output} readOnly />
      </div>
    </div>
  );
}
