import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Type,
  LockKeyhole,
  RotateCcw,
  ClipboardPaste,
  StepBack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Token {
  id: number;
  text: string;
  type: "word" | "space";
  locked: boolean;
}

type Phase = "input" | "select" | "edit";

const PHASES: { key: Phase; num: number; label: string }[] = [
  { key: "input", num: 1, label: "Input" },
  { key: "select", num: 2, label: "Select & Lock" },
  { key: "edit", num: 3, label: "Edit & Output" },
];

function phaseIdx(p: Phase) {
  return PHASES.findIndex((ph) => ph.key === p);
}

export default function SelectiveTextReplacer() {
  const [inputText, setInputText] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [showSpaces, setShowSpaces] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pasteSupported, setPasteSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPasteSupported(
      typeof navigator.clipboard?.readText === "function",
    );
  }, []);

  const phase: Phase = !tokens.length ? "input" : !isGenerated ? "select" : "edit";

  const tokenize = useCallback(
    (text: string, includeSpaces: boolean): Token[] => {
      if (!text.trim()) return [];
      if (includeSpaces) {
        const parts = text.split(/(\s+)/);
        let id = 0;
        return parts.filter((p) => p.length > 0).map((p) => ({
          id: id++,
          text: p,
          type: /\s/.test(p) ? ("space" as const) : ("word" as const),
          locked: false,
        }));
      }
      return text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, i) => ({
          id: i,
          text: word,
          type: "word" as const,
          locked: false,
        }));
    },
    [],
  );

  const handleSetText = useCallback(() => {
    setTokens(tokenize(inputText, showSpaces));
    setIsGenerated(false);
    setEditedValues({});
  }, [inputText, showSpaces, tokenize]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch {
      /* permission denied – user can paste manually */
    }
  }, []);

  const toggleLock = useCallback(
    (id: number) => {
      if (isGenerated) return;
      setTokens((prev) =>
        prev.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)),
      );
    },
    [isGenerated],
  );

  const lockAllWords = useCallback(() => {
    if (isGenerated) return;
    setTokens((prev) =>
      prev.map((t) => (t.type === "word" ? { ...t, locked: true } : t)),
    );
  }, [isGenerated]);

  const unlockAllWords = useCallback(() => {
    if (isGenerated) return;
    setTokens((prev) =>
      prev.map((t) => (t.type === "word" ? { ...t, locked: false } : t)),
    );
  }, [isGenerated]);

  const markSelectedRange = useCallback(() => {
    if (!textareaRef.current || isGenerated) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    if (selectionStart === selectionEnd) return;

    setTokens((prev) => {
      let pos = 0;
      return prev.map((t) => {
        let tStart: number;
        let tEnd: number;
        if (showSpaces) {
          tStart = pos;
          tEnd = pos + t.text.length;
          pos = tEnd;
        } else {
          const idx = inputText.indexOf(t.text, pos);
          tStart = idx !== -1 ? idx : pos;
          tEnd = tStart + t.text.length;
          pos = tEnd;
        }
        return tStart < selectionEnd && tEnd > selectionStart
          ? { ...t, locked: true }
          : t;
      });
    });
  }, [isGenerated, showSpaces, inputText]);

  const handleGenerate = useCallback(() => {
    setIsGenerated(true);
    setEditedValues(
      Object.fromEntries(
        tokens.filter((t) => !t.locked).map((t) => [t.id, t.text]),
      ),
    );
  }, [tokens]);

  const handleUnlock = useCallback(() => {
    setTokens((prev) => prev.map((t) => ({ ...t, locked: false })));
    setIsGenerated(false);
    setEditedValues({});
  }, []);

  const handleReset = useCallback(() => {
    setInputText("");
    setTokens([]);
    setIsGenerated(false);
    setEditedValues({});
    setShowSpaces(true);
  }, []);

  const updateEditedValue = useCallback((id: number, value: string) => {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleSpaces = useCallback(() => {
    const newShowSpaces = !showSpaces;
    const wordLockStates = tokens
      .filter((t) => t.type === "word")
      .map((t) => t.locked);
    if (inputText.trim()) {
      const newTokens = tokenize(inputText, newShowSpaces);
      let wordIdx = 0;
      setTokens(
        newTokens.map((t) =>
          t.type === "word"
            ? {
                ...t,
                locked:
                  wordIdx < wordLockStates.length
                    ? wordLockStates[wordIdx++]
                    : false,
              }
            : t,
        ),
      );
    }
    setShowSpaces(newShowSpaces);
  }, [inputText, showSpaces, tokenize, tokens]);

  const output = useMemo(() => {
    if (!isGenerated) return "";
    if (showSpaces) {
      return tokens
        .map((t) => (t.locked ? t.text : editedValues[t.id] ?? t.text))
        .join("");
    }
    return tokens
      .map((t, i) => {
        const val = t.locked ? t.text : editedValues[t.id] ?? t.text;
        return i < tokens.length - 1 ? val + " " : val;
      })
      .join("");
  }, [tokens, editedValues, isGenerated, showSpaces]);

  const originalText = useMemo(
    () => tokens.map((t) => t.text).join(showSpaces ? "" : " "),
    [tokens, showSpaces],
  );

  const isModified = output !== originalText;

  const copyOutput = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const hasText = tokens.length > 0;
  const hasSelection = tokens.some((t) => t.locked);
  const canGenerate = hasText && hasSelection;
  const hasLocked = tokens.some((t) => t.locked);
  const lockedCount = tokens.filter((t) => t.locked).length;
  const wordCount = tokens.filter((t) => t.type === "word").length;
  const spaceCount = tokens.filter((t) => t.type === "space").length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [inputText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canGenerate) {
        handleGenerate();
      }
    },
    [canGenerate, handleGenerate],
  );

  const focusNextInput = useCallback(
    (currentId: number) => {
      const editableIds = tokens
        .filter((t) => !t.locked)
        .map((t) => t.id);
      const idx = editableIds.indexOf(currentId);
      if (idx < editableIds.length - 1) {
        const next = document.getElementById(
          `edit-input-${editableIds[idx + 1]}`,
        );
        next?.focus();
      }
    },
    [tokens],
  );

  return (
    <div className="space-y-6">
      {/* Phase Indicator */}
      <div className="flex items-center gap-1 text-sm">
        {PHASES.map((p, i) => (
          <div key={p.key} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center justify-center size-6 rounded-full text-xs font-bold transition-colors",
                phase === p.key
                  ? "bg-primary text-primary-foreground"
                  : phaseIdx(phase) > i
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {phaseIdx(phase) > i ? <Check className="size-3" /> : p.num}
            </span>
            <span
              className={cn(
                "hidden sm:inline",
                phase === p.key
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {p.label}
            </span>
            {i < PHASES.length - 1 && (
              <span className="text-muted-foreground/30 mx-1">
                {"\u2192"}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ============================== INPUT (always interactive until generated) ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Input Text</h2>
          <span className="text-xs text-muted-foreground">
            {inputText.length > 0 &&
              `${inputText.split(/\s+/).filter(Boolean).length} words, ${inputText.length} chars`}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "dhaka is the capital city of Bangladesh"'
          className="w-full min-h-28 p-3 rounded-lg border border-border bg-background resize-y font-mono text-sm leading-relaxed"
          disabled={isGenerated}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSetText}
            disabled={isGenerated || !inputText.trim()}
          >
            <Type className="size-4 mr-2" /> Set Text
          </Button>
          <Button
            onClick={markSelectedRange}
            variant="outline"
            disabled={isGenerated || !hasText}
            title="Select text in the textarea above, then click this"
          >
            <Lock className="size-4 mr-2" /> Mark Selected
          </Button>
          <Button
            onClick={handlePaste}
            variant="outline"
            disabled={isGenerated || !pasteSupported}
            title="Paste from clipboard"
          >
            <ClipboardPaste className="size-4 mr-2" /> Paste
          </Button>
          <Button
            onClick={toggleSpaces}
            variant="outline"
            disabled={isGenerated}
            title="Toggle blank space visibility"
          >
            {showSpaces ? (
              <EyeOff className="size-4 mr-2" />
            ) : (
              <Eye className="size-4 mr-2" />
            )}
            {showSpaces ? "Hide Spaces" : "Show Spaces"}
          </Button>
          {inputText && (
            <Button
              onClick={() => setInputText("")}
              variant="ghost"
              size="icon"
              className="size-9 ml-auto"
              title="Clear input"
              disabled={isGenerated}
            >
              <StepBack className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ============================== PHASE 2: SELECT ============================= */}
      {hasText && !isGenerated && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              Click words to{" "}
              <Lock className="size-3 inline align-text-bottom" /> lock, or
              select range &rarr;{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-xs font-mono">
                Mark Selected
              </kbd>
              .
              {canGenerate && (
                <span className="ml-2 text-primary whitespace-nowrap">
                  <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-xs font-mono">
                    Ctrl
                  </kbd>
                  +
                  <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  to generate
                </span>
              )}
            </p>
            <div className="flex gap-1 shrink-0">
              <Button
                onClick={lockAllWords}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={lockedCount === wordCount}
              >
                <Lock className="size-3 mr-1" /> Lock All
              </Button>
              <Button
                onClick={unlockAllWords}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={lockedCount === 0}
              >
                <Unlock className="size-3 mr-1" /> Unlock All
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 p-4 rounded-lg border border-border bg-card min-h-12">
            {tokens.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleLock(t.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  "motion-safe:active:scale-95",
                  t.type === "space"
                    ? t.locked
                      ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-700 dark:text-yellow-300"
                      : "bg-muted/30 border border-dashed border-border text-muted-foreground/40 hover:border-yellow-500/30"
                    : t.locked
                      ? "bg-primary/15 border border-primary/40 text-primary shadow-sm"
                      : "bg-muted/50 border border-border hover:border-primary/30 hover:bg-accent",
                )}
                title={
                  t.type === "space"
                    ? t.locked
                      ? "Space locked \u2013 click to unlock"
                      : "Click to lock this space"
                    : t.locked
                      ? "Locked \u2013 click to unlock"
                      : "Click to lock"
                }
              >
                {t.type === "space" ? (
                  <span className="text-xs tracking-widest" aria-label="space">
                    {"\u2423"}
                  </span>
                ) : (
                  t.text
                )}
                {t.locked && (
                  <LockKeyhole className="size-3 ml-1 inline align-text-bottom opacity-60" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              size="lg"
            >
              <Lock className="size-4 mr-2" /> Generate
            </Button>
            <span className="text-xs text-muted-foreground self-center">
              {lockedCount} / {wordCount} word
              {wordCount !== 1 ? "s" : ""} locked
            </span>
          </div>
        </div>
      )}

      {/* ============================== PHASE 3: EDIT & OUTPUT ===================== */}
      {isGenerated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold">
              Edit Unlocked Parts
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                <Lock className="size-3 inline mr-0.5" />
                {lockedCount} locked &middot;{" "}
                <span className="text-primary">
                  {tokens.length - lockedCount} editable
                </span>
              </span>
            </h2>
            <div className="flex gap-2">
              <Button onClick={handleUnlock} variant="outline" size="sm">
                <RotateCcw className="size-3 mr-1" /> Re-select
              </Button>
              <Button onClick={handleReset} variant="ghost" size="sm">
                <StepBack className="size-3 mr-1" /> Reset
              </Button>
            </div>
          </div>

          <div
            ref={editContainerRef}
            className="p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex flex-wrap items-center gap-1 leading-8">
              {tokens.map((t) => {
                if (t.locked) {
                  return (
                    <span
                      key={t.id}
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-sm font-medium",
                        t.type === "space"
                          ? "text-yellow-600 dark:text-yellow-400 text-xs tracking-widest bg-yellow-500/5"
                          : "bg-primary/10 text-primary border border-primary/20",
                      )}
                    >
                      {t.type === "space" ? "\u2423" : t.text}
                    </span>
                  );
                }
                return (
                  <Input
                    id={`edit-input-${t.id}`}
                    key={t.id}
                    value={editedValues[t.id] ?? ""}
                    onChange={(e) => updateEditedValue(t.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Tab" && !e.shiftKey) {
                        e.preventDefault();
                        focusNextInput(t.id);
                      }
                    }}
                    className={cn(
                      "inline-flex h-8 text-sm align-middle",
                      "min-w-16 max-w-48",
                      t.type === "space" && "min-w-12 max-w-24",
                    )}
                    placeholder={t.type === "space" ? "\u2423" : t.text}
                  />
                );
              })}
            </div>
          </div>

          {/* Live Output Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Output Preview
                {isModified && (
                  <span className="ml-2 text-xs text-primary">(modified)</span>
                )}
              </h3>
              <Button onClick={copyOutput} variant="outline" size="sm">
                {copied ? (
                  <Check className="size-3 mr-1" />
                ) : (
                  <Copy className="size-3 mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div
              className={cn(
                "p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap break-all transition-colors",
                isModified
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/30",
              )}
            >
              {output}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
