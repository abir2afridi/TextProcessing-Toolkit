import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";

type Mode = "xy" | "percent" | "diff";

function ModeCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ResultBox({ value }: { value: string }) {
  return (
    <div className="mt-3 rounded-sm border border-border/60 bg-background px-3 py-2 font-mono text-lg text-primary">{value}</div>
  );
}

export default function PercentageCalc() {
  const [mode, setMode] = useState<Mode>("xy");
  const [x, setX] = useState("20");
  const [y, setY] = useState("80");
  const [p, setP] = useState("15");
  const [v, setV] = useState("200");
  const [a, setA] = useState("50");
  const [b, setB] = useState("80");

  const resultXY = useMemo(() => {
    const xn = parseFloat(x), yn = parseFloat(y);
    if (isNaN(xn) || isNaN(yn) || yn === 0) return null;
    return (xn / yn * 100).toFixed(2) + "%";
  }, [x, y]);

  const resultPercent = useMemo(() => {
    const pn = parseFloat(p), vn = parseFloat(v);
    if (isNaN(pn) || isNaN(vn)) return null;
    return (pn / 100 * vn).toFixed(4);
  }, [p, v]);

  const resultDiff = useMemo(() => {
    const an = parseFloat(a), bn = parseFloat(b);
    if (isNaN(an) || isNaN(bn) || an === 0) return null;
    return (((bn - an) / an) * 100).toFixed(2) + "%";
  }, [a, b]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "xy" ? "default" : "ghost"} onClick={() => setMode("xy")} className="h-7 rounded-sm font-mono text-[11px]">X is ?% of Y</Button>
        <Button size="sm" variant={mode === "percent" ? "default" : "ghost"} onClick={() => setMode("percent")} className="h-7 rounded-sm font-mono text-[11px]">X% of Y = ?</Button>
        <Button size="sm" variant={mode === "diff" ? "default" : "ghost"} onClick={() => setMode("diff")} className="h-7 rounded-sm font-mono text-[11px]">?% Change</Button>
      </OptionRow>
      {mode === "xy" && (
        <ModeCard label="X is what % of Y?">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">X</Label>
              <Input type="number" value={x} onChange={(e) => setX(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Y</Label>
              <Input type="number" value={y} onChange={(e) => setY(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
            </div>
          </div>
          {resultXY !== null && <ResultBox value={x + " is " + resultXY + " of " + y} />}
        </ModeCard>
      )}
      {mode === "percent" && (
        <ModeCard label="X% of Y = ?">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">X%</Label>
              <Input type="number" value={p} onChange={(e) => setP(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Y</Label>
              <Input type="number" value={v} onChange={(e) => setV(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
            </div>
          </div>
          {resultPercent !== null && <ResultBox value={p + "% of " + v + " = " + resultPercent} />}
        </ModeCard>
      )}
      {mode === "diff" && (
        <ModeCard label="What is the % increase/decrease?">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">From</Label>
              <Input type="number" value={a} onChange={(e) => setA(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">To</Label>
              <Input type="number" value={b} onChange={(e) => setB(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
            </div>
          </div>
          {resultDiff !== null && <ResultBox value={"Change from " + a + " to " + b + " = " + resultDiff} />}
        </ModeCard>
      )}
    </div>
  );
}
