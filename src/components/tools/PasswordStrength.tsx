import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { analyzePasswordStrength } from "@/lib/text-utils";

export default function PasswordStrength() {
  const [input, setInput] = useState("");
  const analysis = useMemo(() => {
    if (!input) return null;
    return analyzePasswordStrength(input);
  }, [input]);

  return (
    <div className="space-y-4">
      <IOPanel label="Password" value={input} onChange={setInput} placeholder="Type a password to analyze…" rows={4} />
      {analysis && (
        <div className="space-y-3 rounded-sm border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Strength</span>
                <span className="font-mono text-xs font-semibold" style={{ color: analysis.color }}>{analysis.label}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full transition-all" style={{ width: `${analysis.score}%`, backgroundColor: analysis.color }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>Score: {analysis.score}/100</span>
            <span>Entropy: {analysis.entropy.toFixed(1)} bits</span>
          </div>
          {analysis.feedback.length > 0 && (
            <div className="space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Suggestions</span>
              <ul className="space-y-0.5">
                {analysis.feedback.map((f, i) => (
                  <li key={i} className="font-mono text-xs text-muted-foreground/80">• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
