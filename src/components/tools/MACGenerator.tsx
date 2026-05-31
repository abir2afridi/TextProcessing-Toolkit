import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

function randByte() { return Math.floor(Math.random() * 256); }

function splitPrefix(prefix: string): string[] {
  const hasSep = /[^0-9a-f]/i.test(prefix);
  const base = hasSep ? prefix.split(/[^0-9a-f]/i) : prefix.match(/.{1,2}/g) ?? [];
  return base.filter(Boolean).map((b) => b.padStart(2, "0"));
}

function makeMAC(prefix: string, separator: string, upper: boolean) {
  const bytes = splitPrefix(prefix);
  const randomNeeded = 6 - bytes.length;
  for (let i = 0; i < randomNeeded; i++) {
    bytes.push(randByte().toString(16).padStart(2, "0"));
  }
  if (prefix && bytes.length < 6) {
    while (bytes.length < 6) bytes.push(randByte().toString(16).padStart(2, "0"));
  }
  const hex = bytes.slice(0, 6).map((h) => (upper ? h.toUpperCase() : h));
  return hex.join(separator);
}

export default function MACGenerator() {
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState("64:16:7F");
  const [upper, setUpper] = useState(true);
  const [separator, setSeparator] = useState(":");
  const [refreshKey, setRefreshKey] = useState(0);

  const separators = [
    { label: ":", value: ":" },
    { label: "-", value: "-" },
    { label: ".", value: "." },
    { label: "None", value: "" },
  ];

  const prefixValid = useMemo(() => {
    if (!prefix) return true;
    const cleaned = prefix.replace(/[^0-9a-f]/gi, "");
    return cleaned.length <= 12 && /^[0-9a-f]*$/i.test(cleaned);
  }, [prefix]);

  const macs = useMemo(() => {
    if (!prefixValid) return "";
    return Array.from({ length: count }, () => makeMAC(prefix, separator, upper)).join("\n");
  }, [count, prefix, separator, upper, prefixValid, refreshKey]);

  const handleCopy = () => {
    if (macs) {
      navigator.clipboard.writeText(macs);
      toast("MAC addresses copied to the clipboard");
    }
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Quantity:</Label>
          <Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>

      <div className="space-y-1">
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">MAC address prefix:</Label>
        <Input
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder='Set a prefix, e.g. 64:16:7F'
          className="h-8 rounded-sm font-mono text-xs"
        />
        {!prefixValid && prefix && (
          <p className="font-mono text-[11px] text-destructive">Invalid MAC prefix</p>
        )}
      </div>

      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Case:</Label>
          <div className="flex gap-1">
            {[
              { label: "Uppercase", value: true },
              { label: "Lowercase", value: false },
            ].map(({ label, value }) => (
              <Button key={label} size="sm" variant={upper === value ? "default" : "ghost"} onClick={() => setUpper(value)} className="h-7 rounded-sm font-mono text-[11px]">{label}</Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Separator:</Label>
          <div className="flex gap-1">
            {separators.map(({ label, value }) => (
              <Button key={label} size="sm" variant={separator === value ? "default" : "ghost"} onClick={() => setSeparator(value)} className="h-7 rounded-sm font-mono text-[11px]">{label}</Button>
            ))}
          </div>
        </div>
      </OptionRow>

      <IOPanel label="MAC Addresses" value={macs} readOnly rows={20} />

      <div className="flex justify-center gap-2">
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" onClick={() => setRefreshKey((k) => k + 1)}>Refresh</Button>
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" disabled={!macs} onClick={handleCopy}>Copy</Button>
      </div>
    </div>
  );
}
