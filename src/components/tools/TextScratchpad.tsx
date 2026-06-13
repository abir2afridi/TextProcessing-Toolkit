import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Copy, Check, Download, Trash2, Save, Search, Plus, Minus, WrapText,
  Calendar, Hash, Replace, ChevronUp, ChevronDown, Info, ArrowRight, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const STORAGE_KEY = "delphitools-scratchpad";
const AUTOSAVE_DELAY = 500;

const SHARED_TOOLS = [
  { slug: "text-editor", name: "Text Editor", desc: "Rich markdown editor with formatting toolbar" },
  { slug: "doc-converter", name: "Doc Converter", desc: "Convert between Markdown, HTML, Word, PDF & more" },
  { slug: "markdown-html", name: "Markdown ↔ HTML", desc: "Bidirectional Markdown and HTML conversion" },
];

function countWords(s: string) {
  const trimmed = s.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function countLines(s: string) {
  return s ? s.split("\n").length : 0;
}

function countSentences(s: string) {
  if (!s.trim()) return 0;
  return s.split(/[.!?]+/).filter(Boolean).length;
}

function countParagraphs(s: string) {
  if (!s.trim()) return 0;
  return s.split(/\n\s*\n/).filter(Boolean).length;
}

function avgWordLength(s: string) {
  const words = s.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  return words.reduce((sum, w) => sum + w.length, 0) / words.length;
}

function readingTime(words: number) {
  const min = Math.ceil(words / 200);
  if (min < 1) return "< 1 min";
  return min + " min";
}

function longestWord(s: string) {
  const words = s.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  return words.reduce((a, b) => (a.length >= b.length ? a : b));
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(date: Date) {
  return date.toLocaleString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TextScratchpad() {
  const [text, setText] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [tabSize, setTabSize] = useState(2);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setText(saved);
    } catch {}
  }, []);

  const save = useCallback((value: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      setLastSaved(new Date());
    } catch {}
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(value), AUTOSAVE_DELAY);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Text copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const download = (ext: string, mime: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scratchpad." + ext;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as scratchpad." + ext);
  };

  const handleClear = () => {
    if (!text) return;
    setText("");
    save("");
    setFindText("");
    setReplaceText("");
    setCurrentMatch(0);
    setTotalMatches(0);
    toast.success("Scratchpad cleared");
    textareaRef.current?.focus();
  };

  const updateCursorPos = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = text.substring(0, pos);
    const line = before.split("\n").length;
    const col = pos - before.lastIndexOf("\n");
    setCursorLine(line);
    setCursorCol(col);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      setShowFind((p) => !p);
      if (!showFind) setTimeout(() => findInputRef.current?.focus(), 50);
    }
    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const spaces = " ".repeat(tabSize);
      const newText = text.substring(0, start) + spaces + text.substring(end);
      setText(newText);
      save(newText);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + tabSize;
        updateCursorPos();
      });
    }
  };

  const findAllMatches = useMemo(() => {
    if (!findText || !text) return [] as { index: number; length: number }[];
    const results: { index: number; length: number }[] = [];
    const lowerText = text.toLowerCase();
    const lowerFind = findText.toLowerCase();
    let idx = 0;
    while (true) {
      const pos = lowerText.indexOf(lowerFind, idx);
      if (pos === -1) break;
      results.push({ index: pos, length: findText.length });
      idx = pos + 1;
    }
    return results;
  }, [findText, text]);

  useEffect(() => {
    setTotalMatches(findAllMatches.length);
    if (currentMatch >= findAllMatches.length) setCurrentMatch(0);
  }, [findAllMatches, currentMatch]);

  const goToMatch = (dir: "prev" | "next") => {
    if (!findAllMatches.length) return;
    let next = dir === "next" ? currentMatch + 1 : currentMatch - 1;
    if (next < 0) next = findAllMatches.length - 1;
    if (next >= findAllMatches.length) next = 0;
    setCurrentMatch(next);
    const m = findAllMatches[next];
    if (m && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = m.index;
      textareaRef.current.selectionEnd = m.index + m.length;
      updateCursorPos();
    }
  };

  const handleReplaceAll = () => {
    if (!findText || !text) return;
    const lowerText = text.toLowerCase();
    const lowerFind = findText.toLowerCase();
    const result = [];
    let last = 0;
    let idx = 0;
    while (true) {
      const pos = lowerText.indexOf(lowerFind, idx);
      if (pos === -1) break;
      result.push(text.substring(last, pos));
      result.push(replaceText);
      idx = pos + findText.length;
      last = idx;
    }
    result.push(text.substring(last));
    const newText = result.join("");
    setText(newText);
    save(newText);
    setCurrentMatch(0);
    toast.success("Replaced " + findAllMatches.length + " occurrence(s)");
  };

  const insertTimestamp = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const ts = "[" + formatDate(new Date()) + "] ";
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = text.substring(0, start) + ts + text.substring(end);
    setText(newText);
    save(newText);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + ts.length;
      ta.focus();
      updateCursorPos();
    });
  };

  const stats = useMemo(() => {
    const chars = text.length;
    const words = countWords(text);
    const lines = countLines(text);
    const nonEmptyLines = text ? text.split("\n").filter((l) => l.trim()).length : 0;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const avgLen = avgWordLength(text);
    const readTime = readingTime(words);
    const longest = longestWord(text);
    const bytes = new TextEncoder().encode(text).length;

    const hasNonAscii = /[^\x00-\x7F]/.test(text);
    const hasEmoji = /\p{Emoji}/u.test(text);
    const hasCjk = /[\u4E00-\u9FFF]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    return {
      chars, charsWithSpaces: text.length, words, lines, nonEmptyLines,
      sentences, paragraphs, avgLen: avgLen.toFixed(1), readTime,
      bytes, longest, hasNonAscii, hasEmoji, hasCjk, hasArabic,
    };
  }, [text]);

  return (
    <div className="space-y-3">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFontSize((s) => Math.max(10, s - 1))} disabled={fontSize <= 10} title="Decrease font size">
              <Minus className="size-3.5" />
            </Button>
            <span className="w-7 text-center text-xs tabular-nums text-muted-foreground">{fontSize}</span>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFontSize((s) => Math.min(28, s + 1))} disabled={fontSize >= 28} title="Increase font size">
              <Plus className="size-3.5" />
            </Button>
          </div>
          <span className="h-4 w-px bg-border" />
          <Button
            variant={wordWrap ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-xs"
            onClick={() => setWordWrap((p) => !p)} title="Toggle word wrap"
          >
            <WrapText className="size-3.5 mr-1" />
            Wrap
          </Button>
          <span className="h-4 w-px bg-border" />
          <select
            value={tabSize}
            onChange={(e) => setTabSize(Number(e.target.value))}
            className="h-7 rounded border border-border bg-background px-1.5 text-xs text-muted-foreground outline-none"
            title="Tab size"
          >
            <option value={2}>Tab: 2</option>
            <option value={4}>Tab: 4</option>
            <option value={8}>Tab: 8</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFind ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-xs"
            onClick={() => { setShowFind((p) => !p); if (!showFind) setTimeout(() => findInputRef.current?.focus(), 50); }}
          >
            <Search className="size-3.5 mr-1" />
            Find
          </Button>
          <span className="h-4 w-px bg-border" />
          <span className="text-xs tabular-nums text-muted-foreground" title="Line:Column">
            <Hash className="size-3 inline mr-0.5" />
            {cursorLine}:{cursorCol}
          </span>
        </div>
      </div>

      {/* Find & Replace */}
      {showFind && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={findInputRef}
              value={findText}
              onChange={(e) => { setFindText(e.target.value); setCurrentMatch(0); }}
              onKeyDown={(e) => { if (e.key === "Enter") goToMatch("next"); if (e.key === "Escape") setShowFind(false); }}
              placeholder="Find..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Input
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleReplaceAll(); }}
            placeholder="Replace..."
            className="h-8 flex-1 min-w-[120px] text-xs"
          />
          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
            {findText ? (totalMatches > 0 ? currentMatch + 1 + "/" + totalMatches : "0") : ""}
          </span>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => goToMatch("prev")} disabled={!totalMatches} title="Previous match">
              <ChevronUp className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => goToMatch("next")} disabled={!totalMatches} title="Next match">
              <ChevronDown className="size-3.5" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={handleReplaceAll} disabled={!findText || !text}>
            <Replace className="size-3 mr-1" />
            Replace all
          </Button>
        </div>
      )}

      {/* Textarea with cursor tracking */}
      <div className="relative" onClick={updateCursorPos} onKeyUp={updateCursorPos}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onSelect={updateCursorPos}
          onKeyDown={handleKeyDown}
          placeholder="Start typing here... Your text is saved automatically."
          className={
            "w-full min-h-[400px] resize-y rounded-lg border border-border bg-background p-4 font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
            (wordWrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto")
          }
          style={{ fontSize: fontSize + "px" }}
          spellCheck
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!text} className="h-7 px-2 text-xs">
            {copied ? <Check className="size-3.5 mr-1" /> : <Copy className="size-3.5 mr-1" />}
            Copy
          </Button>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" onClick={() => download("txt", "text/plain")} disabled={!text} className="h-7 px-2 text-xs">
              <Download className="size-3.5 mr-1" />.txt
            </Button>
            <Button variant="ghost" size="sm" onClick={() => download("md", "text/markdown")} disabled={!text} className="h-7 px-2 text-xs">
              .md
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={insertTimestamp} disabled={!text} className="h-7 px-2 text-xs" title="Insert date/time at cursor">
            <Calendar className="size-3.5 mr-1" />
            Timestamp
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!text} className="h-7 px-2 text-xs text-destructive hover:text-destructive">
            <Trash2 className="size-3.5 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{stats.chars}c</span>
          <span className="tabular-nums">{stats.words}w</span>
          <span className="tabular-nums">{stats.bytes}B</span>
          {lastSaved && (
            <span className="flex items-center gap-1 text-[11px]">
              <Save className="size-3" />
              {formatTime(lastSaved)}
            </span>
          )}
        </div>
      </div>

      {/* Stats accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="stats" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium py-2.5">
            <span className="flex items-center gap-2">
              <Info className="size-4 text-muted-foreground" />
              Text Statistics
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Characters</div>
                <div className="font-semibold tabular-nums">{stats.chars}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Words</div>
                <div className="font-semibold tabular-nums">{stats.words}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sentences</div>
                <div className="font-semibold tabular-nums">{stats.sentences}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Paragraphs</div>
                <div className="font-semibold tabular-nums">{stats.paragraphs}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lines</div>
                <div className="font-semibold tabular-nums">{stats.lines}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Non-empty lines</div>
                <div className="font-semibold tabular-nums">{stats.nonEmptyLines}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg word length</div>
                <div className="font-semibold tabular-nums">{stats.avgLen}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reading time</div>
                <div className="font-semibold tabular-nums">{stats.readTime}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Longest word</div>
                <div className="font-mono text-xs truncate max-w-[180px]" title={stats.longest}>
                  {stats.longest || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Byte size</div>
                <div className="font-semibold tabular-nums">{stats.bytes} bytes</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Unicode blocks</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {stats.hasCjk && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-600 dark:text-blue-400">CJK</span>}
                  {stats.hasArabic && <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-[10px] text-green-600 dark:text-green-400">Arabic</span>}
                  {stats.hasEmoji && <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-[10px] text-yellow-600 dark:text-yellow-400">Emoji</span>}
                  {stats.hasNonAscii && !stats.hasCjk && !stats.hasArabic && !stats.hasEmoji && <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-[10px] text-purple-600 dark:text-purple-400">Extended</span>}
                  {!stats.hasNonAscii && <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">ASCII</span>}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Shared tools */}
      {text && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowRight className="size-3" />
            Send to Tools
          </div>
          <p className="text-xs text-muted-foreground">
            Your text is saved to a shared storage that these tools can load from:
          </p>
          <div className="flex flex-wrap gap-2">
            {SHARED_TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={"/tools/" + tool.slug}
                className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs hover:bg-accent transition-colors"
              >
                <FileText className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{tool.name}</div>
                  <div className="text-muted-foreground">{tool.desc}</div>
                </div>
                <ArrowRight className="size-3 text-muted-foreground shrink-0 ml-1" />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Text is saved automatically to your browser's local storage
        (<code className="text-[10px]">delphitools-scratchpad</code>).
        Other tools can load from the same storage. Nothing is sent to any server.
      </p>
    </div>
  );
}
