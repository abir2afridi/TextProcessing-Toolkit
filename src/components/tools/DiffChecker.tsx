import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { diffLines } from "@/lib/text-utils";

export default function DiffChecker() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const ops = useMemo(() => diffLines(a, b), [a, b]);
  const adds = ops.filter((o) => o.type === "add").length;
  const rems = ops.filter((o) => o.type === "remove").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Original" value={a} onChange={setA} />
        <IOPanel label="Modified" value={b} onChange={setB} />
      </div>
      <div className="rounded-sm border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />Diff</span>
          <span><span className="text-primary">+{adds}</span> <span className="ml-2 text-destructive">-{rems}</span></span>
        </div>
        <div className="max-h-[500px] overflow-auto">
          {ops.map((o, i) => (
            <div
              key={i}
              className={
                o.type === "add"
                  ? "border-l-2 border-primary bg-primary/10 px-3 py-0.5 font-mono text-xs text-primary"
                  : o.type === "remove"
                  ? "border-l-2 border-destructive bg-destructive/10 px-3 py-0.5 font-mono text-xs text-destructive"
                  : "border-l-2 border-transparent px-3 py-0.5 font-mono text-xs text-muted-foreground"
              }
            >
              <span className="mr-2 select-none opacity-60">{o.type === "add" ? "+" : o.type === "remove" ? "-" : " "}</span>
              {o.line || "\u00A0"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
