// Pure text-processing utilities. No DOM, no IO. Unicode-safe where noted.

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function graphemes(s: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(s), (x) => x.segment);
  return Array.from(s);
}

export function codepoints(s: string): number[] {
  return Array.from(s, (c) => c.codePointAt(0)!);
}

export function countStats(text: string) {
  const chars = graphemes(text).length;
  const charsNoSpace = graphemes(text.replace(/\s/g, "")).length;
  const bytes = new TextEncoder().encode(text).length;
  const lines = text.length === 0 ? 0 : text.split(/\r?\n/).length;
  const words = (text.match(/\p{L}[\p{L}\p{M}\p{N}'’-]*|\p{N}+/gu) || []).length;
  const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length).length;
  const readingMinutes = Math.max(1, Math.round(words / 220));
  return {
    chars,
    charsNoSpace,
    bytes,
    lines,
    words,
    sentences,
    paragraphs,
    readingMinutes,
  };
}

// --- Case ---
export function toUpper(s: string) { return s.toUpperCase(); }
export function toLower(s: string) { return s.toLowerCase(); }
export function toTitle(s: string) {
  return s.toLowerCase().replace(/\b(\p{L})(\p{L}*)/gu, (_, a, b) => a.toUpperCase() + b);
}
export function toSentence(s: string) {
  return s.toLowerCase().replace(/(^|[.!?]\s+)(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
}
const splitWords = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-./\\]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
export function toCamel(s: string) {
  const w = splitWords(s).map((x) => x.toLowerCase());
  return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join("");
}
export function toPascal(s: string) {
  return splitWords(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join("");
}
export function toSnake(s: string) { return splitWords(s).map((x) => x.toLowerCase()).join("_"); }
export function toKebab(s: string) { return splitWords(s).map((x) => x.toLowerCase()).join("-"); }
export function toConstant(s: string) { return splitWords(s).map((x) => x.toUpperCase()).join("_"); }
export function toDot(s: string) { return splitWords(s).map((x) => x.toLowerCase()).join("."); }
export function alternateCase(s: string) {
  let i = 0;
  return Array.from(s).map((c) => (/\p{L}/u.test(c) ? (i++ % 2 === 0 ? c.toLowerCase() : c.toUpperCase()) : c)).join("");
}
export function inverseCase(s: string) {
  return Array.from(s).map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
}
export function toHeader(s: string) {
  return splitWords(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join("-");
}
export function toNo(s: string) {
  return splitWords(s).map((x) => x.toLowerCase()).join(" ");
}
export function toPath(s: string) {
  return splitWords(s).map((x) => x.toLowerCase()).join("/");
}
export function toMocking(s: string) {
  return Array.from(s).map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase())).join("");
}

// --- Whitespace ---
export interface WhitespaceOpts {
  trimLines: boolean;
  collapseSpaces: boolean;
  removeEmptyLines: boolean;
  trimAll: boolean;
  tabsToSpaces: number; // 0 = off
  removeAllWhitespace: boolean;
}
export function cleanWhitespace(text: string, o: WhitespaceOpts): string {
  let t = text;
  if (o.removeAllWhitespace) return t.replace(/\s+/g, "");
  if (o.tabsToSpaces > 0) t = t.replace(/\t/g, " ".repeat(o.tabsToSpaces));
  let lines = t.split(/\r?\n/);
  if (o.trimLines) lines = lines.map((l) => l.trim());
  if (o.collapseSpaces) lines = lines.map((l) => l.replace(/[ \t]+/g, " "));
  if (o.removeEmptyLines) lines = lines.filter((l) => l.trim().length > 0);
  let out = lines.join("\n");
  if (o.trimAll) out = out.trim();
  return out;
}

// --- Sort / Dedupe / Reverse / Numbering ---
export function sortLines(text: string, mode: "asc" | "desc" | "len-asc" | "len-desc" | "num-asc" | "num-desc" | "shuffle", caseInsensitive = true): string {
  const lines = text.split(/\r?\n/);
  const cmp = (a: string, b: string) => {
    const ax = caseInsensitive ? a.toLocaleLowerCase() : a;
    const bx = caseInsensitive ? b.toLocaleLowerCase() : b;
    return ax.localeCompare(bx, undefined, { numeric: true });
  };
  let out = [...lines];
  switch (mode) {
    case "asc": out.sort(cmp); break;
    case "desc": out.sort((a, b) => cmp(b, a)); break;
    case "len-asc": out.sort((a, b) => a.length - b.length); break;
    case "len-desc": out.sort((a, b) => b.length - a.length); break;
    case "num-asc": out.sort((a, b) => parseFloat(a) - parseFloat(b)); break;
    case "num-desc": out.sort((a, b) => parseFloat(b) - parseFloat(a)); break;
    case "shuffle":
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      break;
  }
  return out.join("\n");
}

export function dedupeLines(text: string, opts: { caseInsensitive: boolean; trim: boolean; keepBlank: boolean }): { text: string; removed: number } {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const out: string[] = [];
  let removed = 0;
  for (const l of lines) {
    const key = (opts.trim ? l.trim() : l);
    if (!opts.keepBlank && key.length === 0) { removed++; continue; }
    const k = opts.caseInsensitive ? key.toLocaleLowerCase() : key;
    if (seen.has(k)) { removed++; continue; }
    seen.add(k);
    out.push(l);
  }
  return { text: out.join("\n"), removed };
}

export function reverseText(text: string, mode: "chars" | "words" | "lines"): string {
  if (mode === "lines") return text.split(/\r?\n/).reverse().join("\n");
  if (mode === "words") return text.split(/(\s+)/).reverse().join("");
  return graphemes(text).reverse().join("");
}

export function numberLines(text: string, opts: { start: number; pad: boolean; sep: string; skipEmpty: boolean }): string {
  const lines = text.split(/\r?\n/);
  const total = lines.length + opts.start - 1;
  const width = String(total).length;
  let n = opts.start;
  return lines
    .map((l) => {
      if (opts.skipEmpty && l.trim() === "") return l;
      const num = String(n++);
      return (opts.pad ? num.padStart(width, "0") : num) + opts.sep + l;
    })
    .join("\n");
}

export function affixLines(text: string, prefix: string, suffix: string, skipEmpty: boolean): string {
  return text
    .split(/\r?\n/)
    .map((l) => (skipEmpty && l.trim() === "" ? l : prefix + l + suffix))
    .join("\n");
}

// --- Find/replace + regex ---
export function findReplace(text: string, find: string, replace: string, opts: { regex: boolean; flags: string; caseInsensitive: boolean; whole: boolean }): { text: string; count: number } {
  if (find === "") return { text, count: 0 };
  let pattern: RegExp;
  if (opts.regex) {
    pattern = new RegExp(find, opts.flags.includes("g") ? opts.flags : opts.flags + "g");
  } else {
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const f = "g" + (opts.caseInsensitive ? "i" : "") + "u";
    pattern = new RegExp(opts.whole ? `\\b${escaped}\\b` : escaped, f);
  }
  let count = 0;
  const out = text.replace(pattern, (...args) => {
    count++;
    // Support $1 etc. only in regex mode
    if (opts.regex) return replace.replace(/\$(\d+)/g, (_, i) => args[Number(i)] ?? "");
    return replace;
  });
  return { text: out, count };
}

// --- Frequency ---
export function wordFrequency(text: string): { word: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu)) {
    const w = m[0].toLowerCase();
    map.set(w, (map.get(w) || 0) + 1);
  }
  return [...map].map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count);
}

export function charFrequency(text: string, includeWhitespace = false): { char: string; code: number; count: number }[] {
  const map = new Map<string, number>();
  for (const g of graphemes(text)) {
    if (!includeWhitespace && /^\s+$/.test(g)) continue;
    map.set(g, (map.get(g) || 0) + 1);
  }
  return [...map].map(([char, count]) => ({ char, code: char.codePointAt(0)!, count })).sort((a, b) => b.count - a.count);
}

