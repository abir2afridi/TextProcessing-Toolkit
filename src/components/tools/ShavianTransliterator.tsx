import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Download,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  RotateCcw,
} from "lucide-react";
import {
  tokenise,
  reResolveTokens,
  setCoreDictionary,
  setFullDictionary,
  type GlossToken,
  markerPrefix,
  nextMarker,
  type Dictionary,
} from "@/lib/shavian/transliterate";
import { getAlternatives, type Alternative } from "@/lib/shavian/alternatives";
import { getShavianLetter, SHAVIAN_LETTERS } from "@/lib/shavian/phoneme-map";

const shavianFontFace = `
@font-face {
  font-family: 'Noto Sans Shavian';
  src: url('/fonts/NotoSansShavian-Regular.woff2') format('woff2');
  font-display: swap;
}
`;

function parseDictJson(json: Record<string, string[]>): Dictionary {
  const map = new Map<string, string[]>();
  for (const [word, phonemes] of Object.entries(json)) {
    map.set(word, phonemes);
  }
  return map;
}

let fullDictPromise: Promise<Dictionary> | null = null;
function loadFullDictionary(): Promise<Dictionary> {
  if (!fullDictPromise) {
    fullDictPromise = fetch("/data/shavian-dictionary-full.json")
      .then((res) => res.json())
      .then((json) => parseDictJson(json));
  }
  return fullDictPromise;
}

const CHART_GROUPS = [
  { title: "Tall Consonants (unvoiced)", letters: SHAVIAN_LETTERS.slice(0, 8) },
  { title: "Deep Consonants (voiced)", letters: SHAVIAN_LETTERS.slice(8, 16) },
  { title: "Sonorants", letters: SHAVIAN_LETTERS.slice(16, 20) },
  { title: "Nasals & Liquids", letters: SHAVIAN_LETTERS.slice(20, 24) },
  { title: "Short Vowels", letters: SHAVIAN_LETTERS.slice(24, 31) },
  { title: "Long Vowels & Diphthongs", letters: SHAVIAN_LETTERS.slice(31) },
];

const EXAMPLES = [
  {
    label: "Universal Declaration",
    text: "All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.",
  },
  {
    label: "Hamlet",
    text: "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
  },
  {
    label: "Quick brown fox",
    text: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
  },
  {
    label: "Gettysburg Address",
    text: "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.",
  },
];

