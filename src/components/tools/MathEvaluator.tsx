import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";
import { evaluate } from "mathjs";

const constantInfo = [
  { symbol: "pi", value: Math.PI, desc: "π" },
  { symbol: "e", value: Math.E, desc: "Euler's number" },
  { symbol: "i", value: "√-1", desc: "Imaginary unit" },
];

export default function MathEvaluator() {
  const [input, setInput] = useState("sin(pi/4)^2 + cos(pi/4)^2");
  const [history, setHistory] = useState<string[]>([]);

  const result = useMemo(() => {
    if (!input.trim()) return { value: null, error: null as string | null };
    try {
      const val = evaluate(input);
      return { value: val, error: null as string | null };
    } catch (e) {
      return { value: null, error: (e as Error).message };
    }
  }, [input]);

  const addToHistory = () => {
    if (result.value !== null && result.value !== undefined) {
      const entry = `${input} = ${result.value}`;
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Constants</Label>
        <div className="flex flex-wrap gap-3">
          {constantInfo.map(({ symbol, value, desc }) => (
            <button
              key={symbol}
              type="button"
              className="font-mono text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-primary"
              onClick={() => setInput((prev) => prev + symbol)}
            >
              {symbol} <span className="text-muted-foreground/50">= {typeof value === "number" ? value.toFixed(6) : value}</span>
            </button>
          ))}
        </div>
      </OptionRow>

      <div className="space-y-1">
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Expression</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your math expression (ex: 2*sqrt(6) )..."
          className="h-8 w-full rounded-sm font-mono text-xs"
        />
      </div>

      {result.error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{result.error}</div>
      ) : result.value !== null ? (
        <div className="rounded-sm border border-border bg-surface px-4 py-3">
          <div className="text-right font-mono text-2xl font-bold text-primary">{typeof result.value === "number" ? result.value.toString() : String(result.value)}</div>
        </div>
      ) : null}

      <OptionRow>
        <Button size="sm" className="h-7 rounded-sm font-mono text-[11px]" disabled={result.value === null} onClick={addToHistory}>Save</Button>
        <Button size="sm" variant="ghost" className="h-7 rounded-sm font-mono text-[11px]" disabled={history.length === 0} onClick={clearHistory}>Clear History</Button>
      </OptionRow>

      {history.length > 0 && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">History (max 50)</div>
          <div className="max-h-48 overflow-auto divide-y divide-border/50">
            {history.map((entry, i) => (
              <button
                key={i}
                type="button"
                className="w-full px-3 py-1.5 text-left font-mono text-[11px] text-muted-foreground hover:bg-background/60 hover:text-foreground"
                onClick={() => setInput(entry.split(" = ")[0])}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
