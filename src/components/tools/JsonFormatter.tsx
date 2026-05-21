import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatJSON, minifyJSON } from "@/lib/text-utils";
import JSON5 from "json5";

function sortObjectKeys<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys) as unknown as T;
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sorted, key) => {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
      return sorted;
    }, {} as Record<string, unknown>) as T;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('{"hello": "world", "foo": "bar"}');
  const [indent, setIndent] = useState(3);
  const [mode, setMode] = useState<"pretty" | "min">("pretty");
  const [sortKeys, setSortKeys] = useState(true);

  const { output, error } = useMemo(() => {
    try {
      const parsed = JSON5.parse(input);
      if (mode === "min") {
        const minified = JSON.stringify(parsed);
        if (minified === undefined) throw new Error("Invalid JSON");
        return { output: minified, error: null as string | null };
      }
      const obj = sortKeys ? sortObjectKeys(parsed) : parsed;
      return { output: JSON.stringify(obj, null, indent), error: null as string | null };
    } catch (e) {
      return { output: "", error: "Provided JSON is not valid." };
    }
  }, [input, indent, mode, sortKeys]);

  return (
    <div className="space-y-4">
      <div className="mx-auto flex max-w-[600px] flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] text-muted-foreground">Sort keys :</Label>
          <Switch checked={sortKeys} onCheckedChange={setSortKeys} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] text-muted-foreground">Indent size :</Label>
          <Input type="number" min={0} max={10} value={indent} onChange={(e) => setIndent(Math.max(0, Math.min(10, Number(e.target.value) || 0)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
      </div>

      {error && (
        <div className="text-center font-mono text-xs text-destructive">{error}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel
          label="Your raw JSON"
          value={input}
          onChange={setInput}
          placeholder="Paste your raw JSON here..."
        />
        <IOPanel
          label="Prettified version of your JSON"
          value={output}
          readOnly
        />
      </div>

      <OptionRow>
        <Button size="sm" variant={mode === "pretty" ? "default" : "ghost"} onClick={() => setMode("pretty")} className="h-7 rounded-sm font-mono text-[11px]">Pretty</Button>
        <Button size="sm" variant={mode === "min" ? "default" : "ghost"} onClick={() => setMode("min")} className="h-7 rounded-sm font-mono text-[11px]">Minify</Button>
      </OptionRow>
    </div>
  );
}
