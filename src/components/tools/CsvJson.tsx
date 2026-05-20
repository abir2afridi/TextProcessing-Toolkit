import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { csvToJSON, jsonToCSV } from "@/lib/text-utils";

export default function CsvJson() {
  const [input, setInput] = useState("name,age\nAlice,30\nBob,25");
  const [mode, setMode] = useState<"c2j" | "j2c">("c2j");
  const [delim, setDelim] = useState(",");
  const output = useMemo(() => {
    try {
      if (mode === "c2j") return JSON.stringify(csvToJSON(input, delim), null, 2);
      return jsonToCSV(JSON.parse(input), delim);
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode, delim]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "c2j" ? "default" : "ghost"} onClick={() => setMode("c2j")} className="h-7 rounded-sm font-mono text-[11px]">CSV → JSON</Button>
        <Button size="sm" variant={mode === "j2c" ? "default" : "ghost"} onClick={() => setMode("j2c")} className="h-7 rounded-sm font-mono text-[11px]">JSON → CSV</Button>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">delimiter</Label>
          <Input value={delim} onChange={(e) => setDelim(e.target.value || ",")} className="h-7 w-16 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "c2j" ? "CSV" : "JSON"} value={input} onChange={setInput} />
        <IOPanel label={mode === "c2j" ? "JSON" : "CSV"} value={output} readOnly />
      </div>
    </div>
  );
}