// --- JSON / XML / SQL ---
export function formatJSON(text: string, indent = 2): string {
  return JSON.stringify(JSON.parse(text), null, indent);
}
export function minifyJSON(text: string): string {
  return JSON.stringify(JSON.parse(text));
}
export function formatXML(xml: string, indent = 2): string {
  const PADDING = " ".repeat(indent);
  let formatted = "";
  let pad = 0;
  const reg = xml.replace(/>\s*</g, ">\n<").split("\n");
  for (const node of reg) {
    let i = 0;
    if (/^<\/\w/.test(node)) pad = Math.max(pad - 1, 0);
    else if (/^<\w[^>]*[^/]>.*$/.test(node) && !/<\/\w/.test(node)) i = 1;
    formatted += PADDING.repeat(pad) + node + "\n";
    pad += i;
  }
  return formatted.trim();
}
export function formatSQL(sql: string): string {
  const keywords = [
    "SELECT","FROM","WHERE","INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL JOIN","JOIN",
    "GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","INSERT INTO","VALUES","UPDATE","SET",
    "DELETE FROM","CREATE TABLE","ALTER TABLE","DROP TABLE","UNION ALL","UNION","ON",
  ];
  let out = sql.replace(/\s+/g, " ").trim();
  for (const k of keywords) {
    const re = new RegExp(`\\b${k}\\b`, "gi");
    out = out.replace(re, "\n" + k.toUpperCase());
  }
  return out.replace(/,\s*/g, ",\n  ").trim();
}

// --- Encode / decode ---
export const encoders = {
  base64Encode: (s: string) => {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  },
  base64Decode: (s: string) => {
    const bin = atob(s.trim());
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  },
  urlEncode: (s: string) => encodeURIComponent(s),
  urlDecode: (s: string) => decodeURIComponent(s),
  hexEncode: (s: string) =>
    Array.from(new TextEncoder().encode(s)).map((b) => b.toString(16).padStart(2, "0")).join(""),
  hexDecode: (s: string) => {
    const clean = s.replace(/\s+/g, "");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    return new TextDecoder().decode(bytes);
  },
  htmlEncode: (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)),
  htmlDecode: (s: string) => {
    const map: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
    return s.replace(/&(#?\w+);/g, (_, e) => {
      if (e[0] === "#") return String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return map[e] ?? `&${e};`;
    });
  },
  binaryEncode: (s: string) =>
    Array.from(new TextEncoder().encode(s)).map((b) => b.toString(2).padStart(8, "0")).join(" "),
  binaryDecode: (s: string) => {
    const parts = s.trim().split(/\s+/);
    const bytes = Uint8Array.from(parts, (p) => parseInt(p, 2));
    return new TextDecoder().decode(bytes);
  },
};

// --- Hash (SubtleCrypto) ---
export async function hash(text: string, algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const out = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(out)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Diff (LCS line diff) ---
export type DiffOp = { type: "equal" | "add" | "remove"; line: string };
export function diffLines(a: string, b: string): DiffOp[] {
  const A = a.split(/\r?\n/);
  const B = b.split(/\r?\n/);
  const n = A.length, m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: DiffOp[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { ops.push({ type: "equal", line: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "remove", line: A[i] }); i++; }
    else { ops.push({ type: "add", line: B[j] }); j++; }
  }
  while (i < n) ops.push({ type: "remove", line: A[i++] });
  while (j < m) ops.push({ type: "add", line: B[j++] });
  return ops;
}

// --- Slug ---
export function slugify(s: string, sep = "-"): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^${sep}+|${sep}+$`, "g"), "");
}

// --- Markdown ↔ HTML (minimal) ---
export function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  let html = esc(md);
  html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^(?:- |\* )(.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
  html = html.replace(/^(?!<h\d|<ul|<pre|<li|<\/)(.+)$/gm, "<p>$1</p>");
  return html;
}
export function htmlToMd(html: string): string {
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol|p)[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>(\n)?/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --- Generators ---
const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function lorem(paragraphs: number, sentencesPer = 5, wordsPer = 12): string {
  const para = () => {
    const sents: string[] = [];
    for (let i = 0; i < sentencesPer; i++) {
      const words: string[] = [];
      for (let j = 0; j < wordsPer; j++) words.push(LOREM[Math.floor(Math.random() * LOREM.length)]);
      let s = words.join(" ");
      s = s[0].toUpperCase() + s.slice(1) + ".";
      sents.push(s);
    }
    return sents.join(" ");
  };
  return Array.from({ length: paragraphs }, para).join("\n\n");
}

export function uuidV4(): string {
  const c: Crypto = globalThis.crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x: number) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function password(opts: { length: number; upper: boolean; lower: boolean; digits: boolean; symbols: boolean; ambiguous: boolean }): string {
  let pool = "";
  if (opts.upper) pool += "ABCDEFGHJKLMNPQRSTUVWXYZ" + (opts.ambiguous ? "IO" : "");
  if (opts.lower) pool += "abcdefghijkmnpqrstuvwxyz" + (opts.ambiguous ? "lo" : "");
  if (opts.digits) pool += "23456789" + (opts.ambiguous ? "01" : "");
  if (opts.symbols) pool += "!@#$%^&*()-_=+[]{};:,.?/";
  if (!pool) return "";
  const arr = crypto.getRandomValues(new Uint32Array(opts.length));
  let out = "";
  for (let i = 0; i < opts.length; i++) out += pool[arr[i] % pool.length];
  return out;
}

export function randomString(opts: { length: number; charset: string; count: number }): string {
  const lines: string[] = [];
  for (let i = 0; i < opts.count; i++) {
    const arr = crypto.getRandomValues(new Uint32Array(opts.length));
    let s = "";
    for (let j = 0; j < opts.length; j++) s += opts.charset[arr[j] % opts.charset.length];
    lines.push(s);
  }
  return lines.join("\n");
}

// ============================================================
// Extended utilities for additional tools
// ============================================================

// --- JWT ---
export function decodeJWT(token: string) {
  const parts = token.trim().split(".");
  if (parts.length < 2) throw new Error("Invalid JWT: expected 3 dot-separated segments");
  const b64url = (s: string) => {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return atob(s);
  };
  const header = JSON.parse(b64url(parts[0]));
  const payload = JSON.parse(b64url(parts[1]));
  const signature = parts[2] || "";
  return { header, payload, signature };
}

// --- CSV / JSON ---
export function csvToJSON(csv: string, delimiter = ","): unknown[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let i = 0;
  let inQ = false;
  while (i < csv.length) {
    const c = csv[i];
    if (inQ) {
      if (c === '"' && csv[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === delimiter) { cur.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.length && !(r.length === 1 && r[0] === "")).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, idx) => (o[h] = r[idx] ?? ""));
    return o;
  });
}
export function jsonToCSV(json: unknown, delimiter = ","): string {
  if (!Array.isArray(json) || !json.length) return "";
  const headers = Array.from(new Set(json.flatMap((r) => Object.keys(r as object))));
  const esc = (v: unknown) => {
    const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(delimiter)];
  for (const row of json as Record<string, unknown>[]) {
    lines.push(headers.map((h) => esc(row[h])).join(delimiter));
  }
  return lines.join("\n");
}

// --- YAML <-> JSON (minimal: scalars, nested maps, arrays of scalars/maps) ---
export function jsonToYAML(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (typeof value !== "object") {
    const s = String(value);
    if (typeof value === "string" && /[:#\-?&*!|>'"%@`,\[\]{}]/.test(s)) return JSON.stringify(s);
    return s;
  }
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value.map((v) => {
      if (v && typeof v === "object") {
        const block = jsonToYAML(v, indent + 1);
        const first = block.split("\n")[0];
        const rest = block.split("\n").slice(1).join("\n");
        return `${pad}- ${first.trimStart()}${rest ? "\n" + rest : ""}`;
      }
      return `${pad}- ${jsonToYAML(v, 0)}`;
    }).join("\n");
  }
  const entries = Object.entries(value as object);
  if (!entries.length) return "{}";
  return entries.map(([k, v]) => {
    if (v && typeof v === "object") {
      const child = jsonToYAML(v, indent + 1);
      return `${pad}${k}:\n${child}`;
    }
    return `${pad}${k}: ${jsonToYAML(v, 0)}`;
  }).join("\n");
}
export function yamlToJSON(yaml: string): unknown {
  // minimal parser: indent-based, supports nested maps and lists of scalars
  const lines = yaml.replace(/\r/g, "").split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const parseScalar = (s: string): unknown => {
    s = s.trim();
    if (s === "" || s === "~" || s === "null") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
    return s;
  };
  // Build a tree using indentation
  type Node = { indent: number; key?: string; isItem?: boolean; value?: unknown; children: Node[] };
  const root: Node = { indent: -1, children: [] };
  const stack: Node[] = [root];
  for (const raw of lines) {
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1];
    if (line.startsWith("- ")) {
      const rest = line.slice(2);
      if (rest.includes(":") && !/^["']/.test(rest)) {
        // list item that is a map: "- key: val"
        const node: Node = { indent, isItem: true, children: [] };
        parent.children.push(node);
        const [k, ...v] = rest.split(":");
        const val = v.join(":").trim();
        const child: Node = { indent: indent + 2, key: k.trim(), value: val ? parseScalar(val) : undefined, children: [] };
        node.children.push(child);
        stack.push(node);
        stack.push(child);
      } else {
        parent.children.push({ indent, isItem: true, value: parseScalar(rest), children: [] });
      }
    } else {
      const idx = line.indexOf(":");
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      const node: Node = { indent, key, value: val ? parseScalar(val) : undefined, children: [] };
      parent.children.push(node);
      stack.push(node);
    }
  }
  const build = (n: Node): unknown => {
    if (!n.children.length) return n.value;
    if (n.children.every((c) => c.isItem)) {
      return n.children.map((c) => (c.children.length ? build(c) : c.value));
    }
    const obj: Record<string, unknown> = {};
    for (const c of n.children) if (c.key) obj[c.key] = build(c);
    return obj;
  };
  const top = root.children;
  if (top.length === 1 && !top[0].isItem && top[0].key === undefined) return build(top[0]);
  return build(root);
}

