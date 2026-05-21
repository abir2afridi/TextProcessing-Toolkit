import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Label } from "@/components/ui/label";
import { format, type FormatOptionsWithLanguage } from "sql-formatter";

const dialects = [
  "bigquery", "db2", "hive", "mariadb", "mysql", "n1ql",
  "plsql", "postgresql", "redshift", "spark", "sql", "sqlite", "tsql",
] as const;

const keywordCases = ["upper", "lower", "preserve"] as const;
const indentStyles = ["standard", "tabularLeft", "tabularRight"] as const;

export default function SqlFormatter() {
  const [input, setInput] = useState("SELECT * FROM users WHERE id = 1");
  const [dialect, setDialect] = useState("sql");
  const [keywordCase, setKeywordCase] = useState("upper");
  const [indentStyle, setIndentStyle] = useState("standard");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return format(input.trim(), {
        language: dialect as FormatOptionsWithLanguage["language"],
        keywordCase: keywordCase as "upper" | "lower" | "preserve",
        indentStyle: indentStyle as "standard" | "tabularLeft" | "tabularRight",
      });
    } catch {
      return "[error] Invalid SQL";
    }
  }, [input, dialect, keywordCase, indentStyle]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">dialect</Label>
          <select value={dialect} onChange={(e) => setDialect(e.target.value)}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
          >
            {dialects.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">keyword case</Label>
          <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value)}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
          >
            {keywordCases.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">indent style</Label>
          <select value={indentStyle} onChange={(e) => setIndentStyle(e.target.value)}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
          >
            {indentStyles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Your raw SQL" value={input} onChange={setInput} placeholder="Paste your raw SQL here..." />
        <IOPanel label="Pretty version of your SQL" value={output} readOnly />
      </div>
    </div>
  );
}
