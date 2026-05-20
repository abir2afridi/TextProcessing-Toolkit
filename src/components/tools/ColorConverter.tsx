import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { OptionRow } from "@/components/ToolShell";
import { parseColor } from "@/lib/text-utils";
import { toast } from "sonner";

export default function ColorConverter() {
  const [input, setInput] = useState("#4ade80");
  const { data, error } = useMemo(() => {
    try { return { data: parseColor(input), error: null as string | null }; }
    catch (e) { return { data: null, error: (e as Error).message }; }
  }, [input]);

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Copied " + v); };

  return (
    <div className="space-y-4">
      <OptionRow>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#hex, rgb(), hsl()" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        <input type="color" value={data?.hex ?? "#000000"} onChange={(e) => setInput(e.target.value)} className="h-8 w-12 cursor-pointer rounded-sm border border-border bg-transparent" />
      </OptionRow>
      {error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{error}</div>
      ) : data && (
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="h-48 rounded-sm border border-border" style={{ background: data.hex }} />
          <div className="rounded-sm border border-border bg-surface">
            <table className="w-full font-mono text-xs">
              <tbody>
                {(["hex","hexA","rgb","rgba","hsl","hsla"] as const).map((k) => (
                  <tr key={k} className="border-b border-border last:border-0">
                    <td className="w-24 px-3 py-2 text-muted-foreground">{k}</td>
                    <td className="break-all px-3 py-2 text-primary cursor-pointer hover:bg-background/40" onClick={() => copy(String(data[k]))}>{String(data[k])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
