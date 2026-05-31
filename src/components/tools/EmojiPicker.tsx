import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import emojiUnicodeData from "unicode-emoji-json";
import emojiKeywords from "emojilib";
import twemoji from "twemoji";

interface EmojiInfo {
  emoji: string;
  title: string;
  group: string;
  keywords: string[];
  codePoints: string;
  unicode: string;
}

function getCodePoints(emoji: string) {
  const pts: string[] = [];
  let i = 0;
  while (i < emoji.length) {
    const cp = emoji.codePointAt(i);
    if (cp === undefined) break;
    pts.push(`U+${cp.toString(16).toUpperCase()}`);
    i += cp > 0xFFFF ? 2 : 1;
  }
  return pts.join(" ");
}

function escapeUnicode(emoji: string) {
  const pts: string[] = [];
  let i = 0;
  while (i < emoji.length) {
    const cp = emoji.codePointAt(i);
    if (cp === undefined) break;
    pts.push(`\\u{${cp.toString(16).toUpperCase()}}`);
    i += cp > 0xFFFF ? 2 : 1;
  }
  return pts.join("");
}

function isCountryFlag(emoji: string, info: EmojiInfo): boolean {
  if (info.group !== "Flags") return false;
  const cp0 = emoji.codePointAt(0);
  const cp2 = emoji.length > 2 ? emoji.codePointAt(2) : 0;
  if (!cp0 || !cp2) return false;
  return cp0 >= 0x1F1E6 && cp0 <= 0x1F1FF && cp2 >= 0x1F1E6 && cp2 <= 0x1F1FF;
}

function getTwemojiUrl(emoji: string): string {
  const parts: string[] = [];
  let i = 0;
  while (i < emoji.length) {
    const cp = emoji.codePointAt(i);
    if (cp === undefined) break;
    parts.push(cp.toString(16));
    i += cp > 0xFFFF ? 2 : 1;
  }
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${parts.join("-")}.svg`;
}

const allEmojis: EmojiInfo[] = Object.entries(emojiUnicodeData).map(([emoji, info]) => ({
  emoji,
  title: info.name.charAt(0).toUpperCase() + info.name.slice(1),
  group: info.group,
  keywords: (emojiKeywords as Record<string, string[]>)[emoji] ?? [],
  codePoints: getCodePoints(emoji),
  unicode: escapeUnicode(emoji),
}));

const groups = Object.entries(
  allEmojis.reduce<Record<string, EmojiInfo[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {}),
).map(([group, emojiInfos]) => ({ group, emojiInfos }));

const groupOrder = [
  "Smileys & Emotion", "People & Body", "Component", "Animals & Nature",
  "Food & Drink", "Travel & Places", "Activities", "Objects",
  "Symbols", "Flags",
];

groups.sort((a, b) => {
  const ai = groupOrder.indexOf(a.group);
  const bi = groupOrder.indexOf(b.group);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
});

function EmojiIcon({ emoji, info }: { emoji: string; info: EmojiInfo }) {
  if (isCountryFlag(emoji, info)) {
    const url = getTwemojiUrl(emoji);
    return (
      <img
        src={url}
        alt={info.title}
        className="inline-block h-[1.8em] w-auto align-[-0.2em]"
        loading="lazy"
      />
    );
  }
  return <>{emoji}</>;
}

export default function EmojiPicker() {
  const [search, setSearch] = useState("");

  const searchResult = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const results = allEmojis.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.emoji.includes(q) ||
        e.group.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q)) ||
        e.codePoints.toLowerCase().includes(q) ||
        e.unicode.toLowerCase().includes(q),
    );
    return results;
  }, [search]);

  const copyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    toast(`Emoji ${emoji} copied to the clipboard`);
  };
  const copyCode = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast(`${label} '${val}' copied to the clipboard`);
  };

  return (
    <div className="mx-auto max-w-[2400px]">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <span>Total: <span className="font-bold text-foreground">{allEmojis.length}</span> emojis</span>
        {groups.map((g) => (
          <span key={g.group} className="text-muted-foreground/60">
            {g.group}: <span className="font-bold text-foreground">{g.emojiInfos.length}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative mx-auto w-full max-w-[600px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis (e.g. 'smile')..."
            className="h-9 w-full rounded-sm pl-9 font-mono text-xs"
          />
        </div>
      </div>

      {searchResult !== null ? (
        searchResult.length === 0 ? (
          <div className="mt-4 text-xl font-bold text-muted-foreground">No results</div>
        ) : (
          <>
            <div className="mt-4 text-xl font-bold text-foreground">Search result</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {searchResult.map((info, i) => (
                <div key={info.emoji} className="flex min-w-0 flex-col gap-1 rounded-sm border border-border bg-surface px-2 py-2">
                  <span className="font-mono text-[10px] text-muted-foreground/50">{i + 1}</span>
                  <div className="text-3xl flex items-center justify-center"><EmojiIcon emoji={info.emoji} info={info} /></div>
                  <button className="cursor-pointer rounded-sm border border-border bg-surface px-2 py-0.5 text-center font-mono text-[10px] text-foreground hover:bg-muted transition" onClick={() => copyEmoji(info.emoji)}>Copy emoji</button>
                  <div className="text-center font-bold font-mono text-[11px] text-foreground break-words">{info.title}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground/70">
                    <span className="inline-flex items-center gap-1">
                      <button className="cursor-pointer break-all transition hover:text-primary" onClick={() => copyCode(info.codePoints, "Code points")}>{info.codePoints}</button>
                      <button onClick={() => copyCode(info.codePoints, "Code points")} className="shrink-0 transition hover:text-primary" title="Copy code points">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <button className="cursor-pointer break-all transition hover:text-primary" onClick={() => copyCode(info.unicode, "Unicode")}>{info.unicode}</button>
                      <button onClick={() => copyCode(info.unicode, "Unicode")} className="shrink-0 transition hover:text-primary" title="Copy unicode">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        groups.map(({ group, emojiInfos }) => (
          <div key={group}>
            <div className="mt-4 text-xl font-bold text-foreground">{group} ({emojiInfos.length})</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {emojiInfos.map((info, i) => (
                <div key={info.emoji} className="flex min-w-0 flex-col gap-1 rounded-sm border border-border bg-surface px-2 py-2">
                  <span className="font-mono text-[10px] text-muted-foreground/50">{i + 1}</span>
                  <div className="text-3xl flex items-center justify-center"><EmojiIcon emoji={info.emoji} info={info} /></div>
                  <button className="cursor-pointer rounded-sm border border-border bg-surface px-2 py-0.5 text-center font-mono text-[10px] text-foreground hover:bg-muted transition" onClick={() => copyEmoji(info.emoji)}>Copy emoji</button>
                  <div className="text-center font-bold font-mono text-[11px] text-foreground break-words">{info.title}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground/70">
                    <span className="inline-flex items-center gap-1">
                      <button className="cursor-pointer break-all transition hover:text-primary" onClick={() => copyCode(info.codePoints, "Code points")}>{info.codePoints}</button>
                      <button onClick={() => copyCode(info.codePoints, "Code points")} className="shrink-0 transition hover:text-primary" title="Copy code points">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <button className="cursor-pointer break-all transition hover:text-primary" onClick={() => copyCode(info.unicode, "Unicode")}>{info.unicode}</button>
                      <button onClick={() => copyCode(info.unicode, "Unicode")} className="shrink-0 transition hover:text-primary" title="Copy unicode">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
