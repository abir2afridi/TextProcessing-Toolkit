import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { mdToHtml, htmlToMd } from "@/lib/text-utils";

export default function MarkdownHtml() {
  const [input, setInput] = useState("# Hello\n\nThis is **markdown** with `code`.");
  const [mode, setMode] = useState<"md2html" | "html2md">("md2html");
  const output = useMemo(() => mode === "md2html" ? mdToHtml(input) : htmlToMd(input), [input, mode]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "md2html" ? "default" : "ghost"} onClick={() => setMode("md2html")} className="h-7 rounded-sm font-mono text-[11px]">MD → HTML</Button>
        <Button size="sm" variant={mode === "html2md" ? "default" : "ghost"} onClick={() => setMode("html2md")} className="h-7 rounded-sm font-mono text-[11px]">HTML → MD</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label={mode === "md2html" ? "Markdown" : "HTML"} value={input} onChange={setInput} />
        <IOPanel label={mode === "md2html" ? "HTML" : "Markdown"} value={output} readOnly />
      </div>
      {mode === "md2html" && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
            Preview
          </div>
          <div
            className="prose prose-invert max-w-none p-4 [&>*]:my-2 [&_a]:text-primary [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      )}
    </div>
  );
}
