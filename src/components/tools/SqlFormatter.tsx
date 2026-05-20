import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { formatSQL } from "@/lib/text-utils";

export default function SqlFormatter() {
  const [input, setInput] = useState("select id, name from users where active = 1 order by name asc limit 10");
  const output = useMemo(() => formatSQL(input), [input]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IOPanel label="Input" value={input} onChange={setInput} />
      <IOPanel label="Formatted" value={output} readOnly />
    </div>
  );
}
