import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import JSON5 from "json5";
import { jsonToYAML, yamlToJSON } from "@/lib/text-utils";

export default function YamlJson() {
  const [input, setInput] = useState('{\n  "name": "tpt",\n  "tools": ["sort", "dedupe"]\n}');
  const [mode, setMode] = useState<"j2y" | "y2j">("j2y");
  const { output, error } = useMemo(() => {
    try {
      if (mode === "j2y") return { output: jsonToYAML(JSON5.parse(input)), error: null as string | null };
      return { output: JSON.stringify(yamlToJSON(input), null, 2), error: null };
    } catch (e) { return { output: "", error: (e as Error).message }; }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "j2y" ? "default" : "ghost"} onClick={() => setMode("j2y")} className="h-7 rounded-sm font-mono text-[11px]">JSON → YAML</Button>
        <Button size="sm" variant={mode === "y2j" ? "default" : "ghost"} onClick={() => setMode("y2j")} className="h-7 rounded-sm font-mono text-[11px]">YAML → JSON</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "j2y" ? "Your JSON" : "Your YAML"} value={input} onChange={setInput} placeholder={mode === "j2y" ? "Paste your JSON here..." : "Paste your YAML here..."} />
        <IOPanel label={mode === "j2y" ? "YAML from your JSON" : "JSON from your YAML"} value={output} readOnly />
      </div>
      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {mode === "j2y" ? "Provided JSON is not valid." : "Provided YAML is not valid."}
        </div>
      )}
    </div>
  );
}
