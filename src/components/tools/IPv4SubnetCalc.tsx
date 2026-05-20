import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";

function parseCIDR(s: string) {
  const m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!m) throw new Error("Invalid format. Use xxx.xxx.xxx.xxx/xx");
  const octets = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];
  if (octets.some((o) => o < 0 || o > 255)) throw new Error("Octets must be 0–255");
  const bits = parseInt(m[5]);
  if (bits < 0 || bits > 32) throw new Error("CIDR prefix must be 0–32");
  const ip = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  const mask = bits === 0 ? 0 : ~0 << (32 - bits);
  const network = ip & mask;
  const broadcast = network | ~mask;
  return { octets, bits, ip, mask: mask >>> 0, network: network >>> 0, broadcast: broadcast >>> 0 };
}

function toOctets(n: number) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

function fmtIP(n: number) {
  return toOctets(n).join(".");
}

function fmtBin(n: number) {
  return toOctets(n).map((o) => o.toString(2).padStart(8, "0")).join(" ");
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-mono text-sm text-primary">{value}</div>
    </div>
  );
}

export default function IPv4SubnetCalc() {
  const [input, setInput] = useState("192.168.1.0/24");
  const result = useMemo(() => {
    try { return { data: parseCIDR(input), error: null as string | null }; }
    catch (e) { return { data: null, error: (e as Error).message }; }
  }, [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">IP / CIDR</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="192.168.1.0/24" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      {result.error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{result.error}</div>
      ) : result.data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Network Address" value={fmtIP(result.data.network)} />
            <Card label="Broadcast Address" value={fmtIP(result.data.broadcast)} />
            <Card label="First Host" value={result.data.bits < 31 ? fmtIP(result.data.network + 1) : "—"} />
            <Card label="Last Host" value={result.data.bits < 31 ? fmtIP(result.data.broadcast - 1) : "—"} />
            <Card label="Total Hosts" value={String(1 << (32 - result.data.bits))} />
            <Card label="Usable Hosts" value={result.data.bits < 31 ? String((1 << (32 - result.data.bits)) - 2) : result.data.bits === 31 ? "2" : (1 << (32 - result.data.bits)).toString()} />
            <Card label="Subnet Mask" value={fmtIP(result.data.mask)} />
            <Card label="Wildcard Mask" value={fmtIP(~result.data.mask >>> 0)} />
          </div>
          <div className="rounded-sm border border-border bg-surface p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Binary Representation</div>
            <div className="space-y-1 font-mono text-[11px] text-primary">
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">IP:</span>
                <span>{fmtBin(result.data.ip)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">Mask:</span>
                <span>{fmtBin(result.data.mask)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">Network:</span>
                <span>{fmtBin(result.data.network)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">Broadcast:</span>
                <span>{fmtBin(result.data.broadcast)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