// --- URL parser ---
export function parseURL(input: string) {
  const u = new URL(input);
  const params: { key: string; value: string }[] = [];
  u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
  return {
    protocol: u.protocol,
    host: u.host,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    origin: u.origin,
    username: u.username,
    password: u.password,
    params,
  };
}

// --- Number base ---
export function convertBase(input: string, from: number, to: number): string {
  const n = parseInt(input.trim().replace(/^0[box]/i, ""), from);
  if (Number.isNaN(n)) throw new Error("Invalid number for base " + from);
  return n.toString(to);
}

// --- Timestamp ---
export function parseTimestamp(s: string) {
  const trimmed = s.trim();
  let ms: number;
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    ms = trimmed.length <= 10 ? n * 1000 : n;
  } else {
    ms = new Date(trimmed).getTime();
  }
  if (Number.isNaN(ms)) throw new Error("Unrecognized timestamp");
  const d = new Date(ms);
  return {
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toString(),
    epochSec: Math.floor(ms / 1000),
    epochMs: ms,
    relative: relativeTime(ms),
  };
}
function relativeTime(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [31536000000, "year"], [2592000000, "month"], [86400000, "day"],
    [3600000, "hour"], [60000, "minute"], [1000, "second"],
  ];
  for (const [u, name] of units) {
    if (abs >= u) {
      const n = Math.round(diff / u);
      return n >= 0 ? `in ${n} ${name}${Math.abs(n) === 1 ? "" : "s"}` : `${-n} ${name}${Math.abs(n) === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

// --- Color ---
export function parseColor(input: string) {
  const s = input.trim();
  let r = 0, g = 0, b = 0, a = 1;
  const hex = s.match(/^#?([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 4) h = h.split("").map((c) => c + c).join("");
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
  } else {
    const m = s.match(/rgba?\s*\(([^)]+)\)/i);
    if (m) {
      const parts = m[1].split(/[,/\s]+/).filter(Boolean);
      r = +parts[0]; g = +parts[1]; b = +parts[2];
      if (parts[3]) a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    } else {
      const hsl = s.match(/hsla?\s*\(([^)]+)\)/i);
      if (hsl) {
        const p = hsl[1].split(/[,/\s]+/).filter(Boolean);
        const H = parseFloat(p[0]);
        const S = parseFloat(p[1]) / 100;
        const L = parseFloat(p[2]) / 100;
        const [rr, gg, bb] = hslToRgb(H, S, L);
        r = rr; g = gg; b = bb;
        if (p[3]) a = p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
      } else throw new Error("Unrecognized color");
    }
  }
  const hex6 = "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
  const [h, sat, l] = rgbToHsl(r, g, b);
  return {
    hex: hex6,
    hexA: "#" + [r, g, b, Math.round(a * 255)].map((x) => Math.round(x).toString(16).padStart(2, "0")).join(""),
    rgb: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
    rgba: `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(3)})`,
    hsl: `hsl(${Math.round(h)}, ${Math.round(sat * 100)}%, ${Math.round(l * 100)}%)`,
    hsla: `hsla(${Math.round(h)}, ${Math.round(sat * 100)}%, ${Math.round(l * 100)}%, ${+a.toFixed(3)})`,
    r: Math.round(r), g: Math.round(g), b: Math.round(b), a,
  };
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const k = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [k(h + 1 / 3) * 255, k(h) * 255, k(h - 1 / 3) * 255];
}

// --- Extractor ---
export const extractPatterns = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /https?:\/\/[^\s<>"']+/g,
  ipv4: /\b(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}\b/g,
  ipv6: /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g,
  number: /-?\d+(?:\.\d+)?/g,
  hashtag: /#[\w\u00C0-\uFFFF]+/g,
  mention: /@[\w.-]+/g,
  phone: /\+?\d[\d\s().-]{6,}\d/g,
  date: /\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?\b/g,
};
export function extractAll(text: string, kind: keyof typeof extractPatterns, unique = true): string[] {
  const out = text.match(extractPatterns[kind]) || [];
  return unique ? Array.from(new Set(out)) : out;
}

// --- Cipher ---
export function caesar(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}
export function rot13(text: string): string { return caesar(text, 13); }
export function atbash(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(25 - (c.charCodeAt(0) - base) + base);
  });
}

// --- Morse ---
const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};
const MORSE_REV: Record<string, string> = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));
export function toMorse(text: string): string {
  return text.toUpperCase().split("\n").map((line) =>
    line.split(" ").map((w) => w.split("").map((c) => MORSE_MAP[c] ?? "").filter(Boolean).join(" ")).join(" / ")
  ).join("\n");
}
export function fromMorse(morse: string): string {
  return morse.split("\n").map((line) =>
    line.split(/\s*\/\s*/).map((w) => w.trim().split(/\s+/).map((m) => MORSE_REV[m] ?? "").join("")).join(" ")
  ).join("\n");
}

// --- Text repeater ---
export function repeatText(text: string, times: number, sep: string): string {
  return Array(Math.max(0, times)).fill(text).join(sep);
}

export function repeatTextAdvanced(
  text: string,
  times: number,
  mode: "inline" | "line-by-line" | "paragraph",
  sep: string,
  randomSep: boolean,
  prefix: string,
  suffix: string,
  numbered: boolean
): string {
  if (!text || times <= 0) return "";
  const separators = [" ", ", ", " | ", " - ", " • ", " / ", " :: ", " ➜ ", " · ", " ~ "];
  const getSep = () => {
    if (!randomSep) return sep;
    return separators[Math.floor(Math.random() * separators.length)];
  };
  const items = Array.from({ length: times }, (_, i) => {
    let item = text;
    if (numbered) item = `${i + 1}. ${item}`;
    return prefix + item + suffix;
  });
  if (mode === "inline") return items.join(getSep());
  if (mode === "line-by-line") return items.join("\n" + (randomSep ? getSep().trim() : sep.trim() ? sep : "")).replace(/\n+$/, "");
  return items.map((_, i) => (i + 1) + ". " + text).join("\n\n");
}

// --- Word wrap ---
export function wordWrap(text: string, width: number, breakLong = true): string {
  return text.split(/\r?\n/).map((line) => {
    if (line.length <= width) return line;
    const out: string[] = [];
    const words = line.split(/(\s+)/);
    let cur = "";
    for (const w of words) {
      if ((cur + w).length <= width) cur += w;
      else if (breakLong && w.length > width) {
        if (cur) { out.push(cur.trimEnd()); cur = ""; }
        for (let i = 0; i < w.length; i += width) out.push(w.slice(i, i + width));
        cur = "";
      } else {
        out.push(cur.trimEnd());
        cur = w.trimStart();
      }
    }
    if (cur) out.push(cur.trimEnd());
    return out.join("\n");
  }).join("\n");
}

// --- Strip HTML ---
export function stripHTML(html: string, preserveLineBreaks = true): string {
  let t = html;
  if (preserveLineBreaks) {
    t = t.replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, "\n");
  }
  t = t.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  t = t.replace(/<[^>]+>/g, "");
  t = encoders.htmlDecode(t);
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

// --- String escape ---
export const stringEscape = {
  jsonEscape: (s: string) => JSON.stringify(s).slice(1, -1),
  jsonUnescape: (s: string) => JSON.parse(`"${s.replace(/"/g, '\\"')}"`),
  jsEscape: (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"),
  jsUnescape: (s: string) => s.replace(/\\(.)/g, (_, c: string) => (({ n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"' } as Record<string, string>)[c] ?? c)),
  sqlEscape: (s: string) => s.replace(/'/g, "''"),
  sqlUnescape: (s: string) => s.replace(/''/g, "'"),
  unicodeEscape: (s: string) => Array.from(s).map((c) => {
    const cp = c.codePointAt(0)!;
    return cp < 128 ? c : "\\u" + cp.toString(16).padStart(4, "0");
  }).join(""),
  unicodeUnescape: (s: string) => s.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, a, b) => String.fromCodePoint(parseInt(a || b, 16))),
};

// --- NATO ---
const NATO: Record<string, string> = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
  G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima",
  M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray",
  Y: "Yankee", Z: "Zulu", "0": "Zero", "1": "One", "2": "Two", "3": "Three",
  "4": "Four", "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Niner",
};
export function toNATO(text: string): string {
  return text.toUpperCase().split("").map((c) => NATO[c] ?? c).join(" ");
}

// --- Random picker ---
export function pickRandom(items: string[], count: number, unique: boolean): string[] {
  if (!items.length) return [];
  if (unique) {
    const pool = [...items];
    const out: string[] = [];
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }
  return Array.from({ length: count }, () => items[Math.floor(Math.random() * items.length)]);
}

// --- Indent ---
export function indentText(text: string, prefix: string, dedent = false): string {
  if (dedent) {
    if (prefix === "") {
      // strip common leading whitespace
      const lines = text.split(/\r?\n/);
      const min = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length));
      return lines.map((l) => l.slice(min)).join("\n");
    }
    return text.split(/\r?\n/).map((l) => l.startsWith(prefix) ? l.slice(prefix.length) : l).join("\n");
  }
  return text.split(/\r?\n/).map((l) => prefix + l).join("\n");
}

