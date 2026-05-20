import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { toMorse, fromMorse } from "@/lib/text-utils";

export default function MorseCode() {
  const [input, setInput] = useState("SOS HELP");
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const output = useMemo(() => mode === "enc" ? toMorse(input) : fromMorse(input), [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "enc" ? "default" : "ghost"} onClick={() => setMode("enc")} className="h-7 rounded-sm font-mono text-[11px]">Text → Morse</Button>
        <Button size="sm" variant={mode === "dec" ? "default" : "ghost"} onClick={() => setMode("dec")} className="h-7 rounded-sm font-mono text-[11px]">Morse → Text</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
