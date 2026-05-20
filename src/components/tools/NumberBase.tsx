import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";

const BASES = [
  { name: "Binary", base: 2 },
  { name: "Octal", base: 8 },
  { name: "Decimal", base: 10 },
  { name: "Hex", base: 16 },
];

export default function NumberBase() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const { value, error } = useMemo(() => {
    const s = input.trim().replace(/^0[box]/i, "");
    if (!s) return { value: null, error: null as string | null };
    const n = parseInt(s, fromBase);
    if (Number.isNaN(n) || !new RegExp(`^[0-9a-zA-Z]+$`).test(s)) return { value: null, error: "Invalid digits for base " + fromBase };
    return { value: n, error: null };
  }, [input, fromBase]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">value</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">from base</Label>
          <Input type="number" min={2} max={36} value={fromBase} onChange={(e) => setFromBase(Math.max(2, Math.min(36, Number(e.target.value) || 10)))} className="h-8 w-20 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      {error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{error}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {BASES.map((b) => (
            <div key={b.base} className="rounded-sm border border-border bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{b.name} (base {b.base})</div>
              <div className="mt-1 break-all font-mono text-lg text-primary">{value === null ? "—" : value.toString(b.base)}</div>
            </div>
          ))}
          <div className="rounded-sm border border-border bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Base 36</div>
            <div className="mt-1 break-all font-mono text-lg text-primary">{value === null ? "—" : value.toString(36)}</div>
          </div>
          <div className="rounded-sm border border-border bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bytes (UTF-8)</div>
            <div className="mt-1 break-all font-mono text-lg text-primary">{value === null ? "—" : new TextEncoder().encode(value.toString()).length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
