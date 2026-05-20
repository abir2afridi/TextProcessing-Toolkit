import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { pickRandom } from "@/lib/text-utils";

export default function RandomPicker() {
  const [input, setInput] = useState("alice\nbob\ncarol\ndan");
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [picked, setPicked] = useState("");
  const pick = () => {
    const items = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    setPicked(pickRandom(items, count, unique).join("\n"));
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">pick</Label>
          <Input type="number" min={1} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={unique} onCheckedChange={setUnique} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">unique</Label>
        </div>
        <Button size="sm" onClick={pick} className="ml-auto h-7 rounded-sm font-mono text-[11px]">Pick</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Items (one per line)" value={input} onChange={setInput} />
        <IOPanel label="Picked" value={picked} readOnly />
      </div>
    </div>
  );
}
