import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { wordFrequency } from "@/lib/text-utils";

export default function WordFrequency() {
  const [text, setText] = useState("");
  const list = useMemo(() => wordFrequency(text).slice(0, 200), [text]);
  const max = list[0]?.count || 1;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IOPanel label="Input" value={text} onChange={setText} placeholder="Paste text…" rows={26} />
      <div className="rounded-sm border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
            Top words
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/70">{list.length} unique</span>
        </div>
        <div className="max-h-[600px] overflow-auto">
          {list.length === 0 && <div className="p-6 text-center font-mono text-xs text-muted-foreground/60">no data</div>}
          {list.map((w) => (
            <div key={w.word} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/50 px-3 py-1.5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{w.word}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${(w.count / max) * 100}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs tabular-nums text-primary">{w.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
