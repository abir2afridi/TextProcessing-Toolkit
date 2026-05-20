import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { stripHTML } from "@/lib/text-utils";

export default function StripHtml() {
  const [input, setInput] = useState("<p>Hello <strong>world</strong></p><br><div>Line 2</div>");
  const [keepBreaks, setKB] = useState(true);
  const output = useMemo(() => stripHTML(input, keepBreaks), [input, keepBreaks]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Switch checked={keepBreaks} onCheckedChange={setKB} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">preserve line breaks</Label>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="HTML" value={input} onChange={setInput} />
        <IOPanel label="Plain text" value={output} readOnly />
      </div>
    </div>
  );
}
