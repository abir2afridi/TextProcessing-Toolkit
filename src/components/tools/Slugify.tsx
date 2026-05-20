import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/text-utils";

export default function Slugify() {
  const [input, setInput] = useState("");
  const [sep, setSep] = useState("-");
  const output = useMemo(() => input.split(/\r?\n/).map((l) => slugify(l, sep)).join("\n"), [input, sep]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">separator</Label>
          <Input value={sep} onChange={(e) => setSep(e.target.value || "-")} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Hello World!" />
        <IOPanel label="Slug" value={output} readOnly />
      </div>
    </div>
  );
}