// --- ASCII Banner (3-line block letters) ---
const BANNER: Record<string, string[]> = {
  A: ["  ▄▀█  ", "  █▀█  ", "       "], B: [" █▄▄ ", " █▄█ ", "     "],
  C: [" █▀ ", " █▄ ", "    "], D: [" █▀▄ ", " █▄▀ ", "     "],
  E: [" █▀▀ ", " █▄▄ ", "     "], F: [" █▀▀ ", " █▀  ", "     "],
  G: [" █▀▀ ", " █▄█ ", "     "], H: [" █ █ ", " █▀█ ", "     "],
  I: [" █ ", " █ ", "   "], J: ["  █ ", " ▀█ ", "    "],
  K: [" █▄▀ ", " █ █ ", "     "], L: [" █   ", " █▄▄ ", "     "],
  M: [" █▄ ▄█ ", " █ ▀ █ ", "       "], N: [" █▄ █ ", " █ ▀█ ", "      "],
  O: [" █▀█ ", " █▄█ ", "     "], P: [" █▀█ ", " █▀▀ ", "     "],
  Q: [" █▀█ ", " ▀▀█ ", "     "], R: [" █▀█ ", " █▀▄ ", "     "],
  S: [" █▀ ", " ▄█ ", "    "], T: [" ▀█▀ ", "  █  ", "     "],
  U: [" █ █ ", " █▄█ ", "     "], V: [" █ █ ", " ▀▄▀ ", "     "],
  W: [" █ █ █ ", " ▀▄▀▄▀ ", "       "], X: [" ▀▄▀ ", " █ █ ", "     "],
  Y: [" █▄█ ", "  █  ", "     "], Z: [" ▀█ ", " █▄ ", "    "],
  "0": [" █▀█ ", " █▄█ ", "     "], "1": [" ▄█ ", "  █ ", "    "],
  "2": [" ▀█ ", " █▄ ", "    "], "3": [" ▀▀█ ", " ▄▄█ ", "     "],
  "4": [" █ █ ", " ▀▀█ ", "     "], "5": [" █▀ ", " ▄█ ", "    "],
  "6": [" █▀ ", " █▄█ ", "    "], "7": [" ▀▀█ ", "   █ ", "     "],
  "8": [" █▀█ ", " █▄█ ", "     "], "9": [" █▀█ ", "  ▄█ ", "     "],
  " ": ["   ", "   ", "   "], "!": [" █ ", " ▄ ", "   "],
  "?": [" ▀█ ", "  ▄ ", "    "], ".": ["   ", " ▄ ", "   "],
};
export function asciiBanner(text: string): string {
  const chars = text.toUpperCase().split("").map((c) => BANNER[c] ?? BANNER[" "]);
  return [0, 1, 2].map((row) => chars.map((c) => c[row]).join("")).join("\n");
}

// ============================================================
// Tools v2: Core / Extractors / Advanced additions
// ============================================================

// --- Text Tracker & Remover ---
export interface TrackerOpts { regex: boolean; caseInsensitive: boolean; whole: boolean; multiline: boolean }
export interface TrackerOpts { regex: boolean; caseInsensitive: boolean; whole: boolean; multiline: boolean; preserveSpacing?: boolean; smartCleanup?: boolean }
export function trackPattern(text: string, pattern: string, opts: TrackerOpts): { matches: { value: string; index: number }[]; count: number; cleaned: string } {
  if (!pattern) return { matches: [], count: 0, cleaned: text };
  let re: RegExp;
  try {
    if (opts.regex) {
      re = new RegExp(pattern, "g" + (opts.caseInsensitive ? "i" : "") + (opts.multiline ? "m" : "") + "u");
    } else {
      const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      re = new RegExp(opts.whole ? `\\b${esc}\\b` : esc, "g" + (opts.caseInsensitive ? "i" : "") + "u");
    }
  } catch (e) {
    throw new Error((e as Error).message);
  }
  const matches: { value: string; index: number }[] = [];
  for (const m of text.matchAll(re)) matches.push({ value: m[0], index: m.index ?? 0 });
  let cleaned: string;
  if (opts.preserveSpacing) {
    cleaned = text.replace(re, (m) => " ".repeat(m.length));
  } else {
    cleaned = text.replace(re, "");
  }
  if (opts.smartCleanup) {
    cleaned = cleaned.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }
  return { matches, count: matches.length, cleaned };
}

export function findPartialMatches(text: string, pattern: string): { value: string; index: number }[] {
  if (!pattern) return [];
  const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = esc.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return [];
  const partials: { value: string; index: number }[] = [];
  for (const p of parts) {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    for (const m of text.matchAll(re)) {
      partials.push({ value: m[0], index: m.index ?? 0 });
    }
  }
  return partials;
}

// --- Symbol Tracker & Multiplier ---
export function symbolFrequency(text: string): { symbol: string; count: number }[] {
  const map = new Map<string, number>();
  for (const c of text) {
    if (/[^\p{L}\p{N}\s]/u.test(c)) map.set(c, (map.get(c) || 0) + 1);
  }
  return [...map].map(([symbol, count]) => ({ symbol, count })).sort((a, b) => b.count - a.count);
}
export function multiplySymbols(text: string, symbols: string, times: number): string {
  if (!symbols || times <= 1) return text;
  const set = new Set(Array.from(symbols));
  return Array.from(text).map((c) => set.has(c) ? c.repeat(times) : c).join("");
}

