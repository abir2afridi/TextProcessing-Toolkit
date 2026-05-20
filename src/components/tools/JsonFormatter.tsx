import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatJSON, minifyJSON } from "@/lib/text-utils";

export default function JsonFormatter() {
  const [input, setInput] = useState('{"hello":"world","arr":[1,2,3]}');
  const [indent, setIndent] = useState(2);
  const [mode, setMode] = useState<"pretty" | "min">("pretty");

  const { output, error } = useMemo(() => {
    try {
      return { output: mode === "pretty" ? formatJSON(input, indent) : minifyJSON(input), error: null as string | null };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, indent, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "pretty" ? "default" : "ghost"} onClick={() => setMode("pretty")} className="h-7 rounded-sm font-mono text-[11px]">Pretty</Button>
        <Button size="sm" variant={mode === "min" ? "default" : "ghost"} onClick={() => setMode("min")} className="h-7 rounded-sm font-mono text-[11px]">Minify</Button>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">indent</Label>
          <Input type="number" min={0} max={8} value={indent} onChange={(e) => setIndent(Math.max(0, Math.min(8, Number(e.target.value) || 0)))} className="h-7 w-16 rounded-sm font-mono text-xs" />
        </div>
        <span className="ml-auto font-mono text-[11px]">
          {error ? <span className="text-destructive">{error}</span> : <span className="text-primary">valid JSON</span>}
        </span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
