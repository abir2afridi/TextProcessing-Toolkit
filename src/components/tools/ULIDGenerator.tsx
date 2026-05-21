import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateULID } from "@/lib/text-utils";

const formats = [
  { label: "Raw", value: "raw" },
  { label: "JSON", value: "json" },
] as const;
type Format = (typeof formats)[number]["value"];

export default function ULIDGenerator() {
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<Format>("raw");
  const [refreshKey, setRefreshKey] = useState(0);

  const ulids = useMemo(() => {
    const ids = Array.from({ length: count }, generateULID);
    if (format === "json") return JSON.stringify(ids, null, 2);
    return ids.join("\n");
  }, [count, format, refreshKey]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Quantity</Label>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setCount(Math.max(1, count - 1))} className="h-7 w-7 rounded-sm p-0 font-mono text-xs">−</Button>
          <Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden" />
          <Button size="sm" variant="ghost" onClick={() => setCount(Math.min(500, count + 1))} className="h-7 w-7 rounded-sm p-0 font-mono text-xs">+</Button>
        </div>
      </OptionRow>

      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Format</Label>
        <div className="flex gap-1">
          {formats.map((f) => (
            <Button key={f.value} size="sm" variant={format === f.value ? "default" : "ghost"} onClick={() => setFormat(f.value)} className="h-7 rounded-sm font-mono text-[11px]">{f.label}</Button>
          ))}
        </div>
      </OptionRow>

      <IOPanel label="ULIDs" value={ulids} readOnly rows={count > 10 ? 20 : 6} />

      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={() => { navigator.clipboard.writeText(ulids); toast.success("ULIDs copied"); }} className="h-8 rounded-sm font-mono text-[11px]">Copy</Button>
        <Button size="sm" onClick={() => setRefreshKey((k) => k + 1)} className="h-8 rounded-sm font-mono text-[11px]">Refresh</Button>
      </div>
    </div>
  );
}
