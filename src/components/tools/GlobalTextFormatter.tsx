import { useState, useMemo, useCallback } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { globalFormat, globalFormatTargetMatches, type GlobalFormat } from "@/lib/text-utils";
import { toast } from "sonner";

// ── Math reverse map (strip Unicode formatting back to ASCII) ──
const MATH_REVERSE: Map<number, string> = (() => {
  const m = new Map<number, string>();
  const add = (offset: number, chars: string) => {
    for (let i = 0; i < chars.length; i++) {
      m.set(chars.charCodeAt(i) + offset, chars[i]);
    }
  };
  add(0x1D400 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D41A - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D7CE - 48, "0123456789");
  add(0x1D434 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D44E - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D468 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D482 - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D670 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D68A - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D7F6 - 48, "0123456789");
  add(0x1D49C - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D4B6 - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D504 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D51E - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D538 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D552 - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D7D8 - 48, "0123456789");
  add(0x1D5A0 - 65, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  add(0x1D5BA - 97, "abcdefghijklmnopqrstuvwxyz");
  add(0x1D7E2 - 48, "0123456789");
  return m;
})();

const SMALL_CAPS_REVERSE: Record<string, string> = {
  "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e", "ꜰ": "f",
  "ɢ": "g", "ʜ": "h", "ɪ": "i", "ᴊ": "j", "ᴋ": "k", "ʟ": "l",
  "ᴍ": "m", "ɴ": "n", "ᴏ": "o", "ᴘ": "p", "ǫ": "q", "ʀ": "r",
  "s": "s", "ᴛ": "t", "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "x": "x",
  "ʏ": "y", "ᴢ": "z",
};

function removeUnicodeFormatting(text: string): string {
  return Array.from(text)
    .map((c) => {
      if (c === "\u0332" || c === "\u0336") return "";
      const cp = c.codePointAt(0)!;
      const ascii = MATH_REVERSE.get(cp);
      if (ascii) return ascii;
      const small = SMALL_CAPS_REVERSE[c];
      if (small) return small;
      return c;
    })
    .join("");
}

// ── Helpers ──
interface MatchInfo {
  value: string;
  index: number;
  start: number;
}

function findAllMatches(
  text: string,
  target: string,
  opts: { caseInsensitive: boolean; whole: boolean },
): MatchInfo[] {
  if (!target || !text) return [];
  try {
    const esc = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = "g" + (opts.caseInsensitive ? "i" : "") + "u";
    const re = new RegExp(opts.whole ? `\\b${esc}\\b` : esc, flags);
    const matches: MatchInfo[] = [];
    let idx = 0;
    for (const m of text.matchAll(re)) {
      matches.push({ value: m[0], index: idx++, start: m.index ?? 0 });
    }
    return matches;
  } catch {
    return [];
  }
}

function formatSelectedMatches(
  text: string,
  target: string,
  fmt: GlobalFormat,
  opts: { caseInsensitive: boolean; whole: boolean },
  selected: Set<number>,
): string {
  if (!target) return text;
  if (selected.size === 0) return text;
  try {
    const esc = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = "g" + (opts.caseInsensitive ? "i" : "") + "u";
    const re = new RegExp(opts.whole ? `\\b${esc}\\b` : esc, flags);
    let idx = -1;
    return text.replace(re, (m) => {
      idx++;
      return selected.has(idx) ? globalFormat(m, fmt) : m;
    });
  } catch {
    return text;
  }
}

// ── Format definitions ──
const FORMATS: { id: GlobalFormat; label: string }[] = [
  { id: "bold", label: "𝐁𝐨𝐥𝐝" },
  { id: "italic", label: "𝐼𝑡𝑎𝑙𝑖𝑐" },
  { id: "bold-italic", label: "𝑩𝒐𝒍𝒅 𝑰𝒕." },
  { id: "monospace", label: "𝙼𝚘𝚗𝚘" },
  { id: "script", label: "𝒮𝒸𝓇𝒾𝓅𝓉" },
  { id: "fraktur", label: "𝔉𝔯𝔞𝔨𝔱𝔲𝔯" },
  { id: "double-struck", label: "𝔻𝕠𝕦𝕓𝕝𝕖" },
  { id: "sans", label: "𝖲𝖺𝗇𝗌" },
  { id: "small-caps", label: "sᴍᴀʟʟ ᴄᴀᴘs" },
  { id: "underline", label: "U̲n̲d̲e̲r̲l̲i̲n̲e̲" },
  { id: "strikethrough", label: "S̶t̶r̶i̶k̶e̶" },
  { id: "upper", label: "UPPER" },
  { id: "lower", label: "lower" },
  { id: "title", label: "Title" },
  { id: "sentence", label: "Sentence." },
];

// ── Types ──
interface HistoryEntry {
  id: number;
  inputBefore: string;
  outputAfter: string;
  target: string;
  format: GlobalFormat | null;
  label: string;
}

// ── Component ──
export default function GlobalTextFormatter() {
  const [input, setInput] = useState("Style your text globally with one click.");
  const [target, setTarget] = useState("");
  const [fmt, setFmt] = useState<GlobalFormat>("bold");
  const [matchCase, setMatchCase] = useState(false);
  const [whole, setWhole] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"all" | "selected">("all");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const opts = { caseInsensitive: !matchCase, whole };

  const matches = useMemo(
    () => findAllMatches(input, target, opts),
    [input, target, opts.caseInsensitive, opts.whole],
  );

  const output = useMemo(() => {
    if (!target || matches.length === 0) return globalFormat(input, fmt);
    if (selectedMode === "selected" && selectedIndices.size > 0) {
      return formatSelectedMatches(input, target, fmt, opts, selectedIndices);
    }
    return globalFormatTargetMatches(input, target, fmt, opts);
  }, [input, target, fmt, opts.caseInsensitive, opts.whole, selectedMode, selectedIndices, matches]);

  const addHistory = useCallback(
    (label: string, inputBefore: string, outputAfter: string, format: GlobalFormat | null) => {
      setHistory((prev) =>
        [{ id: Date.now(), inputBefore, outputAfter, target, format, label }, ...prev.slice(0, 49)],
      );
    },
    [target],
  );

  const handleApplyFormat = useCallback(() => {
    if (output === input) {
      toast.info("No changes to apply");
      return;
    }
    addHistory(`Apply ${fmt}`, input, output, fmt);
    setInput(output);
    toast.success("Format applied");
  }, [input, output, fmt, addHistory]);

  const handleRemoveFormatting = useCallback(() => {
    const cleaned = removeUnicodeFormatting(input);
    if (cleaned === input) {
      toast.info("No formatting found to remove");
      return;
    }
    addHistory("Remove formatting", input, cleaned, null);
    setInput(cleaned);
    toast.success("Unicode formatting removed");
  }, [input, addHistory]);

  const toggleSelectAll = useCallback(() => {
    setSelectedMode((prev) => {
      if (prev === "all") {
        setSelectedIndices(new Set(matches.map((m) => m.index)));
        return "selected";
      }
      return "all";
    });
  }, [matches]);

  const toggleIndex = useCallback((idx: number) => {
    setSelectedMode("selected");
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const restoreHistory = useCallback((entry: HistoryEntry) => {
    setInput(entry.outputAfter);
    toast.success("History entry restored");
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="space-y-4">
      {/* Format toolbar */}
      <OptionRow>
        <div className="flex flex-wrap gap-1">
          {FORMATS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={fmt === f.id ? "default" : "ghost"}
              onClick={() => setFmt(f.id)}
              className="h-7 rounded-sm font-mono text-[11px]"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </OptionRow>

      {/* Target text + toggles + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Enter word/sentence to format…"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-8 w-56 text-xs"
        />
        <div className="flex items-center gap-2">
          <Switch id="mc" checked={matchCase} onCheckedChange={setMatchCase} />
          <Label htmlFor="mc" className="text-xs">Match case</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="ww" checked={whole} onCheckedChange={setWhole} />
          <Label htmlFor="ww" className="text-xs">Whole word</Label>
        </div>
        <Button size="sm" variant="outline" onClick={handleApplyFormat} className="h-8 text-xs">
          Apply
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRemoveFormatting}
          className="h-8 text-xs"
        >
          Remove Unicode formatting
        </Button>
      </div>

      {/* Occurrence list */}
      {target && matches.length > 0 && (
        <OptionRow>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-medium text-muted-foreground">
              {matches.length} occ{matches.length === 1 ? "" : "s"}:
            </span>
            <Badge
              variant={selectedMode === "all" ? "default" : "outline"}
              className="cursor-pointer text-[10px]"
              onClick={toggleSelectAll}
            >
              All
            </Badge>
            {matches.map((m) => (
              <Badge
                key={m.index}
                variant={
                  selectedMode === "selected" && selectedIndices.has(m.index)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer text-[10px] font-mono"
                onClick={() => toggleIndex(m.index)}
              >
                {m.value.length > 12 ? m.value.slice(0, 10) + "…" : m.value}
              </Badge>
            ))}
          </div>
        </OptionRow>
      )}

      {/* Input/Output panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Formatted" value={output} readOnly />
      </div>

      {/* Formatting history */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground">
              Formatting history ({history.length})
            </h3>
            <Button size="sm" variant="ghost" onClick={clearHistory} className="h-6 text-[10px]">
              Clear
            </Button>
          </div>
          <ScrollArea className="max-h-40 overflow-y-auto rounded border">
            <div className="divide-y">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-[10px]"
                >
                  <Badge variant="outline" className="text-[9px] shrink-0">
                    {entry.label}
                  </Badge>
                  <span className="truncate text-muted-foreground">
                    {entry.outputAfter.slice(0, 60)}
                    {entry.outputAfter.length > 60 ? "…" : ""}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-5 text-[9px] shrink-0"
                    onClick={() => restoreHistory(entry)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <p className="font-mono text-[10px] text-muted-foreground">
        Uses Unicode mathematical alphanumeric symbols — works in social media bios, comments, and
        most rich-text fields.
      </p>
    </div>
  );
}
