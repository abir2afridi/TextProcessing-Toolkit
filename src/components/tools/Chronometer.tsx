import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";

function fmtTime(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mm = Math.floor(ms % 1000);
  const hrs = h > 0 ? `${h.toString().padStart(2, "0")}:` : "";
  return `${hrs}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${mm.toString().padStart(3, "0")}`;
}

export default function Chronometer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = useCallback(() => {
    setElapsed(lastRef.current + (performance.now() - startRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    startRef.current = performance.now();
    lastRef.current = elapsed;
    rafRef.current = requestAnimationFrame(tick);
  }, [running, elapsed, tick]);

  const stop = useCallback(() => {
    if (!running) return;
    setRunning(false);
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setElapsed(lastRef.current + (performance.now() - startRef.current));
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setElapsed(0);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    if (!running) return;
    setLaps((prev) => [elapsed, ...prev]);
  }, [running, elapsed]);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-6">
        <div className="text-center font-mono text-[40px] tabular-nums tracking-wider text-primary">{fmtTime(elapsed)}</div>
      </div>
      <OptionRow>
        {!running ? (
          <Button size="sm" onClick={start} className="h-7 rounded-sm font-mono text-[11px]">Start</Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={stop} className="h-7 rounded-sm font-mono text-[11px]">Stop</Button>
        )}
        <Button size="sm" variant="outline" onClick={reset} className="h-7 rounded-sm font-mono text-[11px]">Reset</Button>
        <Button size="sm" variant="outline" onClick={lap} disabled={!running} className="h-7 rounded-sm font-mono text-[11px]">Lap</Button>
      </OptionRow>
      {laps.length > 0 && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lap Times</div>
          <div className="max-h-48 overflow-y-auto">
            {laps.map((t, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border last:border-0 px-3 py-1.5 font-mono text-xs">
                <span className="text-muted-foreground">Lap {laps.length - i}</span>
                <span className="text-primary">{fmtTime(t)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
