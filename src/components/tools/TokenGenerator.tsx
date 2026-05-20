import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateToken } from "@/lib/text-utils";

export default function TokenGenerator() {
  const [length, setLength] = useState(32);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: false });
  const [custom, setCustom] = useState("");
  const [token, setToken] = useState(() => generateToken(32));

  const buildCharset = () => {
    let chars = "";
    if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (opts.digits) chars += "0123456789";
    if (opts.symbols) chars += "!@#$%^&*()_-+=<>?";
    if (custom) chars += custom;
    return chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  };

  const generate = () => {
    const chars = buildCharset();
    setToken(generateToken(length, chars));
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Length</Label>
          <Input type="number" min={16} max={128} value={length} onChange={(e) => setLength(Math.max(16, Math.min(128, Number(e.target.value) || 16)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{length}</Label>
          <input type="range" min={16} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-24" />
        </div>
      </OptionRow>
      <OptionRow>
        <Toggle label="A-Z" v={opts.upper} on={(v) => setOpts({ ...opts, upper: v })} />
        <Toggle label="a-z" v={opts.lower} on={(v) => setOpts({ ...opts, lower: v })} />
        <Toggle label="0-9" v={opts.digits} on={(v) => setOpts({ ...opts, digits: v })} />
        <Toggle label="!@#" v={opts.symbols} on={(v) => setOpts({ ...opts, symbols: v })} />
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Custom</Label>
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} className="h-7 w-32 rounded-sm font-mono text-xs" placeholder="chars…" />
        </div>
        <Button size="sm" onClick={generate} className="ml-auto h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <IOPanel label="Token / API Key" value={token} readOnly rows={4} />
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
