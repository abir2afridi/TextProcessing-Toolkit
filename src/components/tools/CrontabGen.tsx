import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import cronstrue from "cronstrue";
import { isValidCron } from "cron-validator";

const minuteOpts = ["*", "*/5", "*/10", "*/15", "*/30", "0", "15", "30", "45"];
const hourOpts = ["*", "*/2", "*/6", "*/12", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
const domOpts = ["*", "*/2", "1", "15", "28"];
const monthOpts = ["*", "*/2", "1", "3", "6", "9", "12"];
const dowOpts = ["*", "0", "1", "2", "3", "4", "5", "6", "0-5", "1-5"];

const helpers = [
  { symbol: "*", meaning: "Any value", example: "* * * * *", equivalent: "Every minute" },
  { symbol: "-", meaning: "Range of values", example: "1-10 * * * *", equivalent: "Minutes 1 through 10" },
  { symbol: ",", meaning: "List of values", example: "1,10 * * * *", equivalent: "At minutes 1 and 10" },
  { symbol: "/", meaning: "Step values", example: "*/10 * * * *", equivalent: "Every 10 minutes" },
  { symbol: "@yearly", meaning: "Once every year at midnight of 1 January", example: "@yearly", equivalent: "0 0 1 1 *" },
  { symbol: "@annually", meaning: "Same as @yearly", example: "@annually", equivalent: "0 0 1 1 *" },
  { symbol: "@monthly", meaning: "Once a month at midnight on the first day", example: "@monthly", equivalent: "0 0 1 * *" },
  { symbol: "@weekly", meaning: "Once a week at midnight on Sunday morning", example: "@weekly", equivalent: "0 0 * * 0" },
  { symbol: "@daily", meaning: "Once a day at midnight", example: "@daily", equivalent: "0 0 * * *" },
  { symbol: "@midnight", meaning: "Same as @daily", example: "@midnight", equivalent: "0 0 * * *" },
  { symbol: "@hourly", meaning: "Once an hour at the beginning of the hour", example: "@hourly", equivalent: "0 * * * *" },
  { symbol: "@reboot", meaning: "Run at startup", example: "", equivalent: "" },
];

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
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
}

export default function CrontabGen() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("6");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");
  const [cronInput, setCronInput] = useState("40 * * * *");
  const [verbose, setVerbose] = useState(true);
  const [use24h, setUse24h] = useState(true);
  const [dayStartZero, setDayStartZero] = useState(true);
  const [reverseExp, setReverseExp] = useState("");

  const expression = `${minute} ${hour} ${dom} ${month} ${dow}`;

  const cronDescription = useMemo(() => {
    const exp = cronInput.trim();
    if (!exp) return " ";
    if (!isValidCron(exp, { allowBlankDay: true, alias: true, seconds: true })) return " ";
    try {
      return cronstrue.toString(exp, {
        verbose,
        use24HourTimeFormat: use24h,
        dayOfWeekStartIndexZero: dayStartZero,
        throwExceptionOnParseError: true,
      });
    } catch {
      return " ";
    }
  }, [cronInput, verbose, use24h, dayStartZero]);

  const fieldDescription = useMemo(() => {
    if (!isValidCron(expression, { allowBlankDay: true, alias: true, seconds: false })) return " ";
    try {
      return cronstrue.toString(expression, {
        verbose,
        use24HourTimeFormat: use24h,
        dayOfWeekStartIndexZero: dayStartZero,
        throwExceptionOnParseError: true,
      });
    } catch {
      return " ";
    }
  }, [expression, verbose, use24h, dayStartZero]);

  const reverseResult = useMemo(() => {
    const s = reverseExp.trim();
    if (!s) return null;
    if (!isValidCron(s, { allowBlankDay: true, alias: true, seconds: false })) return "[error] Invalid cron expression";
    try {
      return cronstrue.toString(s, {
        verbose,
        use24HourTimeFormat: use24h,
        dayOfWeekStartIndexZero: dayStartZero,
        throwExceptionOnParseError: true,
      });
    } catch {
      return "[error] Invalid cron expression";
    }
  }, [reverseExp, verbose, use24h, dayStartZero]);

  const cronValid = cronInput.trim() && isValidCron(cronInput.trim(), { allowBlankDay: true, alias: true, seconds: true });

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-1 text-center font-mono text-xs font-bold text-foreground">Cron expression</div>
        <div className="mx-auto max-w-sm">
          <Input
            value={cronInput}
            onChange={(e) => setCronInput(e.target.value)}
            placeholder="* * * * *"
            className={`h-10 w-full text-center font-mono text-lg tracking-wider ${!cronValid && cronInput.trim() ? "border-destructive" : ""}`}
          />
        </div>
        {!cronValid && cronInput.trim() && (
          <div className="mt-1 text-center font-mono text-[11px] text-destructive">This cron is invalid</div>
        )}
        <div className="mt-2 text-center font-mono text-lg text-foreground/80">{cronDescription}</div>
      </div>

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
        <p className="mt-1 font-mono text-sm text-muted-foreground">{fieldDescription}</p>
      </div>

      <IOPanel label="reverse: paste cron to parse" value={reverseExp} onChange={setReverseExp} rows={3} />
      {reverseResult && (
        <div className="rounded-sm border border-border bg-surface p-4">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">parsed description</Label>
          <p className={`mt-1 font-mono text-sm ${reverseResult.startsWith("[error]") ? "text-destructive" : "text-primary"}`}>{reverseResult}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 rounded-sm border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Switch checked={verbose} onCheckedChange={setVerbose} />
          <Label className="font-mono text-[11px] text-muted-foreground">Verbose</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={use24h} onCheckedChange={setUse24h} />
          <Label className="font-mono text-[11px] text-muted-foreground">Use 24 hour time format</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={dayStartZero} onCheckedChange={setDayStartZero} />
          <Label className="font-mono text-[11px] text-muted-foreground">Days start at 0</Label>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-2 font-mono text-xs font-bold text-foreground">Cron format</div>
        <pre className="overflow-auto font-mono text-[11px] text-muted-foreground">
{`┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command`}
        </pre>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Helpers</div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-muted-foreground">Symbol</th>
                <th className="px-3 py-2 text-left text-muted-foreground">Meaning</th>
                <th className="px-3 py-2 text-left text-muted-foreground">Example</th>
                <th className="px-3 py-2 text-left text-muted-foreground">Equivalent</th>
              </tr>
            </thead>
            <tbody>
              {helpers.map((h) => (
                <tr key={h.symbol} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-bold text-foreground">{h.symbol}</td>
                  <td className="px-3 py-2 text-muted-foreground">{h.meaning}</td>
                  <td className="px-3 py-2 font-mono text-foreground"><code>{h.example}</code></td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{h.equivalent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
