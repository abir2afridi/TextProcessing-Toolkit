import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { formatXML } from "@/lib/text-utils";

export default function XmlFormatter() {
  const [input, setInput] = useState("<root><a>1</a><b><c>2</c></b></root>");
  const output = useMemo(() => {
    try { return formatXML(input); } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IOPanel label="Input" value={input} onChange={setInput} />
      <IOPanel label="Formatted" value={output} readOnly />
    </div>
  );
}
