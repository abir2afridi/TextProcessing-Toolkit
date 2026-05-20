import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { keywordDensity } from "@/lib/text-utils";

export default function KeywordDensity() {
  const [input, setInput] = useState("");
  const [ngram, setNgram] = useState(1);
  const [stopwords, setStopwords] = useState(true);
  const [min, setMin] = useState(2);
  const rows = useMemo(() => keywordDensity(input, { ngram, stopwords, min }), [input, ngram, stopwords, min]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {[1, 2, 3].map((n) => (
          <Button key={n} size="sm" variant={ngram === n ? "default" : "ghost"} onClick={() => setNgram(n)} className="h-7 rounded-sm font-mono text-[11px]">{n}-gram</Button>
        ))}
        <div className="flex items-center gap-2">
          <Switch checked={stopwords} onCheckedChange={setStopwords} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">skip stopwords</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">min count</Label>
          <Input type="number" min={1} value={min} onChange={(e) => setMin(Math.max(1, +e.target.value || 1))} className="h-7 w-16 rounded-sm font-mono text-xs" />
        </div>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">terms: <span className="text-primary">{rows.length}</span></span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Paste article…" />
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">density</div>
          <div className="max-h-[480px] overflow-auto">
            {rows.length === 0 && <div className="p-4 font-mono text-xs text-muted-foreground">No keywords yet.</div>}
            {rows.map((r) => (
              <div key={r.term} className="flex items-center gap-3 border-b border-border/50 px-3 py-1.5 font-mono text-xs last:border-0">
                <span className="flex-1 truncate text-foreground">{r.term}</span>
                <span className="w-12 text-right text-muted-foreground">×{r.count}</span>
                <span className="w-16 text-right text-primary">{r.density.toFixed(2)}%</span>
                <div className="h-1 w-24 overflow-hidden rounded-sm bg-background">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, r.density * 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
