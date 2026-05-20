import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";

type DiffType = "added" | "removed" | "changed" | "unchanged";

interface DiffEntry {
  path: string;
  type: DiffType;
  oldValue?: string;
  newValue?: string;
}

function flatten(obj: unknown, path = ""): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null || obj === undefined) { result[path] = String(obj); return result; }
  if (typeof obj !== "object") { result[path] = JSON.stringify(obj); return result; }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => Object.assign(result, flatten(item, `${path}[${i}]`)));
    return result;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    Object.assign(result, flatten(v, path ? `${path}.${k}` : k));
  }
  return result;
}

function diffObjects(a: Record<string, string>, b: Record<string, string>): DiffEntry[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const entries: DiffEntry[] = [];
  for (const key of [...keys].sort()) {
    if (!(key in a)) entries.push({ path: key, type: "added", newValue: b[key] });
    else if (!(key in b)) entries.push({ path: key, type: "removed", oldValue: a[key] });
    else if (a[key] !== b[key]) entries.push({ path: key, type: "changed", oldValue: a[key], newValue: b[key] });
    else entries.push({ path: key, type: "unchanged" });
  }
  return entries;
}

const sampleA = JSON.stringify({ name: "Alice", age: 30, city: "NYC", tags: ["dev", "design"] }, null, 2);
const sampleB = JSON.stringify({ name: "Alice", age: 31, country: "US", tags: ["dev", "pm"] }, null, 2);

export default function JsonDiffViewer() {
  const [left, setLeft] = useState(sampleA);
  const [right, setRight] = useState(sampleB);

  const diffs = useMemo(() => {
    try {
      const a = flatten(JSON.parse(left));
      const b = flatten(JSON.parse(right));
      return diffObjects(a, b);
    } catch { return null; }
  }, [left, right]);

  const changed = diffs?.filter((d) => d.type !== "unchanged") ?? [];

  return (
    <div className="space-y-4">
      <OptionRow>
        <span className="font-mono text-[11px] text-muted-foreground">
          {diffs ? `${changed.length} difference${changed.length !== 1 ? "s" : ""} found` : "Invalid JSON"}
        </span>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Original (A)" value={left} onChange={setLeft} />
        <IOPanel label="Modified (B)" value={right} onChange={setRight} />
      </div>
      {diffs && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Differences
          </div>
          <div className="max-h-[500px] overflow-auto">
            {diffs.map((d, i) => (
              <div
                key={i}
                className={
                  d.type === "added"
                    ? "border-l-2 border-primary bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary"
                    : d.type === "removed"
                    ? "border-l-2 border-destructive bg-destructive/10 px-3 py-1.5 font-mono text-xs text-destructive"
                    : d.type === "changed"
                    ? "border-l-2 border-orange-400 bg-orange-400/10 px-3 py-1.5 font-mono text-xs text-orange-400"
                    : "border-l-2 border-transparent px-3 py-0.5 font-mono text-xs text-muted-foreground/50"
                }
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="select-none text-[10px] opacity-60">
                    {d.type === "added" ? "+" : d.type === "removed" ? "-" : d.type === "changed" ? "~" : " "}
                  </span>
                  <span className="font-semibold">{d.path}</span>
                  {d.type === "removed" && <span className="text-destructive line-through">{d.oldValue}</span>}
                  {d.type === "added" && <span className="text-primary">{d.newValue}</span>}
                  {d.type === "changed" && (
                    <>
                      <span className="text-destructive line-through">{d.oldValue}</span>
                      <span className="text-orange-400">→</span>
                      <span className="text-primary">{d.newValue}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
