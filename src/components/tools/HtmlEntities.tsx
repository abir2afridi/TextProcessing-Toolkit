import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { encoders } from "@/lib/text-utils";

export default function HtmlEntities() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const output = useMemo(() => mode === "enc" ? encoders.htmlEncode(input) : encoders.htmlDecode(input), [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "enc" ? "default" : "ghost"} onClick={() => setMode("enc")} className="h-7 rounded-sm font-mono text-[11px]">Encode</Button>
        <Button size="sm" variant={mode === "dec" ? "default" : "ghost"} onClick={() => setMode("dec")} className="h-7 rounded-sm font-mono text-[11px]">Decode</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
