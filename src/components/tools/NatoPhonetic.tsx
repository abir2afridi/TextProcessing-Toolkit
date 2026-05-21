import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { toNATO } from "@/lib/text-utils";
import { toast } from "sonner";

export default function NatoPhonetic() {
  const [input, setInput] = useState("LOVABLE");
  const output = useMemo(() => input.split("\n").map(toNATO).join("\n"), [input]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Put your text here..."
        />
        <IOPanel label="NATO Phonetic" value={output} readOnly />
      </div>
      <div className="flex justify-center">
        <Button
          size="sm"
          disabled={!output}
          onClick={() => {
            navigator.clipboard.writeText(output);
            toast.success("NATO alphabet string copied.");
          }}
          className="h-8 rounded-sm font-mono text-xs"
        >
          Copy NATO string
        </Button>
      </div>
    </div>
  );
}
