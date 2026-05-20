import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { indentText } from "@/lib/text-utils";

export default function IndentTool() {
  const [input, setInput] = useState("");
  const [prefix, setPrefix] = useState("  ");
  const [mode, setMode] = useState<"in" | "out">("in");
  const output = useMemo(() => indentText(input, prefix.replace(/\\t/g, "\t"), mode === "out"), [input, prefix, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "in" ? "default" : "ghost"} onClick={() => setMode("in")} className="h-7 rounded-sm font-mono text-[11px]">Indent</Button>
        <Button size="sm" variant={mode === "out" ? "default" : "ghost"} onClick={() => setMode("out")} className="h-7 rounded-sm font-mono text-[11px]">Dedent</Button>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">prefix</Label>
          <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="2 spaces, \t, > " className="h-7 w-32 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
