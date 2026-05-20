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

function fmtIPv4(n: number) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function Card({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={"mt-1 break-all font-mono text-sm text-primary " + (mono ? "" : "")}>{value}</div>
    </div>
  );
}

export default function IPv4Converter() {
  const [mode, setMode] = useState<"ipv4" | "int">("ipv4");
  const [input, setInput] = useState("192.168.1.1");
  const result = useMemo(() => {
    if (mode === "ipv4") {
      const n = validateIPv4(input);
      if (n === null) return { error: "Invalid IPv4 address" };
      return {
        decimal: String(n),
        hex: "0x" + n.toString(16).toUpperCase(),
        binary: n.toString(2).padStart(32, "0"),
        octal: "0o" + n.toString(8),
        integer: String(n),
      };
    } else {
      const n = parseInt(input.trim(), 10);
      if (isNaN(n) || n < 0 || n > 4294967295) return { error: "Integer must be 0–4294967295" };
      const ip = fmtIPv4(n);
      return {
        ipv4: ip,
        decimal: String(n),
        hex: "0x" + n.toString(16).toUpperCase(),
        binary: n.toString(2).padStart(32, "0"),
        octal: "0o" + n.toString(8),
      };
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === "ipv4" ? "default" : "ghost"} onClick={() => setMode("ipv4")} className="h-7 rounded-sm font-mono text-[11px]">IPv4 → Values</Button>
          <Button size="sm" variant={mode === "int" ? "default" : "ghost"} onClick={() => setMode("int")} className="h-7 rounded-sm font-mono text-[11px]">Integer → IPv4</Button>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{mode === "ipv4" ? "IPv4 address" : "Integer"}</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "ipv4" ? "192.168.1.1" : "3232235777"} className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      {typeof result === "object" && "error" in result ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{result.error}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mode === "ipv4" ? (
            <>
              <Card label="Decimal" value={(result as any).decimal} />
              <Card label="Hex" value={(result as any).hex} />
              <Card label="Binary" value={(result as any).binary} />
              <Card label="Octal" value={(result as any).octal} />
              <Card label="Integer" value={(result as any).integer} />
            </>
          ) : (
            <>
              <Card label="IPv4" value={(result as any).ipv4} />
              <Card label="Decimal" value={(result as any).decimal} />
              <Card label="Hex" value={(result as any).hex} />
              <Card label="Binary" value={(result as any).binary} />
              <Card label="Octal" value={(result as any).octal} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
