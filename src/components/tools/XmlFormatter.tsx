import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import xmlFormat from "xml-formatter";

function isValidXML(rawXml: string): boolean {
  if (!rawXml.trim()) return true;
  try {
    xmlFormat(rawXml, { indentation: " ", collapseContent: true, lineSeparator: "\n" });
    return true;
  } catch {
    return false;
  }
}

export default function XmlFormatter() {
  const [input, setInput] = useState("<hello><world>foo</world><world>bar</world></hello>");
  const [indentSize, setIndentSize] = useState(2);
  const [collapseContent, setCollapseContent] = useState(true);

  const { output, error } = useMemo(() => {
    try {
      if (!input.trim()) return { output: "", error: null as string | null };
      const formatted = xmlFormat(input.trim(), {
        indentation: " ".repeat(indentSize),
        collapseContent,
        lineSeparator: "\n",
      });
      return { output: formatted, error: null as string | null };
    } catch {
      return { output: "", error: "Provided XML is not valid." };
    }
  }, [input, indentSize, collapseContent]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Switch checked={collapseContent} onCheckedChange={setCollapseContent} />
          <Label className="font-mono text-[11px] text-muted-foreground">Collapse content</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] text-muted-foreground">Indent size :</Label>
          <Input type="number" min={0} max={10} value={indentSize} onChange={(e) => setIndentSize(Math.max(0, Math.min(10, Number(e.target.value) || 0)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>

      {error && (
        <div className="text-center font-mono text-xs text-destructive">{error}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Your raw XML" value={input} onChange={setInput} placeholder="Paste your raw XML here..." />
        <IOPanel label="Prettified version of your XML" value={output} readOnly />
      </div>
    </div>
  );
}
