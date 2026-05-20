import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { graphemes } from "@/lib/text-utils";

export default function UnicodeInspector() {
  const [text, setText] = useState("Hello 👋 mañana");
  const rows = useMemo(() => {
    return graphemes(text).map((g) => {
      const cps = Array.from(g, (c) => c.codePointAt(0)!);
      return {
        g,
        cps,
        hex: cps.map((c) => "U+" + c.toString(16).toUpperCase().padStart(4, "0")).join(" "),
        esc: cps.map((c) => "\\u{" + c.toString(16) + "}").join(""),
        utf8: new TextEncoder().encode(g).length,
      };
    });
  }, [text]);

  return (
    <div className="space-y-4">
      <IOPanel label="Input" value={text} onChange={setText} rows={6} />
      <div className="rounded-sm border border-border bg-surface">
        <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
          {rows.length} graphemes
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full font-mono text-xs">
            <thead className="border-b border-border bg-background/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">char</th>
                <th className="px-3 py-2 text-left">codepoints</th>
                <th className="px-3 py-2 text-left">escape</th>
                <th className="px-3 py-2 text-right">utf-8</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0">
                  <td className="px-3 py-1.5 text-base">{r.g}</td>
                  <td className="px-3 py-1.5 text-primary">{r.hex}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{r.esc}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{r.utf8}b</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
