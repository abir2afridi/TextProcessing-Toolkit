import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { jsonToCSV, csvToJSON } from "@/lib/text-utils";

export default function JsonToCsv() {
  const [input, setInput] = useState('[{"name":"Alice","age":30},{"name":"Bob","age":25}]');
  const [mode, setMode] = useState<"j2c" | "c2j">("j2c");
  const output = useMemo(() => {
    try {
      if (mode === "j2c") return jsonToCSV(JSON.parse(input));
      return JSON.stringify(csvToJSON(input), null, 2);
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "j2c" ? "default" : "ghost"} onClick={() => setMode("j2c")} className="h-7 rounded-sm font-mono text-[11px]">JSON → CSV</Button>
        <Button size="sm" variant={mode === "c2j" ? "default" : "ghost"} onClick={() => setMode("c2j")} className="h-7 rounded-sm font-mono text-[11px]">CSV → JSON</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "j2c" ? "JSON" : "CSV"} value={input} onChange={setInput} />
        <IOPanel label={mode === "j2c" ? "CSV" : "JSON"} value={output} readOnly />
      </div>
    </div>
  );
}
