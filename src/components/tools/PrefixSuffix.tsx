import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { affixLines } from "@/lib/text-utils";

export default function PrefixSuffix() {
  const [input, setInput] = useState("");
  const [prefix, setPrefix] = useState("- ");
  const [suffix, setSuffix] = useState("");
  const [skipEmpty, setSkip] = useState(true);
  const output = useMemo(() => affixLines(input, prefix, suffix, skipEmpty), [input, prefix, suffix, skipEmpty]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">prefix</Label>
          <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="h-7 w-40 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">suffix</Label>
          <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} className="h-7 w-40 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={skipEmpty} onCheckedChange={setSkip} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">skip empty lines</Label>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Wrapped" value={output} readOnly />
      </div>
    </div>
  );
}
