import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Unit = "C" | "F" | "K";

function convert(value: number, from: Unit) {
  switch (from) {
    case "C": return { C: value, F: value * 9 / 5 + 32, K: value + 273.15 };
    case "F": return { C: (value - 32) * 5 / 9, F: value, K: (value - 32) * 5 / 9 + 273.15 };
    case "K": return { C: value - 273.15, F: (value - 273.15) * 9 / 5 + 32, K: value };
  }
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl text-primary">{value}</div>
    </div>
  );
}

export default function TempConverter() {
  const [value, setValue] = useState("100");
  const [unit, setUnit] = useState<Unit>("C");

  const result = useMemo(() => {
    const n = parseFloat(value);
    if (isNaN(n)) return null;
    if (unit === "K" && n < 0) return null;
    const converted = convert(n, unit);
    return {
      C: converted.C.toFixed(2),
      F: converted.F.toFixed(2),
      K: converted.K.toFixed(2),
    };
  }, [value, unit]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Value</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="h-8 w-28 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">From</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
            <SelectTrigger className="h-7 w-24 rounded-sm font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="C" className="font-mono text-xs">Celsius (°C)</SelectItem>
              <SelectItem value="F" className="font-mono text-xs">Fahrenheit (°F)</SelectItem>
              <SelectItem value="K" className="font-mono text-xs">Kelvin (K)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </OptionRow>
      {result === null ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">Invalid input</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card label="Celsius (°C)" value={result.C + " °C"} />
          <Card label="Fahrenheit (°F)" value={result.F + " °F"} />
          <Card label="Kelvin (K)" value={result.K + " K"} />
        </div>
      )}
    </div>
  );
}
