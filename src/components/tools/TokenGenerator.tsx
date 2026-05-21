import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateToken } from "@/lib/text-utils";
import { toast } from "sonner";

export default function TokenGenerator() {
  const [length, setLength] = useState(64);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: false });
  const [custom, setCustom] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const buildCharset = () => {
    let chars = "";
    if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (opts.digits) chars += "0123456789";
    if (opts.symbols) chars += ".,;:!?./-\"'#{[(-|\\@)]=}*+";
    if (custom) chars += custom;
    return chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  };

  const token = useMemo(() => {
    const chars = buildCharset();
    return generateToken(length, chars);
  }, [length, opts.upper, opts.lower, opts.digits, opts.symbols, custom, refreshKey]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Length</Label>
          <Input type="number" min={1} max={512} value={length} onChange={(e) => setLength(Math.max(1, Math.min(512, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{length}</Label>
          <input type="range" min={1} max={512} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-24" />
        </div>
      </OptionRow>
      <OptionRow>
        <Toggle label="Uppercase (ABC…)" v={opts.upper} on={(v) => setOpts({ ...opts, upper: v })} />
        <Toggle label="Lowercase (abc…)" v={opts.lower} on={(v) => setOpts({ ...opts, lower: v })} />
        <Toggle label="Numbers (123…)" v={opts.digits} on={(v) => setOpts({ ...opts, digits: v })} />
        <Toggle label="Symbols (!-;…)" v={opts.symbols} on={(v) => setOpts({ ...opts, symbols: v })} />
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Custom</Label>
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} className="h-7 w-32 rounded-sm font-mono text-xs" placeholder="chars…" />
        </div>
      </OptionRow>
      <IOPanel label="Token / API Key" value={token} readOnly rows={4} />
      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={() => { navigator.clipboard.writeText(token); toast.success("Copied"); }} className="h-8 rounded-sm font-mono text-[11px]">Copy</Button>
        <Button size="sm" onClick={() => setRefreshKey((k) => k + 1)} className="h-8 rounded-sm font-mono text-[11px]">Refresh</Button>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={v} onCheckedChange={on} />
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
    </div>
  );
}
