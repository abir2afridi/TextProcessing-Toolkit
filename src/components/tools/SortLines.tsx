import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { sortLines } from "@/lib/text-utils";

const modes = [
  { id: "asc", label: "A → Z" },
  { id: "desc", label: "Z → A" },
  { id: "len-asc", label: "len ↑" },
  { id: "len-desc", label: "len ↓" },
  { id: "num-asc", label: "num ↑" },
  { id: "num-desc", label: "num ↓" },
  { id: "shuffle", label: "shuffle" },
] as const;

export default function SortLines() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("asc");
  const [ci, setCI] = useState(true);
  const [bump, setBump] = useState(0);
  const output = useMemo(() => sortLines(input, mode, ci), [input, mode, ci, bump]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {modes.map((m) => (
          <Button
            key={m.id}
            size="sm"
            variant={mode === m.id ? "default" : "ghost"}
            onClick={() => { setMode(m.id); if (m.id === "shuffle") setBump((b) => b + 1); }}
            className="h-7 rounded-sm font-mono text-[11px]"
          >
            {m.label}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Switch checked={ci} onCheckedChange={setCI} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">case-insensitive</Label>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="One item per line…" />
        <IOPanel label="Sorted" value={output} readOnly />
      </div>
    </div>
  );
}