export function multiplySymbolsInLines(
  text: string,
  symbols: string,
  times: number,
  lineStart?: number,
  lineEnd?: number
): string {
  if (!symbols || times <= 1) return text;
  const set = new Set(Array.from(symbols));
  const lines = text.split(/\r?\n/);
  return lines
    .map((l, i) => {
      if (lineStart !== undefined && lineEnd !== undefined && (i < lineStart || i > lineEnd)) return l;
      return Array.from(l).map((c) => (set.has(c) ? c.repeat(times) : c)).join("");
    })
    .join("\n");
}

// --- Symbol Filter & Bulk Remove ---
export interface LineSymbolInfo {
  lineNumber: number;
  text: string;
  detectedSymbols: string[];
  symbolCount: number;
}
export function analyzeLineSymbols(text: string, symbols: string): LineSymbolInfo[] {
  if (!symbols) return [];
  const set = Array.from(symbols);
  const lines = text.split(/\r?\n/);
  return lines
    .map((l, i) => {
      const detected = set.filter((s) => l.includes(s));
      const total = detected.reduce((sum, s) => sum + (l.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 0);
      return { lineNumber: i + 1, text: l, detectedSymbols: detected, symbolCount: total };
    })
    .filter((l) => l.detectedSymbols.length > 0);
}

export function filterLinesBySymbol(text: string, symbols: string, mode: "keep" | "remove", matchAll: boolean): { text: string; affected: number } {
  if (!symbols) return { text, affected: 0 };
  const set = Array.from(symbols);
  const lines = text.split(/\r?\n/);
  let affected = 0;
  const out = lines.filter((l) => {
    const has = matchAll ? set.every((s) => l.includes(s)) : set.some((s) => l.includes(s));
    const keep = mode === "keep" ? has : !has;
    if (!keep) affected++;
    return keep;
  });
  return { text: out.join("\n"), affected };
}

export function removeSymbolFromLine(text: string, lineIndex: number, symbols: string): string {
  const lines = text.split(/\r?\n/);
  if (lineIndex < 0 || lineIndex >= lines.length) return text;
  const set = new Set(Array.from(symbols));
  lines[lineIndex] = Array.from(lines[lineIndex]).filter((c) => !set.has(c)).join("");
  return lines.join("\n");
}

export function removeSymbolsGlobal(text: string, symbols: string): string {
  const set = new Set(Array.from(symbols));
  return Array.from(text).filter((c) => !set.has(c)).join("");
}

// --- Global Text Formatter (Unicode mathematical alphanumeric) ---
const MAP_BOLD: Record<string, number> = { upper: 0x1D400 - 65, lower: 0x1D41A - 97, digit: 0x1D7CE - 48 };
const MAP_ITALIC: Record<string, number> = { upper: 0x1D434 - 65, lower: 0x1D44E - 97 };
const MAP_BOLD_ITALIC: Record<string, number> = { upper: 0x1D468 - 65, lower: 0x1D482 - 97 };
const MAP_MONO: Record<string, number> = { upper: 0x1D670 - 65, lower: 0x1D68A - 97, digit: 0x1D7F6 - 48 };
const MAP_SCRIPT: Record<string, number> = { upper: 0x1D49C - 65, lower: 0x1D4B6 - 97 };
const MAP_FRAKTUR: Record<string, number> = { upper: 0x1D504 - 65, lower: 0x1D51E - 97 };
const MAP_DOUBLE: Record<string, number> = { upper: 0x1D538 - 65, lower: 0x1D552 - 97, digit: 0x1D7D8 - 48 };
const MAP_SANS: Record<string, number> = { upper: 0x1D5A0 - 65, lower: 0x1D5BA - 97, digit: 0x1D7E2 - 48 };

function applyMath(s: string, m: Record<string, number>): string {
  return Array.from(s).map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90 && m.upper) return String.fromCodePoint(code + m.upper);
    if (code >= 97 && code <= 122 && m.lower) return String.fromCodePoint(code + m.lower);
    if (code >= 48 && code <= 57 && m.digit) return String.fromCodePoint(code + m.digit);
    return c;
  }).join("");
}

export type GlobalFormat = "bold" | "italic" | "bold-italic" | "monospace" | "script" | "fraktur" | "double-struck" | "sans" | "upper" | "lower" | "title" | "sentence" | "underline" | "strikethrough" | "small-caps";

