import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NumeronymGen() {
  const [input, setInput] = useState("internationalization accessibility localization");
  const [firstLast, setFirstLast] = useState(true);
  const [count, setCount] = useState(0);
  const [custom, setCustom] = useState("");
  const output = useMemo(() => {
    const words = input.match(/\S+/g) || [];
    const ct = count || undefined;
    return words.map((w) => {
      if (custom) {
        let result = custom;
        const chars = w.split("");
        result = result.replace(/\{w\}/g, w);
        result = result.replace(/\{f\}/g, chars[0] || "");
        result = result.replace(/\{l\}/g, chars[chars.length - 1] || "");
        result = result.replace(/\{m\}/g, w.slice(1, -1));
        if (ct !== undefined) {
          result = result.replace(/\{n\}/g, String(w.length));
          result = result.replace(/\{c\}/g, String(Math.max(0, w.length - 2)));
        }
        return result;
      }
      const len = w.length;
      if (len <= 2) return w;
      const inner = firstLast ? len - 2 : ct !== undefined ? ct : len - 2;
      const first = w[0];
      const last = w[w.length - 1];
      if (firstLast) return `${first}${inner}${last}`;
      if (len <= inner + 1) return w;
      const innerCount = Math.min(inner, len - 1);
      return `${w.slice(0, innerCount)}${len - innerCount}`;
    }).join("\n");
  }, [input, firstLast, count, custom]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Switch checked={firstLast} onCheckedChange={setFirstLast} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">keep first/last</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">inner chars</Label>
          <Input type="number" min={0} max={99} value={count} onChange={(e) => setCount(Number(e.target.value) || 0)} className="h-7 w-16 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">custom</Label>
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="{f}{n}{l}" className="h-7 w-36 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="words" value={input} onChange={setInput} />
        <IOPanel label="numeronyms" value={output} readOnly />
      </div>
    </div>
  );
}
