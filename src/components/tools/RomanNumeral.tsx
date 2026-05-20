import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";

const romanMap: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number): string {
  if (n < 1 || n > 3999) throw new Error("Number must be between 1 and 3999");
  let result = "";
  for (const [val, sym] of romanMap) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

function fromRoman(s: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const cur = map[s[i].toUpperCase()];
    if (!cur) throw new Error(`Invalid Roman numeral character: ${s[i]}`);
    total += cur < prev ? -cur : cur;
    prev = cur;
  }
  if (toRoman(total) !== s.toUpperCase()) throw new Error("Invalid Roman numeral");
  return total;
}

export default function RomanNumeral() {
  const [input, setInput] = useState("42");
  const [mode, setMode] = useState<"n2r" | "r2n">("n2r");
  const output = useMemo(() => {
    try {
      if (mode === "n2r") return toRoman(parseInt(input, 10));
      return String(fromRoman(input));
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "n2r" ? "default" : "ghost"} onClick={() => setMode("n2r")} className="h-7 rounded-sm font-mono text-[11px]">Number → Roman</Button>
        <Button size="sm" variant={mode === "r2n" ? "default" : "ghost"} onClick={() => setMode("r2n")} className="h-7 rounded-sm font-mono text-[11px]">Roman → Number</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "n2r" ? "Number" : "Roman"} value={input} onChange={setInput} />
        <IOPanel label={mode === "n2r" ? "Roman" : "Number"} value={output} readOnly />
      </div>
    </div>
  );
}
