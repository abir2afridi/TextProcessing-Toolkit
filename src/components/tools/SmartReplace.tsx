import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { smartReplace, type ReplacePair } from "@/lib/text-utils";

export default function SmartReplace() {
  const [input, setInput] = useState("");
  const [pairs, setPairs] = useState<ReplacePair[]>([
    { find: "", replace: "", regex: false, caseInsensitive: true, enabled: true },
  ]);

  const result = useMemo(() => {
    try {
      return smartReplace(input, pairs);
    } catch (e) {
      return { text: `[error] ${(e as Error).message}`, total: 0, perPair: pairs.map(() => 0) };
    }
  }, [input, pairs]);

  const update = (i: number, patch: Partial<ReplacePair>) =>
    setPairs((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const add = () => setPairs((ps) => [...ps, { find: "", replace: "", regex: false, caseInsensitive: true, enabled: true }]);
  const remove = (i: number) => setPairs((ps) => ps.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">replacement pairs</span>
          <span className="font-mono text-[11px] text-muted-foreground">total: <span className="text-primary">{result.total}</span></span>
        </div>
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Switch checked={p.enabled !== false} onCheckedChange={(v) => update(i, { enabled: v })} />
              <Input value={p.find} onChange={(e) => update(i, { find: e.target.value })} placeholder="find" className="h-8 w-48 rounded-sm font-mono text-xs" />
              <span className="font-mono text-xs text-muted-foreground">→</span>
              <Input value={p.replace} onChange={(e) => update(i, { replace: e.target.value })} placeholder="replace" className="h-8 w-48 rounded-sm font-mono text-xs" />
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Switch checked={!!p.regex} onCheckedChange={(v) => update(i, { regex: v })} /> regex
              </label>
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Switch checked={!!p.caseInsensitive} onCheckedChange={(v) => update(i, { caseInsensitive: v })} /> i
              </label>
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Switch checked={!!p.whole} onCheckedChange={(v) => update(i, { whole: v })} /> w
              </label>
              <span className="font-mono text-[10px] text-primary">{result.perPair[i] ?? 0}×</span>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} className="ml-auto h-7 w-7 p-0"><X className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={add} className="mt-3 h-7 rounded-sm font-mono text-[11px]"><Plus className="mr-1 h-3.5 w-3.5" />Add pair</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Result" value={result.text} readOnly />
      </div>
    </div>
  );
}
