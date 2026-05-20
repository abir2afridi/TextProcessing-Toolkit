import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";
import { asciiBanner } from "@/lib/text-utils";

export default function AsciiBanner() {
  const [input, setInput] = useState("TPT");
  const output = useMemo(() => asciiBanner(input), [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">text</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} maxLength={20} className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <IOPanel label="Banner" value={output} readOnly rows={6} />
    </div>
  );
}
