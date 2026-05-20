import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cleanWhitespace } from "@/lib/text-utils";

export default function WhitespaceCleaner() {
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState({
    trimLines: true,
    collapseSpaces: true,
    removeEmptyLines: false,
    trimAll: true,
    tabsToSpaces: 0,
    removeAllWhitespace: false,
  });
  const output = useMemo(() => cleanWhitespace(input, opts), [input, opts]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Toggle label="Trim lines" v={opts.trimLines} on={(v) => setOpts({ ...opts, trimLines: v })} />
        <Toggle label="Collapse spaces" v={opts.collapseSpaces} on={(v) => setOpts({ ...opts, collapseSpaces: v })} />
        <Toggle label="Remove empty lines" v={opts.removeEmptyLines} on={(v) => setOpts({ ...opts, removeEmptyLines: v })} />
        <Toggle label="Trim whole text" v={opts.trimAll} on={(v) => setOpts({ ...opts, trimAll: v })} />
        <Toggle label="Strip all whitespace" v={opts.removeAllWhitespace} on={(v) => setOpts({ ...opts, removeAllWhitespace: v })} />
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">tabs→spaces</Label>
          <Input
            type="number"
            min={0}
            max={16}
            value={opts.tabsToSpaces}
            onChange={(e) => setOpts({ ...opts, tabsToSpaces: Math.max(0, Number(e.target.value) || 0) })}
            className="h-7 w-16 rounded-sm font-mono text-xs"
          />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Paste text…" />
        <IOPanel label="Cleaned" value={output} readOnly />
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
