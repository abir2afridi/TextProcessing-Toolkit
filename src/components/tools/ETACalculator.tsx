import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { addMilliseconds, formatRelative } from "date-fns";
import { enGB } from "date-fns/locale";

function formatMsDuration(ms: number) {
  if (!ms || !isFinite(ms)) return "—";
  const secs = Math.floor((ms / 1000) % 60);
  const mins = Math.floor((ms / 60000) % 60);
  const hrs = Math.floor(ms / 3600000);
  const parts: string[] = [];
  if (hrs) parts.push(`${hrs}h`);
  if (mins) parts.push(`${mins}m`);
  if (secs) parts.push(`${secs}s`);
  return parts.join(" ") || "0s";
}

const timeUnits = [
  { label: "milliseconds", value: 1 },
  { label: "seconds", value: 1000 },
  { label: "minutes", value: 60000 },
  { label: "hours", value: 3600000 },
  { label: "days", value: 86400000 },
];

export default function ETACalculator() {
  const [unitCount, setUnitCount] = useState(3 * 62);
  const [unitPerTimeSpan, setUnitPerTimeSpan] = useState(3);
  const [timeSpan, setTimeSpan] = useState(5);
  const [timeSpanUnit, setTimeSpanUnit] = useState(60000);

  const durationMs = useMemo(() => {
    const tsMs = timeSpan * timeSpanUnit;
    if (!unitCount || !unitPerTimeSpan || !timeSpan || !tsMs) return 0;
    return unitCount / (unitPerTimeSpan / tsMs);
  }, [unitCount, unitPerTimeSpan, timeSpan, timeSpanUnit]);

  const endAt = useMemo(() => {
    if (!durationMs || !isFinite(durationMs)) return null;
    return formatRelative(addMilliseconds(Date.now(), durationMs), Date.now(), { locale: enGB });
  }, [durationMs]);

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
        With a concrete example, if you wash 5 plates in 3 minutes and you have 500 plates to wash, it will take you 5
        hours to wash them all.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Amount of element to consume</Label>
          <Input type="number" min={1} value={unitCount} onChange={(e) => setUnitCount(Math.max(1, Number(e.target.value) || 1))} className="h-8 rounded-sm font-mono text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">The consumption started at</Label>
          <div className="h-8 rounded-sm border border-border bg-background px-3 font-mono text-xs leading-8 text-muted-foreground">Now</div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Amount of unit consumed by time span</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="number" min={1} value={unitPerTimeSpan} onChange={(e) => setUnitPerTimeSpan(Math.max(1, Number(e.target.value) || 1))} className="h-8 w-24 rounded-sm font-mono text-xs" />
          <span className="font-mono text-[11px] text-muted-foreground">in</span>
          <Input type="number" min={1} value={timeSpan} onChange={(e) => setTimeSpan(Math.max(1, Number(e.target.value) || 1))} className="h-8 w-24 rounded-sm font-mono text-xs" />
          <Select value={String(timeSpanUnit)} onValueChange={(v) => setTimeSpanUnit(Number(v))}>
            <SelectTrigger className="h-8 w-36 rounded-sm font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeUnits.map((u) => (
                <SelectItem key={u.value} value={String(u.value)} className="font-mono text-xs">{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {durationMs > 0 && isFinite(durationMs) ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-border bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total duration</div>
            <div className="mt-1 font-mono text-sm text-primary">{formatMsDuration(durationMs)}</div>
          </div>
          <div className="rounded-sm border border-border bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">It will end</div>
            <div className="mt-1 font-mono text-sm text-primary">{endAt}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
