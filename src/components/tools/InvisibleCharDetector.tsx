import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { detectInvisible, removeInvisible, highlightInvisible } from "@/lib/text-utils";

export default function InvisibleCharDetector() {
  const [input, setInput] = useState("Paste suspicious text\u200B here\u00A0to\u200Cscan.");
  const [nbsp, setNbsp] = useState(true);
  const detected = useMemo(() => detectInvisible(input), [input]);
  const cleaned = useMemo(() => removeInvisible(input, nbsp), [input, nbsp]);
  const highlighted = useMemo(() => highlightInvisible(input), [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Switch checked={nbsp} onCheckedChange={setNbsp} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">replace nbsp with space</Label>
        </div>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          hidden chars: <span className="text-primary">{detected.reduce((s, x) => s + x.count, 0)}</span>
        </span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Cleaned" value={cleaned} readOnly />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Highlighted" value={highlighted} readOnly rows={8} />
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">detected</div>
          <div className="max-h-72 overflow-auto">
            {detected.length === 0 && <div className="p-4 font-mono text-xs text-muted-foreground">No invisible characters detected.</div>}
            {detected.map((d) => (
              <div key={d.code} className="flex items-center justify-between border-b border-border/50 px-3 py-1.5 font-mono text-xs last:border-0">
                <span className="text-primary">U+{d.code.toString(16).toUpperCase().padStart(4, "0")}</span>
                <span className="flex-1 px-3 text-muted-foreground">{d.name}</span>
                <span className="text-foreground">×{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
