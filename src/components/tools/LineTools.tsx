import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { sortLines, mergeLines, splitByDelimiter } from "@/lib/text-utils";

type Mode = "sort" | "merge" | "split";
const SORTS = [
  { id: "asc", label: "A → Z" },
  { id: "desc", label: "Z → A" },
  { id: "len-asc", label: "len ↑" },
  { id: "len-desc", label: "len ↓" },
  { id: "num-asc", label: "num ↑" },
  { id: "num-desc", label: "num ↓" },
  { id: "shuffle", label: "shuffle" },
] as const;

export default function LineTools() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("sort");
  const [sortMode, setSortMode] = useState<(typeof SORTS)[number]["id"]>("asc");
  const [ci, setCI] = useState(true);
  const [sep, setSep] = useState(", ");
  const [skipEmpty, setSkipEmpty] = useState(true);
  const [delim, setDelim] = useState(",");
  const [regex, setRegex] = useState(false);
  const [bump, setBump] = useState(0);

  const output = useMemo(() => {
    if (mode === "sort") return sortLines(input, sortMode, ci);
    if (mode === "merge") return mergeLines(input, sep.replace(/\\n/g, "\n").replace(/\\t/g, "\t"), skipEmpty);
    return splitByDelimiter(input, delim, regex);
  }, [input, mode, sortMode, ci, sep, skipEmpty, delim, regex, bump]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "sort" ? "default" : "ghost"} onClick={() => setMode("sort")} className="h-7 rounded-sm font-mono text-[11px]">Sort</Button>
        <Button size="sm" variant={mode === "merge" ? "default" : "ghost"} onClick={() => setMode("merge")} className="h-7 rounded-sm font-mono text-[11px]">Merge</Button>
        <Button size="sm" variant={mode === "split" ? "default" : "ghost"} onClick={() => setMode("split")} className="h-7 rounded-sm font-mono text-[11px]">Split</Button>
        <div className="mx-2 h-5 w-px bg-border" />
        {mode === "sort" && (
          <>
            {SORTS.map((s) => (
              <Button key={s.id} size="sm" variant={sortMode === s.id ? "default" : "ghost"} onClick={() => { setSortMode(s.id); if (s.id === "shuffle") setBump((b) => b + 1); }} className="h-7 rounded-sm font-mono text-[11px]">{s.label}</Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Switch checked={ci} onCheckedChange={setCI} />
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">case-insensitive</Label>
            </div>
          </>
        )}
        {mode === "merge" && (
          <>
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">separator</Label>
            <Input value={sep} onChange={(e) => setSep(e.target.value)} className="h-8 w-32 rounded-sm font-mono text-xs" />
            <div className="flex items-center gap-2">
              <Switch checked={skipEmpty} onCheckedChange={setSkipEmpty} />
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">skip empty</Label>
            </div>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">use \n, \t for newline/tab</span>
          </>
        )}
        {mode === "split" && (
          <>
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">delimiter</Label>
            <Input value={delim} onChange={(e) => setDelim(e.target.value)} className="h-8 w-32 rounded-sm font-mono text-xs" />
            <div className="flex items-center gap-2">
              <Switch checked={regex} onCheckedChange={setRegex} />
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">regex</Label>
            </div>
          </>
        )}
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
