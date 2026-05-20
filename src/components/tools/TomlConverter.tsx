import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import * as toml from "@iarna/toml";

export default function TomlConverter() {
  const [input, setInput] = useState('title = "TOML Example"\n\n[owner]\nname = "Tom"\n');
  const [mode, setMode] = useState<"j2t" | "t2j">("j2t");
  const output = useMemo(() => {
    try {
      if (mode === "j2t") return toml.stringify(JSON.parse(input));
      return JSON.stringify(toml.parse(input), null, 2);
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "j2t" ? "default" : "ghost"} onClick={() => setMode("j2t")} className="h-7 rounded-sm font-mono text-[11px]">JSON → TOML</Button>
        <Button size="sm" variant={mode === "t2j" ? "default" : "ghost"} onClick={() => setMode("t2j")} className="h-7 rounded-sm font-mono text-[11px]">TOML → JSON</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "j2t" ? "JSON" : "TOML"} value={input} onChange={setInput} />
        <IOPanel label={mode === "j2t" ? "TOML" : "JSON"} value={output} readOnly />
      </div>
    </div>
  );
}
