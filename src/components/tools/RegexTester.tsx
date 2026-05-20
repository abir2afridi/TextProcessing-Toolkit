import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");

  const { error, matches, highlighted } = useMemo(() => {
    if (!pattern) return { error: null as string | null, matches: [] as RegExpMatchArray[], highlighted: text };
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const ms: RegExpMatchArray[] = [];
      let m: RegExpExecArray | null;
      let safety = 0;
      while ((m = re.exec(text)) !== null) {
        ms.push(m);
        if (m[0] === "") re.lastIndex++;
        if (++safety > 100000) break;
      }
      let h = "";
      let last = 0;
      for (const mm of ms) {
        const start = mm.index ?? 0;
        h += escapeHtml(text.slice(last, start));
        h += `<mark>${escapeHtml(mm[0])}</mark>`;
        last = start + mm[0].length;
      }
      h += escapeHtml(text.slice(last));
      return { error: null, matches: ms, highlighted: h };
    } catch (e) {
      return { error: (e as Error).message, matches: [], highlighted: escapeHtml(text) };
    }
  }, [pattern, flags, text]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/</Label>
          <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="h-8 flex-1 rounded-sm font-mono text-xs" />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/</Label>
          <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="h-8 w-20 rounded-sm font-mono text-xs" />
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {error ? <span className="text-destructive">{error}</span> : <>matches: <span className="text-primary">{matches.length}</span></>}
        </span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Test string" value={text} onChange={setText} />
        <div className="flex flex-col rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
            Highlighted
          </div>
          <div
            className="min-h-[300px] whitespace-pre-wrap break-words p-3 font-mono text-sm leading-relaxed [&_mark]:rounded-sm [&_mark]:bg-primary/30 [&_mark]:px-0.5 [&_mark]:text-foreground"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: highlighted || "&nbsp;" }}
          />
        </div>
      </div>
      {matches.length > 0 && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            captures
          </div>
          <div className="max-h-72 overflow-auto p-3 font-mono text-xs">
            {matches.map((m, i) => (
              <div key={i} className="border-b border-border/50 py-1.5 last:border-0">
                <span className="text-primary">#{i}</span>{" "}
                <span className="text-muted-foreground">@{m.index}</span>{" "}
                <span>{m[0]}</span>
                {m.slice(1).map((g, gi) => (
                  <span key={gi} className="ml-2 text-muted-foreground">
                    [${gi + 1}={g ?? "—"}]
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
