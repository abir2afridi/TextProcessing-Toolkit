import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { stringEscape } from "@/lib/text-utils";

const FLAVORS = ["json","js","sql","unicode"] as const;

export default function StringEscape() {
  const [input, setInput] = useState("Hello \"world\"\nLine 2");
  const [flavor, setFlavor] = useState<(typeof FLAVORS)[number]>("json");
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const output = useMemo(() => {
    try {
      const key = `${flavor}${mode === "enc" ? "Escape" : "Unescape"}` as keyof typeof stringEscape;
      return stringEscape[key](input);
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, flavor, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {FLAVORS.map((f) => (
          <Button key={f} size="sm" variant={flavor === f ? "default" : "ghost"} onClick={() => setFlavor(f)} className="h-7 rounded-sm font-mono text-[11px] uppercase">{f}</Button>
        ))}
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant={mode === "enc" ? "default" : "ghost"} onClick={() => setMode("enc")} className="h-7 rounded-sm font-mono text-[11px]">Escape</Button>
          <Button size="sm" variant={mode === "dec" ? "default" : "ghost"} onClick={() => setMode("dec")} className="h-7 rounded-sm font-mono text-[11px]">Unescape</Button>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
