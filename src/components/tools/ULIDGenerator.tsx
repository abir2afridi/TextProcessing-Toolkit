import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateULID } from "@/lib/text-utils";

export default function ULIDGenerator() {
  const [count, setCount] = useState(1);
  const [text, setText] = useState(() => generateULID());

  const generate = () => {
    setText(Array.from({ length: count }, generateULID).join("\n"));
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">count</Label>
          <Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <Button size="sm" onClick={generate} className="h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <IOPanel label="ULIDs" value={text} readOnly rows={count > 10 ? 20 : 6} />
    </div>
  );
}
