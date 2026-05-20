import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { extractPhones } from "@/lib/text-utils";

export default function PhoneExtractor() {
  const [input, setInput] = useState("Call +1 (415) 555-0132 or 020-7946-0958.\nUS: 415.555.0199  UK: +44 20 7946 0123");
  const [unique, setUnique] = useState(true);
  const list = useMemo(() => extractPhones(input, unique), [input, unique]);
  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Switch checked={unique} onCheckedChange={setUnique} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">unique</Label>
        </div>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">found: <span className="text-primary">{list.length}</span></span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Phones" value={list.join("\n")} readOnly />
      </div>
    </div>
  );
}