const SMALL_CAPS: Record<string, string> = { a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ" };

export function globalFormat(text: string, fmt: GlobalFormat): string {
  switch (fmt) {
    case "bold": return applyMath(text, MAP_BOLD);
    case "italic": return applyMath(text, MAP_ITALIC);
    case "bold-italic": return applyMath(text, MAP_BOLD_ITALIC);
    case "monospace": return applyMath(text, MAP_MONO);
    case "script": return applyMath(text, MAP_SCRIPT);
    case "fraktur": return applyMath(text, MAP_FRAKTUR);
    case "double-struck": return applyMath(text, MAP_DOUBLE);
    case "sans": return applyMath(text, MAP_SANS);
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return toTitle(text);
    case "sentence": return toSentence(text);
    case "underline": return Array.from(text).map((c) => c + "\u0332").join("");
    case "strikethrough": return Array.from(text).map((c) => c + "\u0336").join("");
    case "small-caps": return text.toLowerCase().split("").map((c) => SMALL_CAPS[c] ?? c).join("");
  }
}

export function formatSingleChar(c: string, fmt: GlobalFormat): string {
  return globalFormat(c, fmt);
}

export function globalFormatTargetMatches(
  text: string,
  target: string,
  fmt: GlobalFormat,
  opts: { caseInsensitive: boolean; whole: boolean }
): string {
  if (!target) return text;
  try {
    const esc = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = "g" + (opts.caseInsensitive ? "i" : "") + "u";
    const re = new RegExp(opts.whole ? `\\b${esc}\\b` : esc, flags);
    return text.replace(re, (m) => globalFormat(m, fmt));
  } catch {
    return text;
  }
}

// --- Smart Replace (multi-pair) ---
export interface ReplacePair { find: string; replace: string; regex?: boolean; caseInsensitive?: boolean; whole?: boolean; enabled?: boolean }
export function smartReplace(text: string, pairs: ReplacePair[]): { text: string; total: number; perPair: number[] } {
  let out = text;
  const perPair: number[] = [];
  let total = 0;
  for (const p of pairs) {
    if (p.enabled === false || !p.find) { perPair.push(0); continue; }
    const r = findReplace(out, p.find, p.replace, { regex: !!p.regex, flags: "g" + (p.caseInsensitive ? "i" : ""), caseInsensitive: !!p.caseInsensitive, whole: !!p.whole });
    out = r.text;
    perPair.push(r.count);
    total += r.count;
  }
  return { text: out, total, perPair };
}

// --- Dedupe words ---
export function dedupeWords(text: string, caseInsensitive = true): { text: string; removed: number } {
  const seen = new Set<string>();
  let removed = 0;
  const out = text.replace(/\S+/g, (w) => {
    const k = caseInsensitive ? w.toLowerCase() : w;
    if (seen.has(k)) { removed++; return ""; }
    seen.add(k);
    return w;
  });
  return { text: out.replace(/[ \t]{2,}/g, " ").replace(/ +\n/g, "\n"), removed };
}

// --- Line Tools (merge/split) ---
export function mergeLines(text: string, sep: string, skipEmpty: boolean): string {
  let lines = text.split(/\r?\n/);
  if (skipEmpty) lines = lines.filter((l) => l.trim().length);
  return lines.join(sep);
}
export function splitByDelimiter(text: string, delim: string, regex: boolean): string {
  if (!delim) return text;
  const re = regex ? new RegExp(delim, "g") : new RegExp(delim.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  return text.split(re).join("\n");
}

// --- Phone extractor (richer) ---
export const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?/g;
export function extractPhones(text: string, unique = true): string[] {
  const out = (text.match(PHONE_RE) || []).map((s) => s.trim()).filter((s) => s.replace(/\D/g, "").length >= 7);
  return unique ? Array.from(new Set(out)) : out;
}

// --- Keyword density ---
export function keywordDensity(text: string, opts: { ngram: number; stopwords: boolean; min: number }) {
  const STOP = new Set(("a an the and or but if then so of in on at to from for by with as is are was were be been being have has had do does did not no this that these those it its i you he she we they me him her them my your his their our".split(" ")));
  const tokens = (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu) || []);
  const n = opts.ngram;
  const grams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const slice = tokens.slice(i, i + n);
    if (opts.stopwords && n === 1 && STOP.has(slice[0])) continue;
    grams.push(slice.join(" "));
  }
  const total = grams.length;
  const map = new Map<string, number>();
  for (const g of grams) map.set(g, (map.get(g) || 0) + 1);
  return [...map]
    .filter(([, c]) => c >= opts.min)
    .map(([term, count]) => ({ term, count, density: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

// --- Invisible character detection ---
export const INVISIBLES: { code: number; name: string }[] = [
  { code: 0x200B, name: "ZERO WIDTH SPACE" },
  { code: 0x200C, name: "ZERO WIDTH NON-JOINER" },
  { code: 0x200D, name: "ZERO WIDTH JOINER" },
  { code: 0x200E, name: "LEFT-TO-RIGHT MARK" },
  { code: 0x200F, name: "RIGHT-TO-LEFT MARK" },
  { code: 0x202A, name: "LEFT-TO-RIGHT EMBEDDING" },
  { code: 0x202B, name: "RIGHT-TO-LEFT EMBEDDING" },
  { code: 0x202C, name: "POP DIRECTIONAL FORMATTING" },
  { code: 0x202D, name: "LEFT-TO-RIGHT OVERRIDE" },
  { code: 0x202E, name: "RIGHT-TO-LEFT OVERRIDE" },
  { code: 0x2060, name: "WORD JOINER" },
  { code: 0x2061, name: "FUNCTION APPLICATION" },
  { code: 0x2062, name: "INVISIBLE TIMES" },
  { code: 0x2063, name: "INVISIBLE SEPARATOR" },
  { code: 0x2064, name: "INVISIBLE PLUS" },
  { code: 0xFEFF, name: "BYTE ORDER MARK" },
  { code: 0x00AD, name: "SOFT HYPHEN" },
  { code: 0x180E, name: "MONGOLIAN VOWEL SEPARATOR" },
  { code: 0x00A0, name: "NO-BREAK SPACE" },
];
const INVISIBLE_SET = new Set(INVISIBLES.map((x) => x.code));
const INVISIBLE_RE = new RegExp(`[${INVISIBLES.map((x) => "\\u" + x.code.toString(16).padStart(4, "0")).join("")}]`, "g");

export function detectInvisible(text: string): { code: number; name: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const c of text) {
    const cp = c.codePointAt(0)!;
    if (INVISIBLE_SET.has(cp)) counts.set(cp, (counts.get(cp) || 0) + 1);
  }
  return [...counts].map(([code, count]) => ({
    code,
    name: INVISIBLES.find((x) => x.code === code)?.name ?? "INVISIBLE",
    count,
  })).sort((a, b) => b.count - a.count);
}
export function removeInvisible(text: string, alsoReplaceNbsp = true): string {
  let t = text.replace(INVISIBLE_RE, "");
  if (alsoReplaceNbsp) t = t.replace(/\u00A0/g, " ");
  return t;
}
export function highlightInvisible(text: string): string {
  return text.replace(INVISIBLE_RE, (c) => `<U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}>`);
}

// --- Unicode cleaner ---
export type NormForm = "NFC" | "NFD" | "NFKC" | "NFKD";
export function unicodeNormalize(text: string, form: NormForm): string {
  return text.normalize(form);
}
export function transliterateLatin(text: string): string {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
const SMART_PUNCT: [RegExp, string][] = [
  [/[\u2018\u2019\u201A\u201B]/g, "'"],
  [/[\u201C\u201D\u201E\u201F]/g, '"'],
  [/[\u2013\u2014\u2015]/g, "-"],
  [/[\u2026]/g, "..."],
  [/[\u00AB\u00BB]/g, '"'],
  [/[\u2039\u203A]/g, "'"],
  [/[\u00A0]/g, " "],
];
export function smartToAscii(text: string): string {
  let t = text;
  for (const [re, r] of SMART_PUNCT) t = t.replace(re, r);
  return t;
}

// --- Emoji manager ---
const EMOJI_RE = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
export function detectEmojis(text: string): { emoji: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of text.matchAll(EMOJI_RE)) map.set(m[0], (map.get(m[0]) || 0) + 1);
  return [...map].map(([emoji, count]) => ({ emoji, count })).sort((a, b) => b.count - a.count);
}
export function removeEmojis(text: string): string {
  return text.replace(EMOJI_RE, "");
}
export function extractEmojis(text: string, unique = true): string[] {
  const arr = (text.match(EMOJI_RE) || []);
  return unique ? Array.from(new Set(arr)) : arr;
}
export function replaceEmojis(text: string, replacement: string): string {
  return text.replace(EMOJI_RE, replacement);
}

export function replaceEmojiSpecific(text: string, targetEmoji: string, replacement: string): string {
  const escaped = targetEmoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escaped, "g"), replacement);
}

// ============================================================
// Crypto & Security utilities (plan2)
// ============================================================

export function generateULID(): string {
  const ts = Date.now().toString(32).padStart(10, "0");
  const random = crypto.getRandomValues(new Uint8Array(10));
  const randStr = Array.from(random, (b) => b.toString(32).padStart(2, "0")).join("").slice(0, 16);
  return (ts + randStr).toUpperCase();
}

export function generateToken(length = 32, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"): string {
  const arr = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

export function generateOTP(digits = 6): string {
  const arr = crypto.getRandomValues(new Uint32Array(digits));
  return Array.from(arr, (v) => String(v % 10)).join("");
}

export function generateBIP39Passphrase(words = 12): string {
  const WORDLIST = [
    "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse",
    "access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act",
    "action","actor","actress","actual","adapt","add","addict","address","adjust","admit",
    "adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent",
    "agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert",
    "alien","all","alley","allow","almost","alone","alpha","already","also","alter",
    "always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger",
    "angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique",
    "anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic",
    "area","arena","argue","arm","armed","armor","army","around","arrange","arrest",
    "arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset",
    "assist","assume","asthma","athlete","atom","attack","attend","attitude","attract","auction",
    "audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake",
    "aware","away","awesome","awful","awkward","axis","baby","bachelor","bacon","badge",
    "bag","balance","balcony","ball","bamboo","banana","banner","bar","barely","bargain",
    "barrel","base","basic","basket","battle","beach","bean","beauty","because","become",
    "beef","before","begin","behave","behind","believe","below","belt","bench","benefit",
    "best","betray","better","between","beyond","bicycle","bid","bike","bind","biology",
    "bird","birth","bitter","black","blade","blame","blanket","blast","bleak","bless",
    "blind","blood","blossom","blouse","blue","blur","blush","board","boat","body",
    "boil","bomb","bone","bonus","book","boost","border","boring","borrow","boss",
    "bottom","bounce","box","boy","bracket","brain","brand","brass","brave","bread",
    "breeze","brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze",
    "broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb",
    "bulk","bullet","bundle","bunker","burden","burger","burst","bus","business","busy",
    "butter","buyer","buzz","cabbage","cabin","cable","cactus","cage","cake","call",
    "calm","camera","camp","can","canal","cancel","candy","cannon","canoe","canvas",
    "canyon","capable","capital","captain","car","carbon","card","cargo","carpet","carry",
    "cart","case","cash","casino","castle","casual","cat","catalog","catch","category",
    "cattle","caught","cause","caution","cave","ceiling","celery","cement","census","century",
    "cereal","certain","chair","chalk","champion","change","chaos","chapter","charge","chase",
    "chat","cheap","check","cheese","chef","cherry","chest","chicken","chief","child",
    "chimney","choice","choose","chronic","chuckle","chunk","churn","cigar","cinnamon","circle",
    "citizen","city","civil","claim","clap","clarify","claw","clay","clean","clerk",
    "clever","click","client","cliff","climb","clinic","clip","clock","clog","close",
    "cloth","cloud","clown","club","clump","cluster","clutch","coach","coast","coconut",
    "code","coffee","coil","coin","collect","color","column","combine","come","comfort",
    "comic","common","company","concert","conduct","confirm","congress","connect","consider","control",
    "convince","cook","cool","copper","copy","coral","core","corn","correct","cost",
    "cotton","couch","country","couple","course","cousin","cover","coyote","crack","cradle",
    "craft","cram","crane","crash","crater","crawl","crazy","cream","credit","creek",
    "crew","cricket","crime","crisp","critic","crop","cross","crouch","crowd","crucial",
    "cruel","cruise","crumble","crunch","crush","cry","crystal","cube","culture","cup",
    "cupboard","curious","current","curtain","curve","cushion","custom","cute","cycle","dad",
    "damage","damp","dance","danger","daring","dash","daughter","dawn","day","deal",
    "debate","debris","decade","december","decide","decline","decorate","decrease","deer","defense",
    "define","defy","degree","delay","deliver","demand","demise","denial","dentist","deny",
    "depart","depend","deposit","depth","deputy","derive","describe","desert","design","desk",
    "despair","destroy","detail","detect","develop","device","devote","diagram","dial","diamond",
    "diary","dice","diesel","diet","differ","digital","dignity","dilemma","dinner","dinosaur",
    "direct","dirt","disagree","discover","disease","dish","dismiss","disorder","display","distance",
    "divert","divide","divorce","dizzy","doctor","document","dog","doll","dolphin","domain",
    "donate","donkey","donor","door","dose","double","dove","draft","dragon","drama",
    "drastic","draw","dream","dress","drift","drill","drink","drip","drive","drop",
    "drum","dry","duck","dumb","dune","during","dust","dutch","duty","dwarf",
    "dynamic","eager","eagle","early","earn","earth","easily","east","easy","echo",
    "ecology","economy","edge","edit","educate","effort","egg","eight","either","elbow",
    "elder","electric","elegant","element","elephant","elevator","elite","else","embark","embody",
    "embrace","emerge","emotion","employ","empower","empty","enable","enact","endless","endorse",
    "enemy","energy","enforce","engage","engine","enhance","enjoy","enlist","enough","enrich",
    "enroll","ensure","enter","entire","entry","envelope","episode","equal","equip","era",
    "erase","erode","erosion","error","erupt","escape","essay","essence","estate","eternal",
    "ethics","evidence","evil","evoke","evolve","exact","example","excess","exchange","excite",
    "exclude","excuse","execute","exercise","exhaust","exhibit","exile","exist","exit","exotic",
    "expand","expect","expire","explain","expose","express","extend","extra","eye","eyebrow",
    "fabric","face","faculty","fade","faint","faith","fall","false","fame","family",
    "famous","fan","fancy","fantasy","farm","fashion","fat","fatal","father","fatigue",
    "fault","favorite","feature","february","federal","fee","feed","feel","female","fence",
    "festival","fetch","fever","few","fiber","fiction","field","figure","file","film",
    "filter","final","find","fine","finger","finish","fire","firm","first","fiscal",
    "fish","fit","fitness","fix","flag","flame","flash","flat","flavor","flee",
    "flight","flip","float","flock","floor","flower","fluid","flush","fly","foam",
    "focus","fog","foil","fold","follow","food","foot","force","foreign","forest",
    "forget","fork","fortune","forum","forward","fossil","foster","found","fox","fragile",
    "frame","frequent","fresh","friend","fringe","frog","front","frost","frown","frozen",
    "fruit","fuel","fun","funny","furnace","fury","future","gadget","gain","galaxy",
    "gallery","game","gap","garage","garbage","garden","garlic","garment","gas","gasp",
    "gate","gather","gauge","gaze","general","genius","genre","gentle","genuine","gesture",
    "ghost","giant","gift","giggle","ginger","giraffe","girl","give","glad","glance",
    "glare","glass","glide","glimpse","globe","gloom","glory","glove","glow","glue",
    "goat","goddess","gold","good","goose","gorilla","gospel","gossip","govern","gown",
    "grab","grace","grain","grant","grape","grass","gravity","great","green","grid",
    "grief","grit","grocery","group","grow","grunt","guard","guess","guide","guilt",
    "guitar","gun","gym","habit","hair","half","hammer","hamster","hand","happy",
    "harbor","hard","harsh","harvest","hat","have","hawk","hazard","head","health",
    "heart","heavy","hedgehog","height","hello","helmet","help","hen","hero","hidden",
    "high","hill","hint","hip","hire","history","hobby","hockey","hold","hole",
    "holiday","hollow","home","honey","hood","hope","horn","horror","horse","hospital",
    "host","hotel","hour","hover","hub","huge","human","humble","humor","hundred",
    "hungry","hunt","hurdle","hurry","hurt","husband","hybrid","ice","icon","idea",
    "identify","idle","ignore","ill","illegal","illness","image","imitate","immense","immune",
    "impact","impose","improve","impulse","inch","include","income","increase","index","indicate",
    "indoor","industry","infant","inflict","inform","inhale","inherit","initial","inject","injury",
    "inmate","inner","innocent","input","inquiry","insane","insect","inside","inspire","install",
    "intact","interest","into","invest","invite","involve","iron","island","isolate","issue",
    "item","ivory","jacket","jaguar","jar","jazz","jealous","jeans","jelly","jewel",
    "job","join","joke","journey","joy","judge","juice","jump","jungle","junior",
    "junk","just","kangaroo","keen","keep","ketchup","key","kick","kid","kidney",
    "kind","kingdom","kiss","kit","kitchen","kite","kitten","kiwi","knee","knife",
    "knock","know","lab","label","labor","ladder","lady","lake","lamp","language",
    "laptop","large","later","latin","laugh","laundry","lava","law","lawn","lawsuit",
    "layer","lazy","leader","leaf","learn","leave","lecture","left","leg","legal",
    "legend","leisure","lemon","lend","length","lens","leopard","lesson","letter","level",
    "liar","liberty","library","license","life","lift","light","like","limb","limit",
    "link","lion","liquid","list","little","live","lizard","load","loan","lobster",
    "local","lock","logic","lonely","long","loop","lottery","loud","lounge","love",
    "loyal","lucky","luggage","lumber","lunar","lunch","luxury","lyrics","machine","mad",
    "magic","magnet","maid","mail","main","major","make","mammal","man","manage",
    "mandate","mango","mansion","manual","maple","marble","march","margin","marine","market",
    "marriage","mask","mass","master","match","material","math","matrix","matter","maximum",
    "maze","meadow","mean","measure","meat","mechanic","medal","media","melody","melt",
    "member","memory","mention","menu","mercy","merge","merit","merry","mesh","message",
    "metal","method","middle","midnight","milk","million","mimic","mind","minimum","minor",
    "minute","miracle","mirror","misery","miss","mistake","mix","mixed","mixture","mobile",
    "model","modify","mom","moment","monitor","monkey","monster","month","moon","moral",
    "more","morning","mosquito","mother","motion","motor","mountain","mouse","move","movie",
    "much","muffin","mule","multiply","muscle","museum","mushroom","music","must","mutual",
    "myself","mystery","myth","naive","name","napkin","narrow","nasty","nation","nature",
    "near","neck","need","negative","neglect","neither","nephew","nerve","nest","net",
    "network","neutral","never","news","next","nice","night","noble","noise","nominee",
    "noodle","normal","north","nose","notable","note","nothing","notice","novel","now",
    "nuclear","number","nurse","nut","oak","obey","object","oblige","obscure","observe",
    "obtain","obvious","occur","ocean","october","odor","off","offer","office","often",
    "oil","okay","old","olive","olympic","omit","once","one","onion","online",
    "only","open","opera","opinion","oppose","option","orange","orbit","orchard","order",
    "ordinary","organ","orient","original","orphan","ostrich","other","outdoor","outer","output",
    "outside","oval","oven","over","own","owner","oxygen","oyster","ozone","pact",
    "paddle","page","pair","palace","palm","panda","panel","panic","panther","paper",
    "parade","parent","park","parrot","party","pass","patch","path","patient","patrol",
    "pattern","pause","pave","payment","peace","peanut","pear","peasant","pelican","pen",
    "penalty","pencil","people","pepper","perfect","permit","person","pet","phone","photo",
    "phrase","physical","piano","picnic","picture","piece","pig","pigeon","pill","pilot",
    "pink","pioneer","pipe","pistol","pitch","pizza","place","planet","plastic","plate",
    "play","please","pledge","pluck","plug","plunge","poem","poet","point","polar",
    "pole","police","pond","pony","pool","popular","portion","position","possible","post",
    "potato","pottery","poverty","powder","power","practice","praise","predict","prefer","prepare",
    "present","pretty","prevent","price","pride","primary","print","priority","prison","private",
    "prize","problem","process","produce","profit","program","project","promote","proof","property",
    "prosper","protect","proud","provide","public","pudding","pull","pulp","pulse","pumpkin",
    "punch","pupil","puppy","purchase","purity","purpose","purse","push","put","puzzle",
    "pyramid","quality","quantum","quarter","question","quick","quit","quiz","quote","rabbit",
    "raccoon","race","rack","radar","radio","rail","rain","raise","rally","ramp",
    "ranch","random","range","rapid","rare","rate","rather","raven","raw","razor",
    "ready","real","reason","rebel","rebuild","recall","receive","recipe","record","recycle",
    "reduce","reflect","reform","refuse","region","regret","regular","reject","relax","release",
    "relief","rely","remain","remember","remind","remove","render","renew","rent","reopen",
    "repair","repeat","replace","report","require","rescue","resemble","resist","resource","response",
    "result","retire","retreat","return","reunion","reveal","review","reward","rhythm","rib",
    "ribbon","rice","rich","ride","ridge","rifle","right","rigid","ring","riot",
    "ripple","risk","ritual","rival","river","road","roast","robot","robust","rocket",
    "romance","roof","rookie","room","rose","rotate","rough","round","route","royal",
    "rubber","rude","rug","rule","run","runway","rural","sad","saddle","sadness",
    "safe","sail","salad","salmon","salon","salt","salute","same","sample","sand",
    "satisfy","satoshi","sauce","sausage","save","say","scale","scan","scare","scatter",
    "scene","scheme","school","science","scissors","scorpion","scout","scrap","screen","script",
    "scrub","sea","search","season","seat","second","secret","section","security","seed",
    "seek","segment","select","sell","seminar","senior","sense","sentence","series","service",
    "session","settle","setup","seven","shadow","shaft","shallow","share","shed","shell",
    "sheriff","shield","shift","shine","ship","shiver","shock","shoe","shoot","shop",
    "short","shoulder","shove","shrimp","shrug","shuffle","shy","sibling","sick","side",
    "siege","sight","sign","silent","silk","silly","silver","similar","simple","since",
    "sing","siren","sister","situate","six","size","skate","sketch","ski","skill",
    "skin","skirt","skull","slab","slam","sleep","slender","slice","slide","slight",
    "slim","slogan","slot","slow","slush","small","smart","smile","smoke","smooth",
    "snack","snake","snap","sniff","snow","soap","soccer","social","sock","soda",
    "soft","solar","soldier","solid","solution","solve","someone","song","soon","sorry",
    "sort","soul","sound","soup","source","south","space","spare","spatial","spawn",
    "speak","special","speed","spell","spend","sphere","spice","spider","spike","spin",
    "spirit","split","spoil","sponsor","spoon","sport","spot","spray","spread","spring",
    "spy","square","squeeze","squirrel","stable","stadium","staff","stage","stairs","stamp",
    "stand","start","state","stay","steak","steel","stem","step","stereo","stick",
    "still","sting","stock","stomach","stone","stool","story","stove","strategy","street",
    "strike","strong","struggle","student","stuff","stumble","style","subject","submit","subway",
    "success","such","sudden","suffer","sugar","suggest","suit","sun","sunny","sunset",
    "super","supply","support","surge","surprise","surround","survey","suspect","sustain","swallow",
    "swamp","swap","swarm","swear","sweet","swift","swim","swing","switch","sword",
    "symbol","symptom","syrup","system","table","tackle","tag","tail","talent","talk",
    "tank","tape","target","task","taste","tattoo","taxi","teach","team","tell",
    "ten","tenant","tennis","tent","term","test","text","thank","that","theme",
    "then","theory","there","they","thing","this","thought","three","thrive","throw",
    "thumb","thunder","ticket","tide","tiger","tilt","timber","time","tiny","tip",
    "tired","tissue","title","toast","tobacco","today","toddler","toe","together","toilet",
    "token","tomato","tomorrow","tone","tongue","tonight","tool","tooth","top","topic",
    "topple","torch","tornado","tortoise","toss","total","tourist","toward","tower","town",
    "toy","track","trade","traffic","tragic","train","transfer","trap","trash","travel",
    "tray","treat","tree","trend","trial","tribe","trick","trigger","trim","trip",
    "trophy","trouble","truck","true","truly","trumpet","trust","truth","try","tube",
    "tuition","tumble","tuna","tunnel","turkey","turn","turtle","twelve","twenty","twice",
    "twin","twist","two","type","typical","ugly","umbrella","unable","unaware","uncle",
    "uncover","under","undo","unfair","unfold","unhappy","union","unit","universe","unknown",
    "unlock","until","unusual","unveil","update","upgrade","uphold","upon","upper","upset",
    "urban","urge","usage","use","used","useful","useless","usual","utility","vacant",
    "vacuum","vague","valid","valley","valve","van","vanish","vapor","various","vast",
    "vault","vehicle","velvet","vendor","venture","venue","verb","verify","version","very",
    "vessel","veteran","viable","vibrant","vicious","victory","video","view","village","vintage",
    "violin","virtual","virus","visa","visit","visual","vital","vivid","vocal","voice",
    "void","volcano","volume","vote","voyage","wage","wagon","wait","walk","wall",
    "walnut","want","warfare","warm","warrior","wash","wasp","waste","water","wave",
    "way","wealth","weapon","wear","weasel","weather","web","wedding","weekend","weird",
    "welcome","west","wet","whale","what","wheat","wheel","when","where","whip",
    "whisper","wide","width","wife","wild","will","win","window","wine","wing",
    "wink","winner","winter","wire","wisdom","wise","wish","witness","wolf","woman",
    "wonder","wood","wool","word","work","world","worry","worth","wrap","wreck",
    "wrestle","wrist","write","wrong","yard","year","yellow","you","young","youth",
    "zebra","zero","zone","zoo"
  ];
  const arr = crypto.getRandomValues(new Uint32Array(words));
  return Array.from(arr, (v) => WORDLIST[v % WORDLIST.length]).join(" ");
}

export function generateHMAC(text: string, key: string, algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256"): Promise<string> {
  const enc = new TextEncoder();
  const keyBytes = enc.encode(key);
  const textBytes = enc.encode(text);
  return crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: algo }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, textBytes))
    .then((sig) => Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join(""));
}

