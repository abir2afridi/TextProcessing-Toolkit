import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface Item {
  pattern: string;
  desc: string;
  example: string;
}
interface Section {
  title: string;
  items: Item[];
}

const sections: Section[] = [
  {
    title: "Anchors",
    items: [
      { pattern: "^", desc: "Start of string", example: "^hello matches hello..." },
      { pattern: "$", desc: "End of string", example: "...world$ matches ...world" },
      { pattern: "\\b", desc: "Word boundary", example: "\\bword\\b matches word" },
      { pattern: "\\B", desc: "Non-word boundary", example: "\\Bword\\B" },
    ],
  },
  {
    title: "Character Classes",
    items: [
      { pattern: ".", desc: "Any char except newline", example: "h.t matches hat, h*t" },
      { pattern: "\\d", desc: "Digit [0-9]", example: "\\d{3} matches 123" },
      { pattern: "\\w", desc: "Word char [a-zA-Z0-9_]", example: "\\w+ matches hello" },
      { pattern: "\\s", desc: "Whitespace", example: "\\s matches space/tab" },
      { pattern: "\\D", desc: "Non-digit", example: "\\D+ matches abc" },
      { pattern: "\\W", desc: "Non-word char", example: "\\W matches @, #" },
      { pattern: "\\S", desc: "Non-whitespace", example: "\\S+ matches hello" },
      { pattern: "[abc]", desc: "Set: a, b, or c", example: "[aeiou] matches vowel" },
      { pattern: "[^abc]", desc: "Negated set", example: "[^0-9] matches non-digit" },
      { pattern: "[a-z]", desc: "Range a to z", example: "[a-f] matches a-f" },
    ],
  },
  {
    title: "Quantifiers",
    items: [
      { pattern: "*", desc: "0 or more", example: "ab*c matches ac, abc, abbc" },
      { pattern: "+", desc: "1 or more", example: "ab+c matches abc, abbc" },
      { pattern: "?", desc: "0 or 1", example: "colou?r matches color/colour" },
      { pattern: "{n}", desc: "Exactly n", example: "\\d{3} matches 123" },
      { pattern: "{n,}", desc: "n or more", example: "\\d{2,} matches 12, 123" },
      { pattern: "{n,m}", desc: "Between n and m", example: "\\d{2,4} matches 12-1234" },
      { pattern: "*?", desc: "Lazy *", example: "<.*?> matches <a> not <a>b</a>" },
      { pattern: "+?", desc: "Lazy +", example: "\\w+? matches minimal word" },
    ],
  },
  {
    title: "Groups",
    items: [
      { pattern: "(abc)", desc: "Capturing group", example: "(\\w+) captures word" },
      { pattern: "(?:abc)", desc: "Non-capturing group", example: "(?:abc) no capture" },
      { pattern: "\\1", desc: "Backreference", example: "(\\w)\\1 matches aa, bb" },
      { pattern: "(?<name>...)", desc: "Named group", example: "(?<year>\\d{4})" },
      { pattern: "\\k<name>", desc: "Named backref", example: "\\k<year> references year" },
      { pattern: "|", desc: "Alternation (OR)", example: "cat|dog matches cat or dog" },
    ],
  },
  {
    title: "Escapes",
    items: [
      { pattern: "\\.", desc: "Escape meta char", example: "\\. matches literal dot" },
      { pattern: "\\n", desc: "Newline", example: "line1\\nline2" },
      { pattern: "\\r", desc: "Carriage return", example: "\\r\\n in Windows" },
      { pattern: "\\t", desc: "Tab", example: "col1\\tcol2" },
      { pattern: "\\0", desc: "Null character", example: "\\0" },
      { pattern: "\\\\", desc: "Literal backslash", example: "\\\\\\\\ matches \\" },
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
  {
    title: "Lookahead / Lookbehind",
    items: [
      { pattern: "(?=abc)", desc: "Positive lookahead", example: "x(?=y) matches x if followed by y" },
      { pattern: "(?!abc)", desc: "Negative lookahead", example: "x(?!y) matches x if not followed by y" },
      { pattern: "(?<=abc)", desc: "Positive lookbehind", example: "(?<=y)x matches x if preceded by y" },
      { pattern: "(?<!abc)", desc: "Negative lookbehind", example: "(?<!y)x matches x if not preceded by y" },
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
          i.example.toLowerCase().includes(q)
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
                  <p className="font-mono text-[10px] text-muted-foreground/60">{item.example}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
