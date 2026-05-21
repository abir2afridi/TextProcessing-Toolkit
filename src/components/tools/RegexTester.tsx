import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RandExp from "randexp";
import { render as renderDiagram } from "@regexper/render";

interface GroupCapture {
  name: string;
  value: string;
  start: number;
  end: number;
}

interface MatchResult {
  index: number;
  value: string;
  captures: GroupCapture[];
  groups: GroupCapture[];
}

function matchRegex(regex: string, text: string, flags: string): MatchResult[] {
  let lastIndex = -1;
  const re = new RegExp(regex, flags);
  const results: MatchResult[] = [];
  let match = re.exec(text);
  while (match !== null) {
    if (re.lastIndex === lastIndex || match[0] === "") break;
    const raw = match as unknown as Record<string, unknown>;
    const indices = raw.indices as Record<string, unknown>;
    const captures: GroupCapture[] = [];
    Object.entries(match).forEach(([captureName, captureValue]) => {
      if (captureName !== "0" && /^\d+$/.test(captureName)) {
        const pos = indices[captureName] as [number, number] | undefined;
        captures.push({
          name: captureName,
          value: captureValue as string,
          start: pos?.[0] ?? -1,
          end: pos?.[1] ?? -1,
        });
      }
    });
    const groups: GroupCapture[] = [];
    const indicesGroups = indices.groups as Record<string, [number, number]> | undefined;
    Object.entries(match.groups ?? {}).forEach(([groupName, groupValue]) => {
      const pos = indicesGroups?.[groupName];
      groups.push({
        name: groupName,
        value: groupValue,
        start: pos?.[0] ?? -1,
        end: pos?.[1] ?? -1,
      });
    });
    results.push({ index: match.index, value: match[0], captures, groups });
    lastIndex = re.lastIndex;
    match = re.exec(text);
  }
  return results;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [global, setGlobal] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const [dotAll, setDotAll] = useState(true);
  const [unicode, setUnicode] = useState(true);
  const [unicodeSets, setUnicodeSets] = useState(false);

  const diagramRef = useRef<HTMLDivElement>(null);

  const flags = useMemo(() => {
    let f = "d";
    if (global) f += "g";
    if (ignoreCase) f += "i";
    if (multiline) f += "m";
    if (dotAll) f += "s";
    if (unicode) f += "u";
    else if (unicodeSets) f += "v";
    return f;
  }, [global, ignoreCase, multiline, dotAll, unicode, unicodeSets]);

  const { error, results } = useMemo(() => {
    if (!pattern) return { error: null as string | null, results: [] as MatchResult[] };
    try {
      new RegExp(pattern, flags);
    } catch (e) {
      return { error: `Invalid regex: ${(e as Error).message}`, results: [] as MatchResult[] };
    }
    return { error: null, results: matchRegex(pattern, text, flags) };
  }, [pattern, text, flags]);

  const sample = useMemo(() => {
    if (!pattern) return "";
    try {
      const sanitized = pattern.replace(/\(\?\<[^>]*\>/g, "(?:");
      const randexp = new RandExp(new RegExp(sanitized));
      return randexp.gen();
    } catch {
      return "";
    }
  }, [pattern]);

  useEffect(() => {
    const el = diagramRef.current;
    if (!el || !pattern) return;
    let shadow = el.shadowRoot;
    if (!shadow) shadow = el.attachShadow({ mode: "open" });
    while (shadow.lastChild) shadow.removeChild(shadow.lastChild);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    renderDiagram(pattern, svg).then(() => shadow!.appendChild(svg)).catch(() => {});
  }, [pattern]);

  const handleUnicodeChange = (v: boolean) => {
    setUnicode(v);
    if (v) setUnicodeSets(false);
  };

  const handleUnicodeSetsChange = (v: boolean) => {
    setUnicodeSets(v);
    if (v) setUnicode(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Regex to test:</Label>
            <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Put the regex to test" className="h-8 w-full rounded-sm font-mono text-xs" />
            {error && <p className="mt-1 font-mono text-[11px] text-destructive">{error}</p>}
          </div>

          <a href="/tools/regex-cheatsheet" target="_blank" className="block font-mono text-[11px] text-primary underline">See Regular Expression Cheatsheet</a>

          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: "Global search. (g)", value: global, set: setGlobal },
              { label: "Case-insensitive search. (i)", value: ignoreCase, set: setIgnoreCase },
              { label: "Multiline (m)", value: multiline, set: setMultiline },
              { label: "Singleline (s)", value: dotAll, set: setDotAll },
              { label: "Unicode (u)", value: unicode, set: handleUnicodeChange },
              { label: "Unicode Sets (v)", value: unicodeSets, set: handleUnicodeSetsChange },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-2">
                <Switch checked={value} onCheckedChange={set} />
                <Label className="font-mono text-[11px] text-muted-foreground">{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Text to match:</Label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Put the text to match" className="h-24 w-full resize-y rounded-sm border border-input bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Matches</h3>
        {results.length > 0 ? (
          <div className="max-h-72 overflow-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-2 py-1.5">Index in text</th>
                  <th className="px-2 py-1.5">Value</th>
                  <th className="px-2 py-1.5">Captures</th>
                  <th className="px-2 py-1.5">Groups</th>
                </tr>
              </thead>
              <tbody>
                {results.map((m, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-1.5 text-primary">{m.index}</td>
                    <td className="px-2 py-1.5">{m.value}</td>
                    <td className="px-2 py-1.5">
                      {m.captures.length > 0 ? (
                        <ul className="list-none space-y-0.5">
                          {m.captures.map((c) => (
                            <li key={c.name} className="text-muted-foreground">
                              &quot;{c.name}&quot; = {c.value} [{c.start} - {c.end}]
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-2 py-1.5">
                      {m.groups.length > 0 ? (
                        <ul className="list-none space-y-0.5">
                          {m.groups.map((g) => (
                            <li key={g.name} className="text-muted-foreground">
                              &quot;{g.name}&quot; = {g.value} [{g.start} - {g.end}]
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">No match</p>
        )}
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Sample matching text</h3>
        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground">{sample || <span className="text-muted-foreground">—</span>}</pre>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Regex Diagram</h3>
        <div ref={diagramRef} className="min-h-[40px] overflow-x-auto [&_svg]:max-w-full" />
      </div>
    </div>
  );
}
