import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";

function jsonToXml(obj: unknown, name = "root"): string {
  if (obj === null || obj === undefined) return `<${name}/>`;
  if (typeof obj !== "object") return `<${name}>${String(obj)}</${name}>`;
  if (Array.isArray(obj)) {
    return obj.map((item) => jsonToXml(item, name)).join("\n");
  }
  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length === 0) return `<${name}/>`;
  const attrs = entries.filter(([k]) => k.startsWith("@"));
  const children = entries.filter(([k]) => !k.startsWith("@"));
  const attrStr = attrs.map(([k, v]) => ` ${k.slice(1)}="${String(v)}"`).join("");
  const inner = children.map(([k, v]) => jsonToXml(v, k)).join("\n");
  if (!inner) return `<${name}${attrStr}/>`;
  return `<${name}${attrStr}>\n${inner}\n</${name}>`;
}

export default function JsonToXml() {
  const [input, setInput] = useState('{\n  "note": {\n    "to": "Tove",\n    "from": "Jani",\n    "heading": "Reminder",\n    "body": "Hello!"\n  }\n}');
  const [rootName, setRootName] = useState("root");
  const output = useMemo(() => {
    try { return jsonToXml(JSON.parse(input), rootName || "root"); }
    catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, rootName]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          root element
          <input
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="h-7 w-28 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none"
          />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="JSON Input" value={input} onChange={setInput} />
        <IOPanel label="XML Output" value={output} readOnly />
      </div>
    </div>
  );
}
