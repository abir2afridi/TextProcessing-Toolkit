import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parseISO,
  parseJSON,
} from "date-fns";

const ISO8601_REGEX
  = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
const ISO9075_REGEX
  = /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,6})?(([+-])([0-9]{2}):([0-9]{2})|Z)?$/;
const RFC3339_REGEX
  = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,9})?(([+-])([0-9]{2}):([0-9]{2})|Z)$/;
const RFC7231_REGEX = /^[A-Za-z]{3},\s[0-9]{2}\s[A-Za-z]{3}\s[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}\sGMT$/;
const EXCEL_FORMAT_REGEX = /^-?\d+(\.\d+)?$/;

function isISO8601DateTimeString(date?: string) {
  return !!date && ISO8601_REGEX.test(date);
}
function isISO9075DateString(date?: string) {
  return !!date && ISO9075_REGEX.test(date);
}
function isRFC3339DateString(date?: string) {
  return !!date && RFC3339_REGEX.test(date);
}
function isRFC7231DateString(date?: string) {
  return !!date && RFC7231_REGEX.test(date);
}
function isUnixTimestamp(date?: string) {
  return !!date && /^[0-9]{1,10}$/.test(date);
}
function isTimestamp(date?: string) {
  return !!date && /^[0-9]{1,13}$/.test(date);
}
function isUTCDateString(date?: string) {
  if (!date) return false;
  try { return new Date(date).toUTCString() === date; }
  catch { return false; }
}
function isMongoObjectId(date?: string) {
  return !!date && /^[0-9a-fA-F]{24}$/.test(date);
}
function isExcelFormat(date?: string) {
  return !!date && EXCEL_FORMAT_REGEX.test(date);
}

function dateToExcelFormat(date: Date) {
  return String(((date.getTime()) / (1000 * 60 * 60 * 24)) + 25569);
}
function excelFormatToDate(excelFormat: string | number) {
  return new Date((Number(excelFormat) - 25569) * 86400 * 1000);
}
function epochSecToObjectId(sec: number): string {
  return sec.toString(16).padStart(8, "0") + "0000000000000000";
}

interface Format {
  name: string;
  fromDate: (date: Date) => string;
  toDate: (value: string) => Date;
  formatMatcher: (dateString: string) => boolean;
}

const toDate = (date: string) => new Date(date);

