import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { wordWrap } from "@/lib/text-utils";

export default function WordWrap() {
  const [input, setInput] = useState("");
  const [width, setWidth] = useState(80);
  const [breakLong, setBL] = useState(true);
  const output = useMemo(() => wordWrap(input, width, breakLong), [input, width, breakLong]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">width</Label>
          <Input type="number" min={1} max={500} value={width} onChange={(e) => setWidth(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={breakLong} onCheckedChange={setBL} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">break long words</Label>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Wrapped" value={output} readOnly />
      </div>
    </div>
  );
}
