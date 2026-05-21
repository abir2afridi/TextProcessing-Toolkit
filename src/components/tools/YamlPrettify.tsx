import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";

export default function YamlPrettify() {
  const [input, setInput] = useState("foo: bar\nlist:\n  name: item\n  price: 42\n");
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);

  const { output, error } = useMemo(() => {
    try {
      if (!input.trim()) return { output: "", error: null as string | null };
      const parsed = yamlParse(input.trim());
      const formatted = yamlStringify(parsed, {
        indent: indentSize,
        sortMapEntries: sortKeys,
        lineWidth: 0,
      });
      return { output: formatted, error: null as string | null };
    } catch {
      return { output: "", error: "Provided YAML is not valid." };
    }
  }, [input, indentSize, sortKeys]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Switch checked={sortKeys} onCheckedChange={setSortKeys} />
          <Label className="font-mono text-[11px] text-muted-foreground">Sort keys</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] text-muted-foreground">Indent size :</Label>
          <Input type="number" min={1} max={10} value={indentSize} onChange={(e) => setIndentSize(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>

      {error && (
        <div className="text-center font-mono text-xs text-destructive">{error}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel
          label="Your raw YAML"
          value={input}
          onChange={setInput}
          placeholder="Paste your raw YAML here..."
        />
        <IOPanel
          label="Prettified version of your YAML"
          value={output}
          readOnly
        />
      </div>
    </div>
  );
}
