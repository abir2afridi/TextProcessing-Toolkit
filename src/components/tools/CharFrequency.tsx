import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { charFrequency } from "@/lib/text-utils";

export default function CharFrequency() {
  const [text, setText] = useState("");
  const [ws, setWs] = useState(false);
  const list = useMemo(() => charFrequency(text, ws).slice(0, 300), [text, ws]);
  const max = list[0]?.count || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2">
        <Switch checked={ws} onCheckedChange={setWs} />
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">include whitespace</Label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={text} onChange={setText} placeholder="Paste text…" rows={26} />
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
            Distribution · {list.length} unique
          </div>
          <div className="max-h-[600px] overflow-auto">
            {list.map((c) => (
              <div key={c.code} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border/50 px-3 py-1 last:border-0 font-mono text-xs">
                <span className="w-10 truncate">{c.char === " " ? "␣" : c.char}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">U+{c.code.toString(16).toUpperCase().padStart(4, "0")}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                </div>
                <span className="tabular-nums text-primary">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
