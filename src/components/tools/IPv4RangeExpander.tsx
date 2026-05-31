import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";

function validateIPv4(s: string) {
  const parts = s.trim().split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function bits2ip(n: number) {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function calculateCidr(startIp: string, endIp: string) {
  const startInt = validateIPv4(startIp);
  const endInt = validateIPv4(endIp);
  if (startInt === null || endInt === null) return null;

  const startBin = startInt.toString(2).padStart(32, "0");
  const endBin = endInt.toString(2).padStart(32, "0");

  const oldSize = endInt - startInt + 1;
  if (oldSize < 1) return null;

  let mask = 32;
  for (let i = 0; i < 32; i++) {
    if (startBin[i] !== endBin[i]) {
      mask = i;
      break;
    }
  }

  const newStartBin = startBin.slice(0, mask).padEnd(32, "0");
  const newEndBin = endBin.slice(0, mask).padEnd(32, "1");
  const newStartInt = Number.parseInt(newStartBin, 2);
  const newEndInt = Number.parseInt(newEndBin, 2);
  const newSize = newEndInt - newStartInt + 1;

  return {
    oldSize,
    newStart: bits2ip(newStartInt),
    newEnd: bits2ip(newEndInt),
    newCidr: `${bits2ip(newStartInt)}/${mask}`,
    newSize,
  };
}

export default function IPv4RangeExpander() {
  const [startIp, setStartIp] = useState("192.168.1.1");
  const [endIp, setEndIp] = useState("192.168.6.255");

  const startValid = validateIPv4(startIp) !== null;
  const endValid = validateIPv4(endIp) !== null;

  const result = useMemo(
    () => (startValid && endValid ? calculateCidr(startIp, endIp) : null),
    [startIp, endIp, startValid, endValid],
  );

  const endBeforeStart = startValid && endValid && result === null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Start address</Label>
          <Input
            value={startIp}
            onChange={(e) => setStartIp(e.target.value)}
            placeholder="Start IPv4 address..."
            className="h-8 rounded-sm font-mono text-xs"
          />
          {!startValid && startIp && (
            <p className="font-mono text-[11px] text-destructive">Invalid IPv4 address</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">End address</Label>
          <Input
            value={endIp}
            onChange={(e) => setEndIp(e.target.value)}
            placeholder="End IPv4 address..."
            className="h-8 rounded-sm font-mono text-xs"
          />
          {!endValid && endIp && (
            <p className="font-mono text-[11px] text-destructive">Invalid IPv4 address</p>
          )}
        </div>
      </div>

      {endBeforeStart ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3">
          <p className="font-mono text-[11px] font-bold text-destructive">Invalid combination of start and end IPv4 address</p>
          <p className="mt-1 font-mono text-[11px] text-destructive/80">
            The end IPv4 address is lower than the start IPv4 address. This is not valid and no result could be calculated.
            In the most cases the solution to solve this problem is to change start and end address.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 h-7 rounded-sm font-mono text-[11px]"
            onClick={() => { const tmp = startIp; setStartIp(endIp); setEndIp(tmp); }}
          >
            Switch start and end IPv4 address
          </Button>
        </div>
      ) : result ? (
        <div className="overflow-auto rounded-sm border border-border">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2">&nbsp;</th>
                <th className="px-3 py-2">old value</th>
                <th className="px-3 py-2">new value</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Start address", oldValue: startIp, newValue: result.newStart },
                { label: "End address", oldValue: endIp, newValue: result.newEnd },
                { label: "Addresses in range", oldValue: result.oldSize.toLocaleString(), newValue: result.newSize.toLocaleString() },
                { label: "CIDR", oldValue: "", newValue: result.newCidr },
              ].map(({ label, oldValue, newValue }) => (
                <tr key={label} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 font-bold text-foreground">{label}</td>
                  <td className="px-3 py-2 text-muted-foreground">{oldValue}</td>
                  <td className="px-3 py-2 text-primary">{newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
