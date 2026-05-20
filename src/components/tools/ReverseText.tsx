import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { reverseText } from "@/lib/text-utils";

export default function ReverseText() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chars" | "words" | "lines">("chars");
  const output = useMemo(() => reverseText(input, mode), [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {(["chars", "words", "lines"] as const).map((m) => (
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
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Reversed" value={output} readOnly />
      </div>
    </div>
  );
}
