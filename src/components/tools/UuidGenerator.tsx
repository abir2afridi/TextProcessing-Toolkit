import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v1 as uuidV1, v3 as uuidV3, v4 as uuidV4, v5 as uuidV5, NIL as nilUuid } from "uuid";

const versions = ["NIL", "v1", "v3", "v4", "v5"] as const;
type Version = (typeof versions)[number];

const namespacePresets: Record<string, string> = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export default function UuidGenerator() {
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(1);
  const [namespace, setNamespace] = useState(namespacePresets.URL);
  const [name, setName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const isV35 = version === "v3" || version === "v5";
  const validNamespace = uuidRegex.test(namespace) || namespace === nilUuid;

  const uuids = useMemo(() => {
    const gen = (index: number): string => {
      switch (version) {
        case "NIL": return nilUuid;
        case "v1": return uuidV1({ clockseq: index, msecs: Date.now(), nsecs: Math.floor(Math.random() * 10000), node: new Uint8Array(Array.from({ length: 6 }, () => Math.floor(Math.random() * 256))) });
        case "v3": return validNamespace ? uuidV3(name, namespace) : "";
        case "v4": return uuidV4();
        case "v5": return validNamespace ? uuidV5(name, namespace) : "";
      }
    };
    return Array.from({ length: count }, (_, i) => gen(i)).join("\n");
  }, [version, count, namespace, name, refreshKey, validNamespace]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">UUID version</Label>
        <div className="flex gap-1">
          {versions.map((v) => (
            <Button key={v} size="sm" variant={version === v ? "default" : "ghost"} onClick={() => setVersion(v)} className="h-7 rounded-sm font-mono text-[11px]">{v}</Button>
          ))}
        </div>
      </OptionRow>

      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Quantity</Label>
        <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="h-7 w-24 rounded-sm font-mono text-xs" />
      </OptionRow>

      {isV35 && (
        <div className="space-y-3 rounded-sm border border-border bg-surface p-3">
          <OptionRow>
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Namespace</Label>
            <div className="flex gap-1">
              {Object.entries(namespacePresets).map(([key, val]) => (
                <Button key={key} size="sm" variant={namespace === val ? "default" : "ghost"} onClick={() => setNamespace(val)} className="h-7 rounded-sm font-mono text-[11px]">{key}</Button>
              ))}
            </div>
          </OptionRow>
          <Input
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            placeholder="Namespace UUID"
            className={`h-8 w-full rounded-sm font-mono text-xs ${!validNamespace && namespace ? "border-destructive" : ""}`}
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-8 w-full rounded-sm font-mono text-xs"
          />
        </div>
      )}

      <IOPanel label={`UUIDs ${version}`} value={uuids} readOnly rows={Math.min(count, 10)} />

      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={() => { navigator.clipboard.writeText(uuids); toast.success("UUIDs copied"); }} className="h-8 rounded-sm font-mono text-[11px]">Copy</Button>
        <Button size="sm" onClick={() => setRefreshKey((k) => k + 1)} className="h-8 rounded-sm font-mono text-[11px]">Refresh</Button>
      </div>
    </div>
  );
}
