import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { jsonToYAML, yamlToJSON } from "@/lib/text-utils";

export default function YamlJson() {
  const [input, setInput] = useState('{\n  "name": "tpt",\n  "tools": ["sort", "dedupe"]\n}');
  const [mode, setMode] = useState<"j2y" | "y2j">("j2y");
  const output = useMemo(() => {
    try {
      if (mode === "j2y") return jsonToYAML(JSON.parse(input));
      return JSON.stringify(yamlToJSON(input), null, 2);
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "j2y" ? "default" : "ghost"} onClick={() => setMode("j2y")} className="h-7 rounded-sm font-mono text-[11px]">JSON → YAML</Button>
        <Button size="sm" variant={mode === "y2j" ? "default" : "ghost"} onClick={() => setMode("y2j")} className="h-7 rounded-sm font-mono text-[11px]">YAML → JSON</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "j2y" ? "JSON" : "YAML"} value={input} onChange={setInput} />
        <IOPanel label={mode === "j2y" ? "YAML" : "JSON"} value={output} readOnly />
      </div>
    </div>
  );
}
