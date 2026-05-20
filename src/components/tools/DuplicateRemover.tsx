import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dedupeLines, dedupeWords } from "@/lib/text-utils";

export default function DuplicateRemover() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"lines" | "words">("lines");
  const [ci, setCI] = useState(true);
  const [trim, setTrim] = useState(true);
  const [keepBlank, setKeepBlank] = useState(false);

  const result = useMemo(() => {
    if (mode === "lines") return dedupeLines(input, { caseInsensitive: ci, trim, keepBlank });
    return dedupeWords(input, ci);
  }, [input, mode, ci, trim, keepBlank]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "lines" ? "default" : "ghost"} onClick={() => setMode("lines")} className="h-7 rounded-sm font-mono text-[11px]">Duplicate lines</Button>
        <Button size="sm" variant={mode === "words" ? "default" : "ghost"} onClick={() => setMode("words")} className="h-7 rounded-sm font-mono text-[11px]">Duplicate words</Button>
        <Toggle label="Case-insensitive" v={ci} on={setCI} />
        {mode === "lines" && <Toggle label="Trim before compare" v={trim} on={setTrim} />}
        {mode === "lines" && <Toggle label="Keep blank lines" v={keepBlank} on={setKeepBlank} />}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">removed: <span className="text-primary">{result.removed}</span></span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder={mode === "lines" ? "Paste lines…" : "Paste text…"} />
        <IOPanel label="Unique" value={result.text} readOnly />
      </div>
    </div>
  );
}
function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={v} onCheckedChange={on} />
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
    </div>
  );
}
