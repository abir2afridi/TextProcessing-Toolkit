import { useState, useMemo, useCallback } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  analyzeLineSymbols,
  removeSymbolFromLine,
  removeSymbolsGlobal,
  removeEmojis,
  detectEmojis,
} from "@/lib/text-utils";
import { toast } from "sonner";

interface HistoryEntry {
  text: string;
}

export default function SymbolFilterRemove() {
  const [input, setInput] = useState("");
  const [symbols, setSymbols] = useState("#");
  const [removeEmojiMode, setRemoveEmojiMode] = useState(false);
  const [matchAll, setMatchAll] = useState(false);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const rawSymbolResults = useMemo(() => {
    if (!input || !symbols) return [];
    return analyzeLineSymbols(input, symbols);
  }, [input, symbols]);

  const matchAllFiltered = useMemo(() => {
    if (!matchAll || !symbols) return rawSymbolResults;
    const symArr = Array.from(symbols);
    return rawSymbolResults.filter((r) =>
      symArr.every((s) => r.detectedSymbols.includes(s)),
    );
  }, [rawSymbolResults, matchAll, symbols]);

  const emojiAnalysis = useMemo(() => {
    if (!removeEmojiMode || !input) return { lineMap: new Map<number, string[]>(), lineNums: new Set<number>() };
    const lines = input.split(/\r?\n/);
    const lineMap = new Map<number, string[]>();
    const lineNums = new Set<number>();
    lines.forEach((line, i) => {
      const emojis = detectEmojis(line);
      if (emojis.length > 0) {
        const lineNum = i + 1;
        lineNums.add(lineNum);
        lineMap.set(lineNum, emojis.map((e) => e.emoji));
      }
    });
    return { lineMap, lineNums };
  }, [input, removeEmojiMode]);

  const mergedResult = useMemo(() => {
    if (!removeEmojiMode) return matchAllFiltered;
    const lines = input.split(/\r?\n/);
    const symbolLineSet = new Set(matchAllFiltered.map((r) => r.lineNumber));
    const extra: typeof matchAllFiltered = [];
    emojiAnalysis.lineNums.forEach((lineNum) => {
      if (!symbolLineSet.has(lineNum)) {
        const lineText = lines[lineNum - 1];
        const emojis = emojiAnalysis.lineMap.get(lineNum) ?? [];
        const totalCount = detectEmojis(lineText).reduce((s, e) => s + e.count, 0);
        extra.push({
          lineNumber: lineNum,
          text: lineText,
          detectedSymbols: emojis,
          symbolCount: totalCount,
        });
      }
    });
    const enriched = matchAllFiltered.map((r) => {
      if (emojiAnalysis.lineNums.has(r.lineNumber)) {
        const emojis = emojiAnalysis.lineMap.get(r.lineNumber) ?? [];
        const existing = new Set(r.detectedSymbols);
        const combined = [...r.detectedSymbols];
        for (const e of emojis) {
          if (!existing.has(e)) combined.push(e);
        }
        return { ...r, detectedSymbols: combined };
      }
      return r;
    });
    return [...enriched, ...extra];
  }, [matchAllFiltered, emojiAnalysis, removeEmojiMode, input]);

  const filteredResult = useMemo(() => {
    if (!searchQuery) return mergedResult;
    const q = searchQuery.toLowerCase();
    return mergedResult.filter(
      (r) =>
        r.text.toLowerCase().includes(q) ||
        r.detectedSymbols.some((s) => s.toLowerCase().includes(q)),
    );
  }, [mergedResult, searchQuery]);

  const pushHistory = useCallback((text: string) => {
    setHistory((prev) => [...prev, { text }]);
  }, []);

  const applyRemoval = useCallback(
    (text: string, lineIndex?: number): string => {
      let updated = text;
      const hasSymbols = symbols.length > 0;
      if (lineIndex !== undefined && hasSymbols) {
        updated = removeSymbolFromLine(updated, lineIndex, symbols);
      } else if (lineIndex === undefined && hasSymbols) {
        updated = removeSymbolsGlobal(updated, symbols);
      }
      if (removeEmojiMode) {
        updated = removeEmojis(updated);
      }
      return updated;
    },
    [symbols, removeEmojiMode],
  );

  const handleRemoveFromLine = useCallback(
    (lineNumber: number) => {
      if (!symbols && !removeEmojiMode) {
        toast.error("Enter symbols or enable emoji removal");
        return;
      }
      pushHistory(input);
      const updated = applyRemoval(input, lineNumber - 1);
      setInput(updated);
      toast.success(`Removed from line ${lineNumber}`);
    },
    [input, symbols, removeEmojiMode, pushHistory, applyRemoval],
  );

  const handleRemoveGlobal = useCallback(() => {
    if (!symbols && !removeEmojiMode) {
      toast.error("Enter symbols or enable emoji removal");
      return;
    }
    pushHistory(input);
    const updated = applyRemoval(input);
    setInput(updated);
    toast.success("Removed symbols globally");
  }, [input, symbols, removeEmojiMode, pushHistory, applyRemoval]);

  const handleRemoveEmojisOnly = useCallback(() => {
    pushHistory(input);
    const updated = removeEmojis(input);
    setInput(updated);
    toast.success("Removed all emojis");
  }, [input, pushHistory]);

  const handleBulkRemoveSelected = useCallback(() => {
    if (selectedLines.size === 0) {
      toast.error("No lines selected");
      return;
    }
    if (!symbols && !removeEmojiMode) {
      toast.error("Enter symbols or enable emoji removal");
      return;
    }
    pushHistory(input);
    let text = input;
    const sorted = Array.from(selectedLines).sort((a, b) => b - a);
    for (const lineNum of sorted) {
      text = applyRemoval(text, lineNum - 1);
    }
    setInput(text);
    setSelectedLines(new Set());
    toast.success(`Removed from ${sorted.length} line(s)`);
  }, [input, symbols, removeEmojiMode, selectedLines, pushHistory, applyRemoval]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      toast.error("Nothing to undo");
      return;
    }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setInput(prev.text);
    toast.success("Restored previous state");
  }, [history]);

  const toggleLine = useCallback((lineNumber: number) => {
    setSelectedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineNumber)) next.delete(lineNumber);
      else next.add(lineNumber);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedLines(new Set(filteredResult.map((r) => r.lineNumber)));
  }, [filteredResult]);

  const selectNone = useCallback(() => {
    setSelectedLines(new Set());
  }, []);

  const handleExport = useCallback(() => {
    if (filteredResult.length === 0) {
      toast.error("No lines to export");
      return;
    }
    const lines = filteredResult.map(
      (r) =>
        `[L${r.lineNumber}] ${r.text}  (symbols: ${r.detectedSymbols.join(", ")}, count: ${r.symbolCount})`,
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered-symbols.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported filtered lines");
  }, [filteredResult]);

  const allSelected =
    filteredResult.length > 0 && selectedLines.size === filteredResult.length;

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            symbols
          </Label>
          <Input
            value={symbols}
            onChange={(e) => setSymbols(e.target.value)}
            placeholder="#@!😂"
            className="h-8 w-36 rounded-sm font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={matchAll} onCheckedChange={setMatchAll} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            match all
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={removeEmojiMode} onCheckedChange={setRemoveEmojiMode} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            rm emoji
          </Label>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRemoveGlobal}
          disabled={!symbols && !removeEmojiMode}
          className="h-7 rounded-sm font-mono text-[11px]"
        >
          Remove global
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRemoveEmojisOnly}
          className="h-7 rounded-sm font-mono text-[11px]"
        >
          Remove all emojis
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleUndo}
          disabled={history.length === 0}
          className="h-7 rounded-sm font-mono text-[11px]"
        >
          Undo ({history.length})
        </Button>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          affected: <span className="text-primary">{mergedResult.length}</span>
        </span>
      </OptionRow>

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Enter text with symbols…"
        />
        <div className="flex flex-col gap-3">
          <OptionRow>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                search
              </Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter results…"
                className="h-8 w-48 rounded-sm font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={selectAll}
                className="h-7 rounded-sm font-mono text-[11px]"
              >
                All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={selectNone}
                className="h-7 rounded-sm font-mono text-[11px]"
              >
                None
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRemoveSelected}
              disabled={selectedLines.size === 0}
              className="h-7 rounded-sm font-mono text-[11px]"
            >
              Remove sel. ({selectedLines.size})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={filteredResult.length === 0}
              className="h-7 rounded-sm font-mono text-[11px]"
            >
              Export TXT
            </Button>
          </OptionRow>

          <div className="max-h-[500px] overflow-auto rounded-sm border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => (allSelected ? selectNone() : selectAll())}
                    />
                  </TableHead>
                  <TableHead className="w-16 font-mono text-[10px] uppercase">
                    Line
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">
                    Sentence
                  </TableHead>
                  <TableHead className="w-32 font-mono text-[10px] uppercase">
                    Symbol
                  </TableHead>
                  <TableHead className="w-20 font-mono text-[10px] uppercase">
                    Count
                  </TableHead>
                  <TableHead className="w-36 font-mono text-[10px] uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResult.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center font-mono text-xs text-muted-foreground"
                    >
                      {input
                        ? "No matching lines found"
                        : "Enter text to start analyzing"}
                    </TableCell>
                  </TableRow>
                )}
                {filteredResult.map((row) => (
                  <TableRow key={row.lineNumber}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLines.has(row.lineNumber)}
                        onCheckedChange={() => toggleLine(row.lineNumber)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                      {row.lineNumber}
                    </TableCell>
                    <TableCell
                      className="max-w-[300px] truncate font-mono text-xs"
                      title={row.text}
                    >
                      {row.text}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex flex-wrap gap-1">
                        {row.detectedSymbols.map((s, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {row.symbolCount}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFromLine(row.lineNumber)}
                        className="h-6 rounded-sm font-mono text-[10px]"
                      >
                        Remove line
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
