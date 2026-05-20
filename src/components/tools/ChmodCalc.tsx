import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OptionRow } from "@/components/ToolShell";

const levels = ["owner", "group", "others"] as const;
const actions = ["read", "write", "execute"] as const;

const actionChar: Record<string, string> = { read: "r", write: "w", execute: "x" };
const actionVal: Record<string, number> = { read: 4, write: 2, execute: 1 };

function bitsToSym(bits: number[]): string {
  return bits.map((b) => {
    let s = "";
    s += (b & 4) ? "r" : "-";
    s += (b & 2) ? "w" : "-";
    s += (b & 1) ? "x" : "-";
    return s;
  }).join("");
}

function bitsToNum(bits: number[]): string {
  return bits.join("");
}

function symToNum(sym: string): number {
  let n = 0;
  if (sym[0] === "r") n += 4;
  if (sym[1] === "w") n += 2;
  if (sym[2] === "x") n += 1;
  return n;
}

export default function ChmodCalc() {
  const [check, setCheck] = useState<Record<string, boolean>>({
    "owner-read": true, "owner-write": true, "owner-execute": true,
    "group-read": true, "group-write": true, "group-execute": false,
    "others-read": true, "others-write": false, "others-execute": false,
  });
  const [reverse, setReverse] = useState("755");

  const bits = useMemo(() => {
    return levels.map((l) => actions.reduce((acc, a) => acc + (check[`${l}-${a}`] ? actionVal[a] : 0), 0));
  }, [check]);

  const numeric = bitsToNum(bits);
  const symbolic = bitsToSym(bits);

  const parsedReverse = useMemo(() => {
    const s = reverse.trim();
    if (/^[0-7]{3}$/.test(s)) {
      const bs = s.split("").map(Number);
      return { numeric: s, symbolic: bitsToSym(bs), error: null as string | null };
    }
    if (/^[rwx-]{9}$/i.test(s)) {
      const b0 = symToNum(s.slice(0, 3));
      const b1 = symToNum(s.slice(3, 6));
      const b2 = symToNum(s.slice(6, 9));
      return { numeric: `${b0}${b1}${b2}`, symbolic: s.toLowerCase(), error: null as string | null };
    }
    return { numeric: "", symbolic: "", error: "Enter 3-digit octal (e.g. 755) or 9-char symbolic (e.g. rwxr-xr-x)" };
  }, [reverse]);

  const toggle = (l: string, a: string) => {
    setCheck((prev) => ({ ...prev, [`${l}-${a}`]: !prev[`${l}-${a}`] }));
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="grid grid-cols-[auto_repeat(3,1fr)] items-center gap-x-4 gap-y-2">
          <div />
          {actions.map((a) => (
            <Label key={a} className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{a}</Label>
          ))}
          {levels.map((l) => (
            <div key={l} className="contents">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{l}</Label>
              {actions.map((a) => (
                <div key={a} className="flex justify-center">
                  <Checkbox checked={check[`${l}-${a}`]} onCheckedChange={() => toggle(l, a)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">permissions</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-sm bg-background/60 px-3 py-2">
              <span className="font-mono text-[11px] text-muted-foreground">Numeric</span>
              <span className="font-mono text-lg font-bold text-primary">{numeric}</span>
            </div>
            <div className="flex items-center justify-between rounded-sm bg-background/60 px-3 py-2">
              <span className="font-mono text-[11px] text-muted-foreground">Symbolic</span>
              <span className="font-mono text-lg font-bold text-primary">{symbolic}</span>
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-border bg-surface p-4">
          <Label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">reverse (enter octal or symbolic)</Label>
          <Input value={reverse} onChange={(e) => setReverse(e.target.value)} placeholder="755 or rwxr-xr-x" className="mb-2 h-8 rounded-sm font-mono text-xs" />
          {parsedReverse.error ? (
            <p className="font-mono text-[11px] text-destructive">{parsedReverse.error}</p>
          ) : (
            <div className="space-y-1">
              <p className="font-mono text-xs text-primary">{parsedReverse.numeric}</p>
              <p className="font-mono text-xs text-primary">{parsedReverse.symbolic}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
