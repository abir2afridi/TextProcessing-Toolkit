import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { numberLines } from "@/lib/text-utils";

export default function LineNumbering() {
  const [input, setInput] = useState("");
  const [start, setStart] = useState(1);
  const [pad, setPad] = useState(true);
  const [skipEmpty, setSkip] = useState(false);
  const [sep, setSep] = useState(" │ ");
  const output = useMemo(
    () => numberLines(input, { start, pad, sep, skipEmpty }),
    [input, start, pad, sep, skipEmpty],
  );

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">start</Label>
          <Input type="number" value={start} onChange={(e) => setStart(Number(e.target.value) || 0)} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">separator</Label>
          <Input value={sep} onChange={(e) => setSep(e.target.value)} className="h-7 w-28 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={pad} onCheckedChange={setPad} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">zero-pad</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={skipEmpty} onCheckedChange={setSkip} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">skip empty</Label>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Numbered" value={output} readOnly />
      </div>
    </div>
  );
}
