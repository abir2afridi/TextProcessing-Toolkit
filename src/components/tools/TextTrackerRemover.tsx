import { useState, useMemo, useRef, useCallback } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trackPattern, findPartialMatches } from "@/lib/text-utils";
import { ChevronUp, ChevronDown } from "lucide-react";

const HIGHLIGHT_COLORS = [
  "bg-yellow-200/70 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700",
  "bg-green-200/70 dark:bg-green-900/40 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700",
  "bg-blue-200/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700",
  "bg-purple-200/70 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700",
  "bg-pink-200/70 dark:bg-pink-900/40 text-pink-900 dark:text-pink-100 border-pink-300 dark:border-pink-700",
  "bg-orange-200/70 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100 border-orange-300 dark:border-orange-700",
  "bg-cyan-200/70 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-100 border-cyan-300 dark:border-cyan-700",
  "bg-red-200/70 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700",
];

export default function TextTrackerRemover() {
  const [input, setInput] = useState("");
  const [pattern, setPattern] = useState("");
  const [regex, setRegex] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [matchCase, setMatchCase] = useState(false);
  const [whole, setWhole] = useState(false);
  const [preserveSpacing, setPreserveSpacing] = useState(false);
  const [smartCleanup, setSmartCleanup] = useState(false);
  const [exactMatchOnly, setExactMatchOnly] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [navIndex, setNavIndex] = useState(0);
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevKey = useRef("");

  const caseInsensitive = ignoreCase && !matchCase;

  const result = useMemo(() => {
    try {
      return trackPattern(input, pattern, {
        regex,
        caseInsensitive,
        whole,
        multiline: true,
        preserveSpacing,
        smartCleanup,
      });
    } catch (e) {
      return { matches: [], count: 0, cleaned: `[error] ${(e as Error).message}` };
    }
  }, [input, pattern, regex, caseInsensitive, whole, preserveSpacing, smartCleanup]);

  const isExact = useCallback(
    (m: { value: string }) =>
      caseInsensitive
        ? m.value.toLowerCase() === pattern.toLowerCase()
        : m.value === pattern,
    [caseInsensitive, pattern]
  );

  const displayedMatches = useMemo(
    () => (exactMatchOnly && pattern ? result.matches.filter(isExact) : result.matches),
    [result.matches, exactMatchOnly, pattern, isExact]
  );

  const displayKey = displayedMatches.map((m) => `${m.index}:${m.value}`).join("|");
  if (displayKey !== prevKey.current) {
    prevKey.current = displayKey;
    setSelectedIndices(new Set(Array.from({ length: displayedMatches.length }, (_, i) => i)));
    setNavIndex(0);
    matchRefs.current = [];
  }

  const cleanedWithSelection = useMemo(() => {
    if (!pattern || selectedIndices.size === 0) return input;
    const toRemove = displayedMatches
      .filter((_, i) => selectedIndices.has(i))
      .sort((a, b) => b.index - a.index);
    let out = input;
    for (const m of toRemove) {
      out =
        out.slice(0, m.index) +
        (preserveSpacing ? " ".repeat(m.value.length) : "") +
        out.slice(m.index + m.value.length);
    }
    if (smartCleanup) {
      out = out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    }
    return out;
  }, [input, pattern, displayedMatches, selectedIndices, preserveSpacing, smartCleanup]);

  const partials = useMemo(() => {
    try {
      return pattern ? findPartialMatches(input, pattern) : [];
    } catch {
      return [];
    }
  }, [input, pattern]);

  const partialsDeduped = useMemo(() => {
    const exactKeys = new Set(displayedMatches.map((m) => `${m.index}:${m.value}`));
    return partials.filter((p) => !exactKeys.has(`${p.index}:${p.value}`));
  }, [partials, displayedMatches]);

  const toggleAll = useCallback(
    (on: boolean) => {
      setSelectedIndices(
        on
          ? new Set(Array.from({ length: displayedMatches.length }, (_, i) => i))
          : new Set()
      );
    },
    [displayedMatches.length]
  );

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= displayedMatches.length) return;
      setNavIndex(idx);
      const el = matchRefs.current[idx];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [displayedMatches.length]
  );

  const toggleSelect = useCallback((idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="word, sentence, or /regex/…"
          className="h-8 w-64 rounded-sm font-mono text-xs"
        />
        <Toggle label="Regex" v={regex} on={setRegex} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Sensitivity
        </span>
        <Toggle label="Ignore case" v={ignoreCase} on={setIgnoreCase} />
        <Toggle label="Match case" v={matchCase} on={setMatchCase} />
        <Toggle label="Whole word" v={whole} on={setWhole} />
        <Toggle label="Exact only" v={exactMatchOnly} on={setExactMatchOnly} />
        <Toggle label="Preserve space" v={preserveSpacing} on={setPreserveSpacing} />
        <Toggle label="Smart cleanup" v={smartCleanup} on={setSmartCleanup} />
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          found:{" "}
          <span className="text-primary">{result.count}</span>
          {exactMatchOnly && pattern && (
            <>
              {" "}· exact: <span className="text-primary">{displayedMatches.length}</span>
            </>
          )}
        </span>
      </OptionRow>

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Paste text…"
        />
        <IOPanel
          label={`Cleaned (${
            selectedIndices.size === 0
              ? "none removed"
              : `${selectedIndices.size} match${selectedIndices.size === 1 ? "" : "es"} removed`
          })`}
          value={cleanedWithSelection}
          readOnly
        />
      </div>

      {displayedMatches.length > 0 && (
        <div className="rounded-sm border border-border bg-surface p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              matches
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {selectedIndices.size}/{displayedMatches.length} selected
              {displayedMatches[navIndex] && (
                <> · position {displayedMatches[navIndex].index}</>
              )}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 font-mono text-[10px]"
                onClick={() => toggleAll(true)}
              >
                all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 font-mono text-[10px]"
                onClick={() => toggleAll(false)}
              >
                none
              </Button>
              <div className="mx-1 h-4 w-px bg-border" />
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={navIndex <= 0}
                onClick={() => goTo(navIndex - 1)}
                title="Previous match"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <span className="min-w-[4ch] text-center font-mono text-[10px] text-muted-foreground">
                {displayedMatches.length > 0 ? navIndex + 1 : 0}/{displayedMatches.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={navIndex >= displayedMatches.length - 1}
                onClick={() => goTo(navIndex + 1)}
                title="Next match"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
            {displayedMatches.map((m, i) => (
              <span
                key={`${m.index}:${m.value}:${i}`}
                ref={(el) => {
                  matchRefs.current[i] = el;
                }}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] transition-colors hover:ring-1 hover:ring-primary/40 ${HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length]} ${
                  navIndex === i ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => goTo(i)}
              >
                <Checkbox
                  checked={selectedIndices.has(i)}
                  onCheckedChange={() => toggleSelect(i)}
                  className="h-3 w-3"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="max-w-[200px] truncate" title={m.value}>
                  {m.value}
                </span>
                <span className="opacity-60">:{m.index}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {partialsDeduped.length > 0 && (
        <div className="rounded-sm border border-border bg-surface p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            partial matches · {partialsDeduped.length} found
          </div>
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {partialsDeduped.slice(0, 100).map((m, i) => (
              <code
                key={`${m.index}:${m.value}:${i}`}
                className="rounded-sm border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {m.value}:{m.index}
              </code>
            ))}
            {partialsDeduped.length > 100 && (
              <span className="font-mono text-[10px] text-muted-foreground">
                …+{partialsDeduped.length - 100} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  v,
  on,
}: {
  label: string;
  v: boolean;
  on: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={v} onCheckedChange={on} />
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}