export default function ShavianTransliterator() {
  const DEFAULT_TEXT = "Mankind, be vigilant; we loved you.";

  const [input, setInput] = useState(DEFAULT_TEXT);
  const [tokens, setTokens] = useState<GlossToken[]>([]);
  const [dictStatus, setDictStatus] = useState<"loading-core" | "loading-full" | "ready">(
    "loading-core",
  );
  const [copiedShavian, setCopiedShavian] = useState(false);
  const [copiedIpa, setCopiedIpa] = useState(false);
  const [copiedLatin, setCopiedLatin] = useState(false);
  const [activePopover, setActivePopover] = useState<{
    tokenIdx: number;
    phonemeIdx: number;
  } | null>(null);
  const [showRefChart, setShowRefChart] = useState(false);
  const [showIpa, setShowIpa] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = shavianFontFace;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    import("@/lib/shavian/dictionary-core.json").then((mod) => {
      const dict = parseDictJson(mod.default as Record<string, string[]>);
      setCoreDictionary(dict);
      setDictStatus("loading-full");

      if (inputRef.current) {
        setTokens(tokenise(inputRef.current));
      }
    });
  }, []);

  useEffect(() => {
    if (dictStatus !== "loading-full") return;

    let cancelled = false;
    loadFullDictionary()
      .then((dict) => {
        if (cancelled) return;
        setFullDictionary(dict);
        setDictStatus("ready");

        setTokens((prev) => reResolveTokens(prev));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load full dictionary:", err);
        setDictStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [dictStatus]);

  const handleInput = useCallback((text: string) => {
    setInput(text);
    setTokens(tokenise(text));
    setActivePopover(null);
  }, []);

  const cycleMarker = useCallback((tokenIdx: number) => {
    setTokens((prev) =>
      prev.map((token, i) => {
        if (i !== tokenIdx || token.type !== "word" || !token.gloss) return token;

        const newMarker = nextMarker(token.gloss.marker);
        const prefix = markerPrefix(newMarker);

        return {
          ...token,
          gloss: {
            ...token.gloss,
            marker: newMarker,
            shavian: prefix + token.gloss.phonemes.map((p) => p.shavian).join(""),
          },
        };
      }),
    );
  }, []);

  const swapPhoneme = useCallback((tokenIdx: number, phonemeIdx: number, alt: Alternative) => {
    setTokens((prev) =>
      prev.map((token, i) => {
        if (i !== tokenIdx || token.type !== "word" || !token.gloss) return token;

        const newPhonemes = [...token.gloss.phonemes];
        newPhonemes[phonemeIdx] = {
          shavian: alt.shavian,
          ipa: alt.ipa,
          alternatives: getAlternatives(alt.shavian),
        };

        const prefix = markerPrefix(token.gloss.marker);

        return {
          ...token,
          gloss: {
            ...token.gloss,
            phonemes: newPhonemes,
            shavian: prefix + newPhonemes.map((p) => p.shavian).join(""),
            ipa: newPhonemes.map((p) => p.ipa).join(""),
            userEdited: true,
          },
        };
      }),
    );
    setActivePopover(null);
  }, []);

  const copyToClipboard = useCallback((text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  }, []);

  const getShavianText = useCallback(
    () => tokens.map((t) => (t.type === "word" && t.gloss ? t.gloss.shavian : t.value)).join(""),
    [tokens],
  );

  const getIpaText = useCallback(
    () => tokens.map((t) => (t.type === "word" && t.gloss ? t.gloss.ipa : t.value)).join(""),
    [tokens],
  );

  const getLatinText = useCallback(() => tokens.map((t) => t.value).join(""), [tokens]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasContent = tokens.some((t) => t.type === "word");
  const wordCount = tokens.filter((t) => t.type === "word").length;
  const charCount = input.length;
  const heuristicCount = tokens.filter(
    (t) => t.type === "word" && t.gloss?.source === "heuristic" && !t.gloss.userEdited,
  ).length;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          The <strong className="text-foreground">Shavian alphabet</strong> (𐑖𐑱𐑝𐑾𐑯) is a phonemic
          writing system designed for English by Kingsley Read, commissioned by the will of George
          Bernard Shaw. Each letter represents exactly one sound — no silent letters, no ambiguous
          spellings.
        </p>
        <p>
          Type or paste English text below. Click individual Shavian letters to swap phonemes. Click
          a Latin word to cycle through markers: namer dot · (proper noun), acroring ⸰ (initialism),
          acroarc ꤮ (pronounceable acronym).
        </p>
      </div>

      {/* Example presets */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <Button
            key={ex.label}
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => handleInput(ex.text)}
          >
            <FileText className="w-3.5 h-3.5" />
            {ex.label}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Textarea
          placeholder="Type or paste English text here..."
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className="min-h-25 text-base"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <span>
            {wordCount} word{wordCount !== 1 ? "s" : ""}, {charCount} character
            {charCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-2">
            {heuristicCount > 0 && (
              <span className="text-destructive">
                {heuristicCount} heuristic word{heuristicCount !== 1 ? "s" : ""}
              </span>
            )}
            {input !== DEFAULT_TEXT && (
              <button
                onClick={() => handleInput(DEFAULT_TEXT)}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </span>
        </div>
      </div>

      {hasContent && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap gap-y-3 items-start">
            {tokens.map((token, tokenIdx) => {
              if (token.type === "whitespace") {
                return <div key={`ws-${tokenIdx}`} className="w-4" />;
              }
              if (token.type === "punctuation") {
                return (
                  <span
                    key={`punct-${tokenIdx}-${token.value}`}
                    className="text-muted-foreground text-lg self-end pb-5 -ml-1"
                  >
                    {token.value}
                  </span>
                );
              }
              if (!token.gloss) return null;

              const gloss = token.gloss;

              return (
                <div
                  key={`word-${tokenIdx}-${gloss.latin}`}
                  className="flex flex-col items-start gap-0.5"
                >
                  {/* Latin row — click to cycle marker */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => cycleMarker(tokenIdx)}
                      className={`text-sm px-1 rounded transition-colors cursor-pointer hover:bg-accent ${
                        gloss.marker !== "none"
                          ? "text-orange-400 font-medium"
                          : "text-muted-foreground"
                      }`}
                      title={
                        gloss.marker === "none"
                          ? "Add namer dot · (proper noun)"
                          : gloss.marker === "namer"
                            ? "Switch to acroring ⸰ (initialism)"
                            : gloss.marker === "acroring"
                              ? "Switch to acroarc ꤮ (acronym)"
                              : "Remove marker"
                      }
                    >
                      {gloss.latin}
                    </button>
                    {gloss.userEdited && (
                      <span className="text-[10px] text-orange-400 font-medium" title="User-edited">
                        ✎
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-medium ${
                        gloss.source === "core"
                          ? "text-green-500"
                          : gloss.source === "full"
                            ? "text-blue-500"
                            : "text-destructive"
                      }`}
                    >
                      {gloss.source === "core" ? "C" : gloss.source === "full" ? "F" : "H"}
                    </span>
                  </div>

                  {/* Shavian row — per-letter clickable */}
                  <div className="flex gap-px items-center">
                    {gloss.marker !== "none" && (
                      <span
                        className="text-[22px] leading-tight text-orange-400 px-0.5"
                        style={{ fontFamily: "'Noto Sans Shavian', sans-serif" }}
                      >
                        {markerPrefix(gloss.marker)}
                      </span>
                    )}
                    {gloss.phonemes.map((phoneme, pIdx) => {
                      const isActive =
                        activePopover?.tokenIdx === tokenIdx && activePopover?.phonemeIdx === pIdx;

                      return (
                        <div key={`phoneme-${tokenIdx}-${pIdx}`} className="relative">
                          <button
                            onClick={() =>
                              setActivePopover(isActive ? null : { tokenIdx, phonemeIdx: pIdx })
                            }
                            className={`
                              text-[22px] leading-tight px-1 py-0.5 rounded
                              transition-all cursor-pointer
                              hover:bg-accent hover:-translate-y-0.5
                              ${isActive ? "bg-accent ring-2 ring-primary -translate-y-0.5" : ""}
                              ${gloss.marker !== "none" ? "text-orange-400" : "text-foreground"}
                            `}
                            style={{ fontFamily: "'Noto Sans Shavian', sans-serif" }}
                          >
                            {phoneme.shavian}
                          </button>

                          {isActive && (
                            <div
                              ref={popoverRef}
                              className="absolute top-full left-0 z-50 mt-1 min-w-45 rounded-lg border bg-popover p-1.5 shadow-lg"
                            >
                              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded bg-accent/50 border-l-2 border-primary mb-1">
                                <span
                                  className="text-xl w-7 text-center"
                                  style={{ fontFamily: "'Noto Sans Shavian', sans-serif" }}
                                >
                                  {phoneme.shavian}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {getShavianLetter(phoneme.shavian)?.name ?? ""}
                                </span>
                                <span className="text-xs text-green-500 ml-auto">
                                  /{phoneme.ipa}/
                                </span>
                              </div>

                              {phoneme.alternatives.length === 0 && (
                                <div className="px-2.5 py-2 text-xs text-muted-foreground italic">
                                  No alternatives
                                </div>
                              )}
                              {phoneme.alternatives.map((alt) => (
                                <button
                                  key={alt.shavian}
                                  onClick={() => swapPhoneme(tokenIdx, pIdx, alt)}
                                  className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded text-left hover:bg-accent transition-colors cursor-pointer"
                                >
                                  <span
                                    className="text-xl w-7 text-center"
                                    style={{ fontFamily: "'Noto Sans Shavian', sans-serif" }}
                                  >
                                    {alt.shavian}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{alt.name}</span>
                                  <span className="text-xs text-green-500 ml-auto">
                                    /{alt.ipa}/
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* IPA row — per-letter aligned */}
                  {(showIpa || gloss.source === "heuristic") && (
                    <div className="flex gap-px">
                      {gloss.phonemes.map((phoneme, pIdx) => (
                        <span
                          key={`ipa-${tokenIdx}-${pIdx}`}
                          className={`text-[13px] px-1 min-w-5 ${gloss.source === "heuristic" && !gloss.userEdited ? "text-destructive" : "text-green-500"}`}
                        >
                          {phoneme.ipa}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Core dict
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Full dict
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Heuristic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Marked
            </span>
            <button
              onClick={() => setShowIpa(!showIpa)}
              className={`flex items-center gap-1.5 ml-auto hover:text-foreground transition-colors ${
                showIpa ? "" : "text-muted-foreground/50"
              }`}
              title={showIpa ? "Hide IPA" : "Show IPA"}
            >
              {showIpa ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              IPA
            </button>
            {dictStatus === "loading-core" && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading dictionary...
              </span>
            )}
            {dictStatus === "loading-full" && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading full dictionary...
              </span>
            )}
            {dictStatus === "ready" && <span className="text-green-500">Ready</span>}
          </div>
        </div>
      )}

      {/* Copy and Export actions */}
      {hasContent && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => copyToClipboard(getShavianText(), setCopiedShavian)}
            className="gap-2"
          >
            {copiedShavian ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedShavian ? "Copied!" : "Copy Shavian"}
          </Button>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(getIpaText(), setCopiedIpa)}
            className="gap-2"
          >
            {copiedIpa ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedIpa ? "Copied!" : "Copy IPA"}
          </Button>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(getLatinText(), setCopiedLatin)}
            className="gap-2"
          >
            {copiedLatin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedLatin ? "Copied!" : "Copy Latin"}
          </Button>
          <Button variant="outline" onClick={() => exportGloss(tokens)} className="gap-2">
            <Download className="w-4 h-4" />
            Export PNG
          </Button>
        </div>
      )}

      {/* Alphabet Reference Chart */}
      <div className="rounded-lg border bg-card">
        <button
          onClick={() => setShowRefChart(!showRefChart)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
        >
          <span>Shavian Alphabet Reference ({SHAVIAN_LETTERS.length} letters)</span>
          {showRefChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showRefChart && (
          <div className="px-4 pb-4 space-y-4">
            {CHART_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {group.title}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {group.letters.map((letter) => (
                    <div
                      key={letter.shavian}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent transition-colors"
                    >
                      <span
                        className="text-lg w-6 text-center"
                        style={{ fontFamily: "'Noto Sans Shavian', sans-serif" }}
                      >
                        {letter.shavian}
                      </span>
                      <span className="text-xs text-muted-foreground">{letter.name}</span>
                      <span className="text-[11px] text-green-500 ml-auto font-mono">
                        /{letter.ipa}/
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function exportGloss(tokens: GlossToken[]) {
  const CANVAS_WIDTH = 1200;
  const PADDING = 40;
  const WORD_GAP = 24;
  const LINE_HEIGHT = 80;
  const CONTENT_WIDTH = CANVAS_WIDTH - PADDING * 2;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  await document.fonts.ready;

  const isDark =
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const BG_COLOR = isDark ? "#0a0a0a" : "#ffffff";
  const LATIN_COLOR = isDark ? "#8888aa" : "#666688";
  const SHAVIAN_COLOR = isDark ? "#e8e8ff" : "#1a1a2e";
  const IPA_COLOR = isDark ? "#66cc88" : "#227744";
  const BRAND_COLOR = isDark ? "#555" : "#aaa";

  const measurements: { token: GlossToken; width: number }[] = [];

  ctx.font = "14px system-ui";
  for (const token of tokens) {
    if (token.type === "word" && token.gloss) {
      const latinWidth = ctx.measureText(token.gloss.latin).width;
      ctx.font = "22px 'Noto Sans Shavian', sans-serif";
      const shavianText = token.gloss.phonemes.map((p) => p.shavian).join("");
      const shavianWidth = ctx.measureText(shavianText).width;
      ctx.font = "13px system-ui";
      const ipaWidth = ctx.measureText(token.gloss.ipa).width;
      ctx.font = "14px system-ui";
      const width = Math.max(latinWidth, shavianWidth, ipaWidth);
      measurements.push({ token, width });
    } else if (token.type === "punctuation") {
      const width = ctx.measureText(token.value).width;
      measurements.push({ token, width });
    }
  }

  const lines: (typeof measurements)[] = [];
  let currentLine: typeof measurements = [];
  let currentWidth = 0;

  for (const m of measurements) {
    if (currentWidth + m.width + WORD_GAP > CONTENT_WIDTH && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [m];
      currentWidth = m.width;
    } else {
      currentLine.push(m);
      currentWidth += m.width + WORD_GAP;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);

  const BRANDING_HEIGHT = 40;
  canvas.width = CANVAS_WIDTH;
  canvas.height = PADDING + lines.length * LINE_HEIGHT + BRANDING_HEIGHT + PADDING;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = PADDING;
  for (const line of lines) {
    let x = PADDING;
    for (const { token } of line) {
      if (token.type === "punctuation") {
        ctx.font = "18px system-ui";
        ctx.fillStyle = LATIN_COLOR;
        ctx.textAlign = "left";
        ctx.fillText(token.value, x, y + 42);
        x += ctx.measureText(token.value).width + 4;
        continue;
      }

      const gloss = token.gloss!;

      ctx.font = "14px system-ui";
      ctx.fillStyle = LATIN_COLOR;
      ctx.textAlign = "left";
      ctx.fillText(gloss.latin, x, y + 14);

      ctx.font = "22px 'Noto Sans Shavian', sans-serif";
      ctx.fillStyle = gloss.marker !== "none" ? "#ff9f43" : SHAVIAN_COLOR;
      const shavianText = gloss.phonemes.map((p) => p.shavian).join("");
      const prefix = markerPrefix(gloss.marker);
      ctx.fillText(prefix + shavianText, x, y + 42);

      ctx.font = "13px system-ui";
      ctx.fillStyle = IPA_COLOR;
      ctx.fillText(gloss.ipa, x, y + 62);

      const latinWidth = ctx.measureText(gloss.latin).width;
      ctx.font = "22px 'Noto Sans Shavian', sans-serif";
      const shavianWidth = ctx.measureText(prefix + shavianText).width;
      const width = Math.max(latinWidth, shavianWidth) + WORD_GAP;
      x += width;
    }
    y += LINE_HEIGHT;
  }

  ctx.font = "12px system-ui";
  ctx.fillStyle = BRAND_COLOR;
  ctx.textAlign = "right";
  ctx.fillText("delphi.tools", CANVAS_WIDTH - PADDING, canvas.height - PADDING + 8);

  const link = document.createElement("a");
  link.download = "shavian-gloss.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