const formats: Format[] = [
  { name: "JS locale date string", fromDate: date => date.toString(), toDate, formatMatcher: () => false },
  { name: "ISO 8601", fromDate: formatISO, toDate: parseISO, formatMatcher: isISO8601DateTimeString },
  { name: "ISO 9075", fromDate: formatISO9075, toDate: parseISO, formatMatcher: isISO9075DateString },
  { name: "RFC 3339", fromDate: formatRFC3339, toDate, formatMatcher: isRFC3339DateString },
  { name: "RFC 7231", fromDate: formatRFC7231, toDate, formatMatcher: isRFC7231DateString },
  { name: "Unix timestamp", fromDate: date => String(getUnixTime(date)), toDate: sec => fromUnixTime(+sec), formatMatcher: isUnixTimestamp },
  { name: "Timestamp", fromDate: date => String(getTime(date)), toDate: ms => parseJSON(ms), formatMatcher: isTimestamp },
  { name: "UTC format", fromDate: date => date.toUTCString(), toDate, formatMatcher: isUTCDateString },
  { name: "Mongo ObjectID", fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`, toDate: oid => new Date(Number.parseInt(oid.substring(0, 8), 16) * 1000), formatMatcher: isMongoObjectId },
  { name: "Excel date/time", fromDate: dateToExcelFormat, toDate: excelFormatToDate, formatMatcher: isExcelFormat },
];

interface FormatRow {
  label: string;
  value: string;
}

export default function TimestampConverter() {
  const [input, setInput] = useState("");
  const [formatIndex, setFormatIndex] = useState(6);
  const [now, setNow] = useState(0);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let rafId: number;
    function tick() { setNow(Date.now()); rafId = requestAnimationFrame(tick); }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  function onInputChange(value: string) {
    setInput(value);
    if (value) {
      const matchIndex = formats.findIndex((f) => f.formatMatcher(value));
      if (matchIndex !== -1) {
        setFormatIndex(matchIndex);
      }
    }
  }

  const parsedDate = useMemo(() => {
    if (!input.trim()) return new Date(now);

    try {
      const d = formats[formatIndex].toDate(input.trim());
      if (isDate(d) && isValid(d)) return d;
    } catch { /* fall through */ }

    const fallback = new Date(input.trim());
    if (isValid(fallback)) return fallback;

    return undefined;
  }, [input, formatIndex, now]);

  const isDateValid = parsedDate !== undefined && isDate(parsedDate) && isValid(parsedDate);

  const rows: FormatRow[] = useMemo(() => {
    if (!isDateValid || !parsedDate) return [];
    const d = parsedDate as Date;
    const sec = getUnixTime(d);

    return [
      { label: "JS locale date string", value: d.toString() },
      { label: "ISO 8601", value: formatISO(d) },
      { label: "ISO 9075", value: formatISO9075(d) },
      { label: "RFC 3339", value: formatRFC3339(d) },
      { label: "RFC 7231", value: formatRFC7231(d) },
      { label: "Unix timestamp", value: String(sec) },
      { label: "Timestamp", value: String(getTime(d)) },
      { label: "UTC format", value: d.toUTCString() },
      { label: "Mongo ObjectID", value: epochSecToObjectId(sec) },
      { label: "Excel date/time", value: dateToExcelFormat(d) },
    ];
  }, [parsedDate, isDateValid]);

  const detectedFormat = input.trim() ? formats[formatIndex].name : "";

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex gap-2 flex-1">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Put your date string here..."
            className="h-8 flex-1 rounded-sm font-mono text-xs"
          />
          <select
            value={formatIndex}
            onChange={(e) => setFormatIndex(Number(e.target.value))}
            className="h-8 rounded-sm border border-border bg-surface px-2 font-mono text-[11px] text-foreground"
          >
            {formats.map((f, i) => (
              <option key={f.name} value={i}>{f.name}</option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={() => { setInput(String(Math.floor(Date.now() / 1000))); setFormatIndex(5); }} className="h-8 rounded-sm font-mono text-[11px]">Now (sec)</Button>
        <Button size="sm" onClick={() => { setInput(String(Date.now())); setFormatIndex(6); }} className="h-8 rounded-sm font-mono text-[11px]">Now (ms)</Button>
      </OptionRow>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-sm border border-border bg-surface p-3 font-mono text-[11px] text-muted-foreground">
        <span>Current time: <span className="text-primary">{Math.floor(now / 1000)}</span> sec · <span className="text-primary">{now}</span> ms</span>
        {detectedFormat && (
          <span className="text-[10px]">
            Detected: <span className="text-primary">{detectedFormat}</span>
          </span>
        )}
      </div>
      {!isDateValid && input.trim() && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">This date is invalid for this format</div>
      )}
      {isDateValid && rows.length > 0 && (
        <div className="rounded-sm border border-border bg-surface">
          {rows.length > 6 && (
            <div className="border-b border-border px-3 py-2">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter formats..."
                className="h-7 max-w-64 rounded-sm border-border font-mono text-[10px]"
              />
            </div>
          )}
          <table className="w-full font-mono text-xs">
            <tbody>
              {rows
                .filter((r) => !filter || r.label.toLowerCase().includes(filter.toLowerCase()))
                .map((r) => (
                <tr key={r.label} className="border-b border-border last:border-0">
                  <td className="w-48 px-3 py-2 text-muted-foreground max-sm:w-36">{r.label}</td>
                  <td className="break-all px-3 py-2 text-primary">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
