import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function fmtDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [String(h).padStart(2, "0"), String(m).padStart(2, "0"), String(s).padStart(2, "0")].join(":");
}

function fmtNow() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtETA(secondsFromNow: number) {
  const d = new Date(Date.now() + secondsFromNow * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-lg text-primary">{value}</div>
    </div>
  );
}

export default function ETACalculator() {
  const [distUnit, setDistUnit] = useState<"km" | "mi">("km");
  const [speedUnit, setSpeedUnit] = useState<"kmh" | "mph">("kmh");
  const [distance, setDistance] = useState("100");
  const [speed, setSpeed] = useState("60");

  const duration = useMemo(() => {
    const d = parseFloat(distance), s = parseFloat(speed);
    if (isNaN(d) || isNaN(s) || s <= 0) return null;
    return (d / s) * 3600;
  }, [distance, speed, distUnit, speedUnit]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Distance</Label>
          <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
          <Select value={distUnit} onValueChange={(v) => setDistUnit(v as "km" | "mi")}>
            <SelectTrigger className="h-7 w-20 rounded-sm font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="km" className="font-mono text-xs">km</SelectItem>
              <SelectItem value="mi" className="font-mono text-xs">miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Speed</Label>
          <Input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} className="h-8 w-24 rounded-sm font-mono text-xs" />
          <Select value={speedUnit} onValueChange={(v) => setSpeedUnit(v as "kmh" | "mph")}>
            <SelectTrigger className="h-7 w-20 rounded-sm font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kmh" className="font-mono text-xs">km/h</SelectItem>
              <SelectItem value="mph" className="font-mono text-xs">mph</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </OptionRow>
      {duration === null ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">Invalid input</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card label="Duration (HH:MM:SS)" value={fmtDuration(duration)} />
          <Card label="Total Minutes" value={(duration / 60).toFixed(1)} />
          <Card label="ETA (approximate)" value={fmtETA(duration)} />
        </div>
      )}
      <div className="rounded-sm border border-border bg-surface px-3 py-2 font-mono text-[11px] text-muted-foreground">
        Current time: {fmtNow()} · ETA: {duration !== null ? fmtETA(duration) : "—"}
      </div>
    </div>
  );
}
