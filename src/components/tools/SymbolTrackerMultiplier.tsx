import { useState, useMemo, useCallback } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { symbolFrequency, multiplySymbols, multiplySymbolsInLines } from "@/lib/text-utils";

interface BatchGroup {
  id: number;
  symbols: string;
  times: number;
}

interface HistoryEntry {
  id: number;
  label: string;
  timestamp: Date;
  symbols: string;
  times: number;
}

export default function SymbolTrackerMultiplier() {
  const [input, setInput] = useState("Hello!!! World??? Yes... (a+b)*c = $9.99 #100% \u{1F389}\u{1F38A}");
  const [symbols, setSymbols] = useState("!?.");
  const [times, setTimes] = useState(3);
  const [lineStart, setLineStart] = useState(0);
  const [lineEnd, setLineEnd] = useState(0);
  const [lineRangeEnabled, setLineRangeEnabled] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [batchGroups, setBatchGroups] = useState<BatchGroup[]>([]);
  const [batchEnabled, setBatchEnabled] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const freq = useMemo(() => symbolFrequency(input), [input]);

  const maxCount = useMemo(() => Math.max(...freq.map((f) => f.count), 1), [freq]);

  const output = useMemo(() => {
    if (batchEnabled && batchGroups.length > 0) {
      let result = input;
      for (const g of batchGroups) {
        result = lineRangeEnabled && lineEnd > 0
          ? multiplySymbolsInLines(result, g.symbols, g.times, lineStart, lineEnd)
          : multiplySymbols(result, g.symbols, g.times);
      }
      return result;
    }
    if (lineRangeEnabled && lineEnd > 0) {
      return multiplySymbolsInLines(input, symbols, times, lineStart, lineEnd);
    }
    return multiplySymbols(input, symbols, times);
  }, [input, symbols, times, lineStart, lineEnd, lineRangeEnabled, batchEnabled, batchGroups]);

  const pushHistory = useCallback((label: string, sym: string, t: number) => {
    setHistory((prev) => [
      { id: Date.now(), label, timestamp: new Date(), symbols: sym, times: t },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const handleApply = useCallback(() => {
    setInput(output);
    pushHistory(`\u00d7${times} [${symbols}]`, symbols, times);
  }, [output, times, symbols, pushHistory]);

  const handleApplyGlobal = useCallback(() => {
    const global = multiplySymbols(input, symbols, times);
    setInput(global);
    pushHistory(`\u00d7${times} [${symbols}] global`, symbols, times);
  }, [input, symbols, times, pushHistory]);

  const handleRestoreFromHistory = useCallback((entry: HistoryEntry) => {
    setSymbols(entry.symbols);
    setTimes(entry.times);
  }, []);

  const addBatchGroup = () => {
    setBatchGroups((prev) => [...prev, { id: Date.now(), symbols: "", times: 2 }]);
  };

  const removeBatchGroup = (id: number) => {
    setBatchGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const updateBatchGroup = (id: number, field: keyof BatchGroup, value: string | number) => {
    setBatchGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">symbols</Label>
          <Input value={symbols} onChange={(e) => setSymbols(e.target.value)} className="h-8 w-32 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">multiply \u00d7</Label>
          <Input type="number" min={1} max={20} value={times} onChange={(e) => setTimes(Math.max(1, +e.target.value || 1))} className="h-8 w-20 rounded-sm font-mono text-xs" />
        </div>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">unique symbols: <span className="text-primary">{freq.length}</span></span>
      </OptionRow>

      <OptionRow>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Switch id="line-range-toggle" checked={lineRangeEnabled} onCheckedChange={setLineRangeEnabled} />
            <Label htmlFor="line-range-toggle" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">line range</Label>
          </div>
          {lineRangeEnabled && (
            <>
              <div className="flex items-center gap-1">
                <Label className="font-mono text-[10px] text-muted-foreground">from</Label>
                <Input type="number" min={0} value={lineStart} onChange={(e) => setLineStart(Math.max(0, +e.target.value || 0))} className="h-7 w-16 rounded-sm font-mono text-xs" />
              </div>
              <div className="flex items-center gap-1">
                <Label className="font-mono text-[10px] text-muted-foreground">to</Label>
                <Input type="number" min={0} value={lineEnd} onChange={(e) => setLineEnd(Math.max(0, +e.target.value || 0))} className="h-7 w-16 rounded-sm font-mono text-xs" />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Switch id="batch-toggle" checked={batchEnabled} onCheckedChange={setBatchEnabled} />
            <Label htmlFor="batch-toggle" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">batch</Label>
          </div>
          {batchEnabled && (
            <Button variant="outline" size="sm" className="h-7 font-mono text-xs" onClick={addBatchGroup}>+ add group</Button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Switch id="chart-toggle" checked={showChart} onCheckedChange={setShowChart} />
          <Label htmlFor="chart-toggle" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">chart</Label>
        </div>
      </OptionRow>

      {batchEnabled && batchGroups.length > 0 && (
        <div className="space-y-1.5 rounded-sm border border-border bg-surface p-2">
          {batchGroups.map((g) => (
            <div key={g.id} className="flex items-center gap-2">
              <Input value={g.symbols} onChange={(e) => updateBatchGroup(g.id, "symbols", e.target.value)} placeholder="symbols" className="h-7 w-24 rounded-sm font-mono text-xs" />
              <span className="font-mono text-[10px] text-muted-foreground">\u00d7</span>
              <Input type="number" min={1} max={20} value={g.times} onChange={(e) => updateBatchGroup(g.id, "times", Math.max(1, +e.target.value || 1))} className="h-7 w-16 rounded-sm font-mono text-xs" />
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeBatchGroup(g.id)}>
                \u2715
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <div className="relative">
          <IOPanel label="Multiplied (preview)" value={output} readOnly />
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" className="font-mono text-xs" onClick={handleApply}>Apply</Button>
            <Button variant="outline" size="sm" className="font-mono text-xs" onClick={handleApplyGlobal} disabled={input === output}>Apply globally</Button>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">symbol frequency</span>
          <span className="font-mono text-[10px] text-muted-foreground">{freq.length} unique</span>
        </div>
        <div className="max-h-72 overflow-auto p-2">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {freq.map((f) => (
              <button
                key={f.symbol}
                onClick={() => setSymbols((s) => (s.includes(f.symbol) ? s : s + f.symbol))}
                className="rounded-sm border border-border bg-background px-2 py-1 font-mono text-xs hover:border-primary/40"
              >
                <span className="text-primary">{f.symbol}</span>
                <span className="ml-2 text-muted-foreground">\u00d7{f.count}</span>
              </button>
            ))}
            {freq.length === 0 && <span className="font-mono text-xs text-muted-foreground">No symbols found.</span>}
          </div>
          {showChart && freq.length > 0 && (
            <div className="space-y-1 border-t border-border pt-3">
              {freq.slice(0, 20).map((f) => (
                <div key={f.symbol} className="flex items-center gap-2">
                  <span className="w-6 text-center font-mono text-xs text-primary">{f.symbol}</span>
                  <div className="flex-1">
                    <div className="flex h-5 items-center rounded-sm bg-primary/20" style={{ width: `${(f.count / maxCount) * 100}%` }}>
                      <span className="ml-1.5 font-mono text-[10px] text-primary">{f.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">replacement history</div>
          <div className="max-h-40 overflow-auto p-2">
            <div className="flex flex-wrap gap-1.5">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleRestoreFromHistory(h)}
                  className="rounded-sm border border-border bg-background px-2 py-1 font-mono text-[11px] hover:border-primary/40"
                  title="Restore this symbol/times config"
                >
                  <span className="text-muted-foreground">{h.label}</span>
                  <span className="ml-1.5 text-[10px] text-muted-foreground/60">{h.timestamp.toLocaleTimeString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
