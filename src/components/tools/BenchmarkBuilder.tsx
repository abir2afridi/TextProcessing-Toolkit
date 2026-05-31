import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";
import { toast } from "sonner";

interface Suite {
  title: string;
  data: string[];
}

function avg(data: number[]) {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

function variance(data: number[]) {
  const mean = avg(data);
  return avg(data.map((v) => (v - mean) ** 2));
}

function round(v: number) { return Math.round(v * 1000) / 1000; }

export default function BenchmarkBuilder() {
  const [unit, setUnit] = useState("ms");
  const [suites, setSuites] = useState<Suite[]>([
    { title: "Suite 1", data: ["5", "10"] },
    { title: "Suite 2", data: ["8", "12"] },
  ]);

  const results = useMemo(() => {
    const parsed = suites.map((s) => {
      const nums = s.data.map(Number).filter((n) => !isNaN(n));
      return { title: s.title, size: nums.length, mean: avg(nums), variance: variance(nums) };
    }).sort((a, b) => a.mean - b.mean);

    return parsed.map((r, i, arr) => {
      const best = arr[0].mean;
      const cu = unit.trim();
      let comparison = "";
      if (i > 0 && best !== r.mean) {
        const delta = round(r.mean - best);
        const ratio = best === 0 ? "∞" : round(r.mean / best);
        comparison = ` (+${delta}${cu} ; x${ratio})`;
      }
      return {
        position: i + 1,
        title: r.title,
        size: r.size,
        mean: `${round(r.mean)}${cu}${comparison}`,
        variance: `${round(r.variance)}${cu}${cu ? "²" : ""}`,
      };
    });
  }, [suites, unit]);

  const updateSuite = (index: number, field: keyof Suite, value: string | string[]) => {
    setSuites((prev) => {
      const next = prev.map((s) => ({ ...s, data: [...s.data] }));
      if (field === "title") next[index].title = value as string;
      else if (field === "data") next[index].data = value as string[];
      return next;
    });
  };

  const addValue = (si: number) => {
    setSuites((prev) => prev.map((s, i) => i === si ? { ...s, data: [...s.data, ""] } : s));
  };

  const removeValue = (si: number, vi: number) => {
    setSuites((prev) => prev.map((s, i) => i === si ? { ...s, data: s.data.filter((_, j) => j !== vi) } : s));
  };

  const addSuite = (after: number) => {
    setSuites((prev) => {
      const next = [...prev];
      next.splice(after + 1, 0, { title: `Suite ${prev.length + 1}`, data: [""] });
      return next;
    });
  };

  const deleteSuite = (index: number) => {
    setSuites((prev) => prev.filter((_, i) => i !== index));
  };

  const resetSuites = () => {
    setSuites([
      { title: "Suite 1", data: [] },
      { title: "Suite 2", data: [] },
    ]);
  };

  const copyMarkdown = () => {
    const header = "| Position | Suite | Samples | Mean | Variance |";
    const sep = "| --- | --- | --- | --- | --- |";
    const rows = results.map((r) => `| ${r.position} | ${r.title} | ${r.size} | ${r.mean} | ${r.variance} |`).join("\n");
    navigator.clipboard.writeText([header, sep, rows].join("\n"));
    toast("Copied as markdown table");
  };

  const copyBullet = () => {
    const lines = results.flatMap((r) => [
      ` - ${r.title}`,
      `    - Position: ${r.position}`,
      `    - Samples: ${r.size}`,
      `    - Mean: ${r.mean}`,
      `    - Variance: ${r.variance}`,
    ]);
    navigator.clipboard.writeText(lines.join("\n"));
    toast("Copied as bullet list");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {suites.map((suite, si) => (
          <div key={si} className="min-w-[294px] rounded-sm border border-border bg-surface p-4">
            <div className="space-y-1">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Suite name</Label>
              <Input
                value={suite.title}
                onChange={(e) => updateSuite(si, "title", e.target.value)}
                placeholder="Suite name..."
                className="h-8 rounded-sm font-mono text-xs"
              />
            </div>
            <div className="mt-3 space-y-1">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Suite values</Label>
              {suite.data.map((v, vi) => (
                <div key={vi} className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={v}
                    onChange={(e) => {
                      const next = [...suite.data];
                      next[vi] = e.target.value;
                      updateSuite(si, "data", next);
                    }}
                    placeholder="Set your measure..."
                    className="h-8 flex-1 rounded-sm font-mono text-xs"
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 rounded-sm p-0 font-mono text-xs" onClick={() => removeValue(si, vi)}>✕</Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-7 w-full rounded-sm font-mono text-[11px]" onClick={() => addValue(si)}>
                + Add a measure
              </Button>
            </div>
            <div className="mt-2 flex justify-center gap-2">
              {suites.length > 1 && (
                <Button size="sm" variant="ghost" className="h-7 rounded-sm font-mono text-[11px] text-destructive" onClick={() => deleteSuite(si)}>
                  Delete suite
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 rounded-sm font-mono text-[11px]" onClick={() => addSuite(si)}>
                + Add suite
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-sm items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Unit</Label>
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="eg: ms" className="h-7 w-24 rounded-sm font-mono text-xs" />
        </div>
        <Button size="sm" variant="outline" className="h-7 rounded-sm font-mono text-[11px]" onClick={resetSuites}>Reset suites</Button>
      </div>

      {results.length > 0 && (
        <div className="mx-auto max-w-[600px] overflow-auto rounded-sm border border-border">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Suite</th>
                <th className="px-3 py-2">Samples</th>
                <th className="px-3 py-2">Mean</th>
                <th className="px-3 py-2">Variance</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.title} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 text-muted-foreground">{r.position}</td>
                  <td className="px-3 py-2 text-foreground">{r.title}</td>
                  <td className="px-3 py-2">{r.size}</td>
                  <td className="px-3 py-2 text-primary">{r.mean}</td>
                  <td className="px-3 py-2">{r.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" disabled={results.length === 0} onClick={copyMarkdown}>Copy as markdown table</Button>
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" disabled={results.length === 0} onClick={copyBullet}>Copy as bullet list</Button>
      </div>
    </div>
  );
}
