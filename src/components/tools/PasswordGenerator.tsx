import { useState, useEffect } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { password } from "@/lib/text-utils";

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [count, setCount] = useState(10);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, ambiguous: false });
  const [text, setText] = useState("");
  const generate = () => setText(Array.from({ length: count }, () => password({ length, ...opts })).join("\n"));
  useEffect(generate, []); // eslint-disable-line

  return (
    <div className="space-y-4">
      <OptionRow>
        <Field label="length" v={length} on={setLength} max={256} />
        <Field label="count" v={count} on={setCount} max={500} />
        <Toggle label="A-Z" v={opts.upper} on={(v) => setOpts({ ...opts, upper: v })} />
        <Toggle label="a-z" v={opts.lower} on={(v) => setOpts({ ...opts, lower: v })} />
        <Toggle label="0-9" v={opts.digits} on={(v) => setOpts({ ...opts, digits: v })} />
        <Toggle label="!@#" v={opts.symbols} on={(v) => setOpts({ ...opts, symbols: v })} />
        <Toggle label="ambiguous" v={opts.ambiguous} on={(v) => setOpts({ ...opts, ambiguous: v })} />
        <Button size="sm" onClick={generate} className="ml-auto h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <IOPanel label="Passwords" value={text} readOnly rows={20} />
    </div>
  );
}
function Field({ label, v, on, max }: { label: string; v: number; on: (n: number) => void; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input type="number" min={1} max={max} value={v} onChange={(e) => on(Math.max(1, Math.min(max, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
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
