import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { countStats } from "@/lib/text-utils";

export default function TextStatistics() {
  const [text, setText] = useState("");
  const stats = useMemo(() => countStats(text), [text]);

  const items: { label: string; value: string | number }[] = [
    { label: "Characters", value: stats.chars },
    { label: "No spaces", value: stats.charsNoSpace },
    { label: "Bytes (UTF-8)", value: stats.bytes },
    { label: "Words", value: stats.words },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Reading time", value: `${stats.readingMinutes} min` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-sm border border-border bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {it.label}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-primary tabular-nums">{it.value}</div>
          </div>
        ))}
      </div>
      <IOPanel label="Text" value={text} onChange={setText} placeholder="Paste text…" rows={20} />
    </div>
  );
}
