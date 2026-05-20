import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { extractAll, extractPatterns } from "@/lib/text-utils";

const KINDS = Object.keys(extractPatterns) as (keyof typeof extractPatterns)[];

export default function Extractor() {
  const [input, setInput] = useState("Contact me at hello@example.com or visit https://lovable.dev. Server: 192.168.1.1");
  const [kind, setKind] = useState<keyof typeof extractPatterns>("email");
  const [unique, setUnique] = useState(true);
  const output = useMemo(() => extractAll(input, kind, unique).join("\n"), [input, kind, unique]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-wrap gap-1">
          {KINDS.map((k) => (
            <Button key={k} size="sm" variant={kind === k ? "default" : "ghost"} onClick={() => setKind(k)} className="h-7 rounded-sm font-mono text-[11px] capitalize">{k}</Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Switch checked={unique} onCheckedChange={setUnique} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">unique</Label>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label={`Extracted (${output ? output.split("\n").length : 0})`} value={output} readOnly />
      </div>
    </div>
  );
}
