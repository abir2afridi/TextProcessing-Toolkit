import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { toNATO } from "@/lib/text-utils";

export default function NatoPhonetic() {
  const [input, setInput] = useState("LOVABLE");
  const output = useMemo(() => input.split("\n").map(toNATO).join("\n"), [input]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IOPanel label="Input" value={input} onChange={setInput} />
      <IOPanel label="NATO Phonetic" value={output} readOnly />
    </div>
  );
}
