import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";
import { parseTimestamp } from "@/lib/text-utils";

export default function TimestampConverter() {
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  const { data, error } = useMemo(() => {
    try { return { data: parseTimestamp(input), error: null as string | null }; }
    catch (e) { return { data: null, error: (e as Error).message }; }
  }, [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="1700000000 or 2024-01-01T00:00:00Z" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        <Button size="sm" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))} className="h-8 rounded-sm font-mono text-[11px]">Now (sec)</Button>
        <Button size="sm" onClick={() => setInput(String(Date.now()))} className="h-8 rounded-sm font-mono text-[11px]">Now (ms)</Button>
      </OptionRow>
      <div className="rounded-sm border border-border bg-surface p-3 font-mono text-[11px] text-muted-foreground">
        Current time: <span className="text-primary">{Math.floor(now / 1000)}</span> sec · <span className="text-primary">{now}</span> ms
      </div>
      {error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{error}</div>
      ) : data && (
        <div className="rounded-sm border border-border bg-surface">
          <table className="w-full font-mono text-xs">
            <tbody>
              {Object.entries(data).map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-0">
                  <td className="w-40 px-3 py-2 text-muted-foreground">{k}</td>
                  <td className="break-all px-3 py-2 text-primary">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
