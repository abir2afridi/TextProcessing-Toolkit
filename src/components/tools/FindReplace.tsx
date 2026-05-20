import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { findReplace } from "@/lib/text-utils";

export default function FindReplace() {
  const [input, setInput] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [regex, setRegex] = useState(false);
  const [ci, setCI] = useState(false);
  const [whole, setWhole] = useState(false);

  const result = useMemo(() => {
    try {
      return findReplace(input, find, replace, { regex, flags: ci ? "gi" : "g", caseInsensitive: ci, whole });
    } catch (e) {
      return { text: `[regex error] ${(e as Error).message}`, count: 0 };
    }
  }, [input, find, replace, regex, ci, whole]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Input value={find} onChange={(e) => setFind(e.target.value)} placeholder="find…" className="h-8 w-56 rounded-sm font-mono text-xs" />
        <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="replace with…" className="h-8 w-56 rounded-sm font-mono text-xs" />
        <Toggle label="Regex" v={regex} on={setRegex} />
        <Toggle label="Case-insensitive" v={ci} on={setCI} />
        <Toggle label="Whole word" v={whole} on={setWhole} />
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">replacements: <span className="text-primary">{result.count}</span></span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Result" value={result.text} readOnly />
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