export function analyzePasswordStrength(password: string): { score: number; label: string; color: string; feedback: string[]; entropy: number } {
  const feedback: string[] = [];
  let score = 0;
  if (password.length >= 8) score += 25; else feedback.push("Use at least 8 characters");
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (/[a-z]/.test(password)) score += 10; else feedback.push("Add lowercase letters");
  if (/[A-Z]/.test(password)) score += 10; else feedback.push("Add uppercase letters");
  if (/[0-9]/.test(password)) score += 10; else feedback.push("Add numbers");
  if (/[^a-zA-Z0-9]/.test(password)) score += 10; else feedback.push("Add symbols");
  if (/(.)\1{2,}/.test(password)) { score -= 10; feedback.push("Avoid repeated characters"); }
  if (/^[a-zA-Z]+$/.test(password)) { score -= 10; feedback.push("Mix letters with numbers/symbols"); }
  if (/^[0-9]+$/.test(password)) { score -= 15; feedback.push("Don't use only numbers"); }
  const common = ["password", "123456", "qwerty", "abc123", "letmein", "admin", "welcome", "monkey", "dragon", "master", "login"];
  if (common.some((w) => password.toLowerCase().includes(w))) { score -= 20; feedback.push("Avoid common words"); }
  score = Math.max(0, Math.min(100, score));
  const unique = new Set(password).size;
  const entropy = Math.log2(Math.pow(94, unique));
  const label = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
  const color = score >= 80 ? "oklch(0.6 0.2 145)" : score >= 60 ? "oklch(0.7 0.18 90)" : score >= 40 ? "oklch(0.7 0.18 50)" : "oklch(0.6 0.22 25)";
  return { score, label, color, feedback, entropy };
}

export function encodeBasicAuth(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return "Basic " + btoa(bin);
}
