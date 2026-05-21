import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import * as toml from "@iarna/toml";
import type { JsonMap } from "@iarna/toml";
import { jsonToYAML, yamlToJSON } from "@/lib/text-utils";

export default function YamlToml() {
  const [input, setInput] = useState("foo: bar\nlist:\n  name: item\n");
  const [mode, setMode] = useState<"y2t" | "t2y">("y2t");
  const output = useMemo(() => {
    try {
      if (mode === "y2t") return toml.stringify(yamlToJSON(input) as JsonMap);
      return jsonToYAML(toml.parse(input));
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "y2t" ? "default" : "ghost"} onClick={() => setMode("y2t")} className="h-7 rounded-sm font-mono text-[11px]">YAML → TOML</Button>
        <Button size="sm" variant={mode === "t2y" ? "default" : "ghost"} onClick={() => setMode("t2y")} className="h-7 rounded-sm font-mono text-[11px]">TOML → YAML</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "y2t" ? "Your YAML" : "Your TOML"} value={input} onChange={setInput} placeholder={mode === "y2t" ? "Paste your YAML here..." : "Paste your TOML here..."} />
        <IOPanel label={mode === "y2t" ? "TOML from your YAML" : "YAML from your TOML"} value={output} readOnly />
      </div>
    </div>
  );
}
