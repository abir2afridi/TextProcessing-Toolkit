import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import {
  toUpper, toLower, toTitle, toSentence, toCamel, toPascal,
  toSnake, toKebab, toConstant, toDot, alternateCase, inverseCase,
  toHeader, toNo, toPath, toMocking,
} from "@/lib/text-utils";

const ops: { label: string; fn: (s: string) => string }[] = [
  { label: "UPPER CASE", fn: toUpper },
  { label: "lower case", fn: toLower },
  { label: "Title Case", fn: toTitle },
  { label: "Sentence case", fn: toSentence },
  { label: "camelCase", fn: toCamel },
  { label: "PascalCase", fn: toPascal },
  { label: "snake_case", fn: toSnake },
  { label: "kebab-case", fn: toKebab },
  { label: "CONSTANT_CASE", fn: toConstant },
  { label: "dot.case", fn: toDot },
  { label: "aLtErNaTe", fn: alternateCase },
  { label: "iNVERSE", fn: inverseCase },
  { label: "Header-Case", fn: toHeader },
  { label: "no case", fn: toNo },
  { label: "path/case", fn: toPath },
  { label: "MoCkInGcAsE", fn: toMocking },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(0);
  const output = useMemo(() => ops[mode].fn(input), [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 rounded-sm border border-border bg-surface p-2">
        {ops.map((op, i) => (
          <Button
            key={op.label}
            variant={mode === i ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode(i)}
            className="h-7 rounded-sm font-mono text-[11px]"
          >
            {op.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Paste text…" />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
