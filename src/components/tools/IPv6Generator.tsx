import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";
import SHA1 from "crypto-js/sha1";

function validateMAC(s: string) {
  return /^([0-9A-Fa-f]{2}[:. -]?){5}[0-9A-Fa-f]{2}$/.test(s.trim());
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
  const [mac, setMac] = useState("20:37:06:12:34:56");
  const validMAC = validateMAC(mac);

  const ula = useMemo(() => {
    if (!validMAC) return null;
    const timestamp = Date.now();
    const hash = SHA1(timestamp + mac.trim()).toString();
    const hex40bit = hash.substring(30);
    return `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(2, 6)}:${hex40bit.substring(6)}`;
  }, [mac, validMAC]);

  const sections = useMemo(() => {
    if (!ula) return [];
    return [
      { label: "IPv6 ULA:", value: `${ula}::/48` },
      { label: "First routable block:", value: `${ula}:0::/64` },
      { label: "Last routable block:", value: `${ula}:ffff::/64` },
    ];
  }, [ula]);

  const expanded = ula ? expandIPv6(`${ula}::`) : "";
  const compressed = expanded ? compressIPv6(expanded) : "";

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-blue-500/30 bg-blue-500/10 px-4 py-3">
        <p className="font-mono text-[11px] font-bold text-blue-400">Info</p>
        <p className="mt-1 font-mono text-[11px] text-blue-300/80">
          This tool uses the first method suggested by IETF using the current timestamp plus the mac address, sha1 hashed,
          and the lower 40 bits to generate your random ULA.
        </p>
      </div>

      <div className="space-y-1">
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">MAC address:</Label>
        <Input
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          placeholder="Type a MAC address"
          className="h-8 rounded-sm font-mono text-xs"
        />
        {!validMAC && mac && (
          <p className="font-mono text-[11px] text-destructive">Invalid MAC address</p>
        )}
      </div>

      {ula && (
        <>
          <div className="space-y-2">
            {sections.map(({ label, value }) => (
              <OptionRow key={label}>
                <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
                <div className="break-all font-mono text-sm text-primary">{value}</div>
              </OptionRow>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card label="Compressed" value={compressed} />
            <Card label="Expanded" value={expanded} />
          </div>
        </>
      )}
    </div>
  );
}
