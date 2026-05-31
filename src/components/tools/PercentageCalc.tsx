import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Card({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      {label && <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:hidden">{label}</div>}
      {children}
    </div>
  );
}

export default function PercentageCalc() {
  const [x, setX] = useState("");
  const [p, setP] = useState("");
  const [y, setY] = useState("");
  const [nX, setNX] = useState("");
  const [nY, setNY] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const pResult = useMemo(() => {
    if (x === "" || p === "") return "";
    const xn = parseFloat(x), pn = parseFloat(p);
    if (isNaN(xn) || isNaN(pn)) return "";
    return (pn / 100 * xn).toString();
  }, [x, p]);

  const nResult = useMemo(() => {
    if (nX === "" || nY === "") return "";
    const xn = parseFloat(nX), yn = parseFloat(nY);
    if (isNaN(xn) || isNaN(yn)) return "";
    const r = 100 * xn / yn;
    return (!isFinite(r) || isNaN(r)) ? "" : r.toString();
  }, [nX, nY]);

  const dResult = useMemo(() => {
    if (from === "" || to === "") return "";
    const fn = parseFloat(from), tn = parseFloat(to);
    if (isNaN(fn) || isNaN(tn)) return "";
    const r = (tn - fn) / fn * 100;
    return (!isFinite(r) || isNaN(r)) ? "" : r.toString();
  }, [from, to]);

  return (
    <div className="mx-auto max-w-[600px] space-y-3">
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="hidden pt-1 font-mono text-[11px] text-muted-foreground sm:block" style={{ minWidth: 48 }}>What is</span>
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:hidden">What is</span>
          <Input type="number" value={x} onChange={(e) => setX(e.target.value)} placeholder="X" className="h-8 rounded-sm font-mono text-xs" />
          <span className="min-w-fit pt-1 font-mono text-[11px] text-muted-foreground">% of</span>
          <Input type="number" value={p} onChange={(e) => setP(e.target.value)} placeholder="Y" className="h-8 rounded-sm font-mono text-xs" />
          <Input value={pResult} readOnly placeholder="Result" className="h-8 max-w-[150px] rounded-sm font-mono text-xs text-primary" />
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:hidden">X is what percent of Y</span>
          <Input type="number" value={nX} onChange={(e) => setNX(e.target.value)} placeholder="X" className="h-8 rounded-sm font-mono text-xs" />
          <span className="hidden pt-1 font-mono text-[11px] text-muted-foreground sm:block">is what percent of</span>
          <Input type="number" value={nY} onChange={(e) => setNY(e.target.value)} placeholder="Y" className="h-8 rounded-sm font-mono text-xs" />
          <Input value={nResult} readOnly placeholder="Result" className="h-8 max-w-[150px] rounded-sm font-mono text-xs text-primary" />
        </div>
      </Card>

      <Card label="What is the percentage increase/decrease">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input type="number" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" className="h-8 rounded-sm font-mono text-xs" />
          <Input type="number" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" className="h-8 rounded-sm font-mono text-xs" />
          <Input value={dResult} readOnly placeholder="Result" className="h-8 max-w-[150px] rounded-sm font-mono text-xs text-primary" />
        </div>
      </Card>
    </div>
  );
}
