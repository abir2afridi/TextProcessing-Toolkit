import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { repeatTextAdvanced } from "@/lib/text-utils";

type Mode = "inline" | "line-by-line" | "paragraph";

const MODES: Mode[] = ["inline", "line-by-line", "paragraph"];

export default function TextRepeater() {
  const [input, setInput] = useState("ha");
  const [times, setTimes] = useState(5);
  const [mode, setMode] = useState<Mode>("inline");
  const [sep, setSep] = useState(" ");
  const [randomSep, setRandomSep] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [numbered, setNumbered] = useState(false);

  const output = useMemo(
    () =>
      repeatTextAdvanced(
        input,
        times,
        mode,
        sep.replace(/\\n/g, "\n").replace(/\\t/g, "\t"),
        randomSep,
        prefix,
        suffix,
        numbered,
      ),
    [input, times, mode, sep, randomSep, prefix, suffix, numbered],
  );

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">mode</Label>
          <div className="flex gap-1">
            {MODES.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "default" : "ghost"}
                onClick={() => setMode(m)}
                className="h-7 rounded-sm font-mono text-[11px] uppercase"
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">times</Label>
          <Input
            type="number"
            min={0}
            max={100000}
            value={times}
            onChange={(e) => setTimes(Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
            className="h-7 w-24 rounded-sm font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">separator</Label>
          <Input
            value={sep}
            onChange={(e) => setSep(e.target.value)}
            placeholder='\n for newline'
            className="h-7 w-32 rounded-sm font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={randomSep} onCheckedChange={setRandomSep} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">random sep</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={numbered} onCheckedChange={setNumbered} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">numbered</Label>
        </div>
      </OptionRow>
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">prefix</Label>
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="h-7 w-40 rounded-sm font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">suffix</Label>
          <Input
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            className="h-7 w-40 rounded-sm font-mono text-xs"
          />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Repeated" value={output} readOnly />
      </div>
    </div>
  );
}
