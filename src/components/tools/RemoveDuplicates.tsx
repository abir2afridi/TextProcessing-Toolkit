import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { dedupeLines } from "@/lib/text-utils";

export default function RemoveDuplicates() {
  const [input, setInput] = useState("");
  const [caseInsensitive, setCI] = useState(true);
  const [trim, setTrim] = useState(true);
  const [keepBlank, setKeepBlank] = useState(false);

  const result = useMemo(
    () => dedupeLines(input, { caseInsensitive, trim, keepBlank }),
    [input, caseInsensitive, trim, keepBlank],
  );

  return (
    <div className="space-y-4">
      <OptionRow>
        <Toggle label="Case-insensitive" v={caseInsensitive} on={setCI} />
        <Toggle label="Trim before compare" v={trim} on={setTrim} />
        <Toggle label="Keep blank lines" v={keepBlank} on={setKeepBlank} />
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          removed: <span className="text-primary">{result.removed}</span>
        </span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Paste lines…" />
        <IOPanel label="Unique" value={result.text} readOnly />
      </div>
    </div>
  );
}
function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={v} onCheckedChange={on} />
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
    </div>
  );
}
