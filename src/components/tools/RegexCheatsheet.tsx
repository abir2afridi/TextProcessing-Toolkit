import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface Item {
  pattern: string;
  desc: string;
  example?: string;
  note?: string;
}
interface Section {
  title: string;
  items: Item[];
}

const sections: Section[] = [
  {
    title: "Normal characters",
    items: [
      { pattern: ".", desc: "Any character excluding a newline or carriage return" },
      { pattern: "[A-Za-z]", desc: "Alphabet" },
      { pattern: "[a-z]", desc: "Lowercase alphabet" },
      { pattern: "[A-Z]", desc: "Uppercase alphabet" },
      { pattern: "\\d", desc: "Digit [0-9]" },
      { pattern: "\\D", desc: "Non-digit [^0-9]" },
      { pattern: "_", desc: "Underscore" },
      { pattern: "\\w", desc: "Alphabet, digit or underscore [A-Za-z0-9_]" },
      { pattern: "\\W", desc: "Inverse of \\w [^A-Za-z0-9_]" },
      { pattern: "\\S", desc: "Inverse of \\s" },
    ],
  },
  {
    title: "Whitespace characters",
    items: [
      { pattern: " ", desc: "Space" },
      { pattern: "\\t", desc: "Tab" },
      { pattern: "\\n", desc: "Newline" },
      { pattern: "\\r", desc: "Carriage return" },
      { pattern: "\\s", desc: "Space, tab, newline or carriage return" },
    ],
  },
  {
    title: "Character set",
    items: [
      { pattern: "[xyz]", desc: "Either x, y or z" },
      { pattern: "[^xyz]", desc: "Neither x, y nor z" },
      { pattern: "[1-3]", desc: "Either 1, 2 or 3" },
      { pattern: "[^1-3]", desc: "Neither 1, 2 nor 3" },
    ],
  },
  {
    title: "Characters that require escaping",
    items: [
      { pattern: "\\.", desc: "Period (outside character set)", example: "matches literal dot" },
      { pattern: "\\^", desc: "Caret (outside character set)", example: "escaped ^" },
      { pattern: "\\$", desc: "Dollar sign", example: "\\$ matches literal $" },
      { pattern: "\\|", desc: "Pipe", example: "\\| matches literal |" },
      { pattern: "\\\\", desc: "Back slash", example: "\\\\\\\\ matches \\" },
      { pattern: "\\/", desc: "Forward slash", example: "\\/literal\\/" },
      { pattern: "\\(", desc: "Opening bracket", example: "\\\\(" },
      { pattern: "\\)", desc: "Closing bracket", example: "\\\\)" },
      { pattern: "\\[", desc: "Opening square bracket", example: "\\\\[" },
      { pattern: "\\]", desc: "Closing square bracket", example: "\\\\]" },
      { pattern: "\\{", desc: "Opening curly bracket", example: "\\\\{" },
      { pattern: "\\}", desc: "Closing curly bracket", example: "\\\\}" },
    ],
  },
  {
    title: "Character set escaping rules",
    items: [
      { pattern: "\\\\", desc: "Back slash (inside character set)" },
      { pattern: "\\]", desc: "Closing square bracket (inside character set)" },
      { pattern: "^", desc: "Must be escaped only if immediately after [", note: "e.g. [^abc] negates, [abc^] is literal" },
      { pattern: "-", desc: "Must be escaped if between two letters/digits", note: "e.g. [a-z] is range, [a\\-z] is literal -, a, z" },
    ],
  },
  {
    title: "Quantifiers",
    items: [
      { pattern: "{n}", desc: "Exactly n", example: "\\d{3} matches 123" },
      { pattern: "{n,}", desc: "n or more", example: "\\d{2,} matches 12, 123" },
      { pattern: "{n,m}", desc: "Between n and m", example: "\\d{2,4} matches 12-1234" },
      { pattern: "*", desc: "0 or more", example: "ab*c matches ac, abc, abbc" },
      { pattern: "+", desc: "1 or more", example: "ab+c matches abc, abbc" },
      { pattern: "?", desc: "Exactly 0 or 1", example: "colou?r matches color/colour" },
      { pattern: "*?", desc: "Lazy *", example: "<.*?> matches <a> not <a>b</a>" },
      { pattern: "+?", desc: "Lazy +", example: "\\w+? matches minimal word" },
    ],
  },
  {
    title: "Anchors",
    items: [
      { pattern: "^", desc: "Start of string", example: "^hello matches hello..." },
      { pattern: "$", desc: "End of string", example: "...world$ matches ...world" },
      { pattern: "\\b", desc: "Word boundary", example: "\\bword\\b matches word", note: "Matches at start/end of string if char is \\w, or between \\w and \\W" },
      { pattern: "\\B", desc: "Non-word boundary", example: "\\Bword\\B" },
    ],
  },
  {
    title: "Alternation & lookaround",
    items: [
      { pattern: "foo|bar", desc: "Match either foo or bar" },
      { pattern: "foo(?=bar)", desc: "Match foo if it's before bar" },
      { pattern: "foo(?!bar)", desc: "Match foo if it's not before bar" },
      { pattern: "(?<=bar)foo", desc: "Match foo if it's after bar" },
      { pattern: "(?<!bar)foo", desc: "Match foo if it's not after bar" },
    ],
  },
  {
    title: "Groups",
    items: [
      { pattern: "(abc)", desc: "Capturing group; match and capture abc" },
      { pattern: "(?:abc)", desc: "Non-capturing group; match abc without capturing" },
      { pattern: "\\1", desc: "Backreference to 1st capturing group", example: "(\\w)\\1 matches aa, bb" },
      { pattern: "(?<name>...)", desc: "Named capturing group", example: "(?<year>\\d{4})" },
      { pattern: "\\k<name>", desc: "Named backreference", example: "\\k<year> references year" },
    ],
  },
  {
    title: "Flags",
    items: [
      { pattern: "g", desc: "Global (all matches)", example: "/abc/g finds all abc" },
      { pattern: "i", desc: "Case-insensitive", example: "/abc/i matches AbC" },
      { pattern: "m", desc: "Multiline (^/$ per line)", example: "/^test/m" },
      { pattern: "s", desc: "Dotall (. matches newline)", example: "/.+/s" },
      { pattern: "u", desc: "Unicode", example: "/\\p{L}/u" },
      { pattern: "y", desc: "Sticky (lastIndex)", example: "/abc/y" },
    ],
  },
];

export default function RegexCheatsheet() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return sections;
    const q = search.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) =>
          i.pattern.toLowerCase().includes(q) ||
          i.desc.toLowerCase().includes(q) ||
          (i.example ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface px-3 py-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cheatsheet…"
          className="h-8 rounded-sm font-mono text-xs"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((section) => (
          <div key={section.title} className="rounded-sm border border-border bg-surface">
            <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {section.title}
            </div>
            <div className="divide-y divide-border/50">
              {section.items.map((item) => (
                <div key={item.pattern + item.desc} className="px-3 py-2">
                  <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs text-primary">{item.pattern}</code>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{item.desc}</p>
                  {item.example && (
                    <p className="font-mono text-[10px] text-muted-foreground/60">{item.example}</p>
                  )}
                  {item.note && (
                    <p className="mt-0.5 font-mono text-[10px] italic text-muted-foreground/50">{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
