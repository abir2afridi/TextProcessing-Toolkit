import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import JSON5 from "json5";

const defaultValue = '{\n\t"hello": [\n\t\t"world"\n\t]\n}';

export default function JsonMinify() {
  const [input, setInput] = useState(defaultValue);

  const { output, error } = useMemo(() => {
    try {
      if (input.trim() === "") return { output: "", error: null as string | null };
      const parsed = JSON5.parse(input);
      return { output: JSON.stringify(parsed, null, 0), error: null as string | null };
    } catch {
      return { output: "", error: "Provided JSON is not valid." };
    }
  }, [input]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-center font-mono text-xs text-destructive">{error}</div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel
          label="Your raw JSON"
          value={input}
          onChange={setInput}
          placeholder="Paste your raw JSON here..."
        />
        <IOPanel
          label="Minified version of your JSON"
          value={output}
          readOnly
        />
      </div>
    </div>
  );
}
