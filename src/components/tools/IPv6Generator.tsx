import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";

function randHex(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

function generateULA() {
  const groups: string[] = [];
  groups.push("fd" + randHex(2));
  for (let i = 1; i < 8; i++) groups.push(randHex(4));
  return groups.join(":");
}

function expandIPv6(addr: string) {
  const parts = addr.split(":");
  const expanded: string[] = [];
  for (const p of parts) {
    if (p === "") {
      const missing = 8 - parts.filter((x) => x !== "").length;
      for (let i = 0; i < missing; i++) expanded.push("0000");
    } else {
      expanded.push(p.padStart(4, "0"));
    }
  }
  return expanded.join(":");
}

function compressIPv6(addr: string) {
  const groups = addr.split(":").map((g) => g.replace(/^0+/, "") || "0");
  let bestStart = -1, bestLen = 0;
  let curStart = -1, curLen = 0;
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === "0") {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
    } else {
      curStart = -1; curLen = 0;
    }
  }
  if (bestLen < 2) return groups.join(":");
  return groups.map((g, i) => (i >= bestStart && i < bestStart + bestLen) ? (i === bestStart ? "" : null) : g).filter((x) => x !== null).join(":").replace(/:{2,}/, "::");
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-mono text-sm text-primary">{value}</div>
    </div>
  );
}

export default function IPv6Generator() {
  const [ula, setUla] = useState(generateULA);
  const generate = useCallback(() => setUla(generateULA()), []);
  const expanded = expandIPv6(ula);
  const compressed = compressIPv6(expanded);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" onClick={generate} className="h-7 rounded-sm font-mono text-[11px]">Generate ULA</Button>
        <div className="font-mono text-[11px] text-muted-foreground">fd00::/8 prefix · random global ID + subnet</div>
      </OptionRow>
      <div className="grid gap-3">
        <Card label="Compressed" value={compressed} />
        <Card label="Expanded" value={expanded} />
      </div>
    </div>
  );
}
