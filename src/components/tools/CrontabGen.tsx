import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IOPanel, OptionRow } from "@/components/ToolShell";

const minuteOpts = ["*", "*/5", "*/10", "*/15", "*/30", "0", "15", "30", "45"];
const hourOpts = ["*", "*/2", "*/6", "*/12", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
const domOpts = ["*", "*/2", "1", "15", "28"];
const monthOpts = ["*", "*/2", "1", "3", "6", "9", "12"];
const dowOpts = ["*", "0", "1", "2", "3", "4", "5", "6", "0-5", "1-5"];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function describeCron(minute: string, hour: string, dom: string, month: string, dow: string): string {
  if (minute === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") return "Every minute";
  if (minute !== "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") return `Every hour at minute ${minute}`;
  if (minute === "0" && hour !== "*" && dom === "*" && month === "*" && dow === "*") return `Every day at ${hour}:00`;
  if (minute !== "*" && hour !== "*" && dom === "*" && month === "*" && dow === "*") return `Every day at ${hour}:${minute.padStart(2, "0")}`;
  if (minute === "0" && hour !== "*" && dom === "*" && month === "*" && dow !== "*") {
    const day = dow === "*" ? "" : dayNames[Number(dow)] || dow;
    return `Every ${day} at ${hour}:00`;
  }
  if (minute === "0" && hour !== "*" && dom !== "*" && month === "*" && dow === "*") return `Day ${dom} of every month at ${hour}:00`;
  if (minute === "0" && hour !== "*" && dom !== "*" && month !== "*" && dow === "*") {
    const m = monthNames[Number(month) - 1] || month;
    return `Day ${dom} of ${m} at ${hour}:00`;
  }

  const parts: string[] = [];
  if (dow !== "*") {
    parts.push(`on ${dayNames[Number(dow)] || dow}`);
  }
  if (dom !== "*") parts.push(`day ${dom}`);
  if (month !== "*") parts.push(`in ${monthNames[Number(month) - 1] || month}`);
  if (hour !== "*") parts.push(`at ${hour}:${minute.padStart(2, "0")}`);
  if (minute !== "*" && hour === "*") parts.push(`minute ${minute}`);

  return parts.length > 0 ? parts.join(" ") : `Minute: ${minute}, Hour: ${hour}, DOM: ${dom}, Month: ${month}, DOW: ${dow}`;
}

export default function CrontabGen() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("6");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");
  const [reverseExp, setReverseExp] = useState("");

  const expression = `${minute} ${hour} ${dom} ${month} ${dow}`;
  const description = describeCron(minute, hour, dom, month, dow);

  const reverseResult = useMemo(() => {
    const s = reverseExp.trim();
    if (!s) return null;
    const parts = s.split(/\s+/);
    if (parts.length !== 5) return "[error] Expected 5 fields (min hour dom mon dow)";
    try {
      const [rm, rh, rdom, rmon, rdow] = parts;
      return describeCron(rm, rh, rdom, rmon, rdow);
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [reverseExp]);

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div className="flex flex-col gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-24 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <OptionRow>
        <SelectField label="minute" value={minute} onChange={setMinute} options={minuteOpts} />
        <SelectField label="hour" value={hour} onChange={setHour} options={hourOpts} />
        <SelectField label="day of month" value={dom} onChange={setDom} options={domOpts} />
        <SelectField label="month" value={month} onChange={setMonth} options={monthOpts} />
        <SelectField label="day of week" value={dow} onChange={setDow} options={dowOpts} />
      </OptionRow>
      <div className="rounded-sm border border-border bg-surface p-4">
        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">cron expression</Label>
        <p className="mt-1 font-mono text-lg font-bold text-primary">{expression}</p>
        <Label className="mt-3 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">description</Label>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{description}</p>
      </div>
      <IOPanel label="reverse: paste cron to parse" value={reverseExp} onChange={setReverseExp} rows={3} />
      {reverseResult && (
        <div className="rounded-sm border border-border bg-surface p-4">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">parsed description</Label>
          <p className="mt-1 font-mono text-sm text-primary">{reverseResult}</p>
        </div>
      )}
    </div>
  );
}
