import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uuidV4 } from "@/lib/text-utils";

export default function UuidGenerator() {
  const [count, setCount] = useState(10);
  const [text, setText] = useState(() => Array.from({ length: 10 }, uuidV4).join("\n"));
  const generate = () => setText(Array.from({ length: count }, uuidV4).join("\n"));

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">count</Label>
          <Input type="number" min={1} max={5000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))} className="h-7 w-24 rounded-sm font-mono text-xs" />
        </div>
        <Button size="sm" onClick={generate} className="h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <IOPanel label="UUIDs v4" value={text} readOnly rows={20} />
    </div>
  );
}
