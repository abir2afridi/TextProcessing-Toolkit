import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const vocabulary = [
  "a", "ac", "accumsan", "ad", "adipiscing", "aenean", "aliquam", "aliquet", "amet", "ante",
  "aptent", "arcu", "at", "auctor", "bibendum", "blandit", "class", "commodo", "condimentum",
  "congue", "consectetur", "consequat", "conubia", "convallis", "cras", "cubilia", "cum",
  "curabitur", "curae", "dapibus", "diam", "dictum", "dictumst", "dignissim", "dolor", "donec",
  "dui", "duis", "egestas", "eget", "eleifend", "elementum", "elit", "enim", "erat", "eros",
  "est", "et", "etiam", "eu", "euismod", "facilisi", "faucibus", "felis", "fermentum", "feugiat",
  "fringilla", "fusce", "gravida", "habitant", "habitasse", "hac", "hendrerit", "himenaeos",
  "iaculis", "id", "imperdiet", "in", "inceptos", "integer", "interdum", "ipsum", "justo",
  "lacinia", "lacus", "laoreet", "lectus", "leo", "ligula", "litora", "lobortis", "lorem",
  "luctus", "maecenas", "magna", "magnis", "malesuada", "massa", "mattis", "mauris", "metus",
  "mi", "molestie", "mollis", "montes", "morbi", "mus", "nam", "nascetur", "natoque", "nec",
  "neque", "netus", "nisi", "nisl", "non", "nostra", "nulla", "nullam", "nunc", "odio", "orci",
  "ornare", "parturient", "pellentesque", "penatibus", "per", "pharetra", "phasellus", "placerat",
  "platea", "porta", "porttitor", "posuere", "potenti", "praesent", "pretium", "primis", "proin",
  "pulvinar", "purus", "quam", "quis", "quisque", "rhoncus", "ridiculus", "risus", "rutrum",
  "sagittis", "sapien", "scelerisque", "sed", "sem", "semper", "senectus", "sit", "sociis",
  "sociosqu", "sodales", "sollicitudin", "suscipit", "suspendisse", "taciti", "tellus", "tempor",
  "tempus", "tincidunt", "torquent", "tortor", "turpis", "ullamcorper", "ultrices", "ultricies",
  "urna", "varius", "vehicula", "vel", "velit", "venenatis", "vestibulum", "vitae", "vivamus",
  "viverra", "volutpat", "vulputate",
];

const firstSentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFromArray(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSentence(wordCount: number) {
  const words = Array.from({ length: wordCount }, () => randFromArray(vocabulary));
  return words[0].charAt(0).toUpperCase() + words.slice(1).join(" ") + ".";
}

function generateLoremIpsum(paragraphs: number, sentenceRange: [number, number], wordRange: [number, number], startWithLoremIpsum: boolean, asHTML: boolean) {
  const result = Array.from({ length: paragraphs }, () =>
    Array.from({ length: randInt(sentenceRange[0], sentenceRange[1]) }, () =>
      generateSentence(randInt(wordRange[0], wordRange[1])),
    ),
  );
  if (startWithLoremIpsum) result[0][0] = firstSentence;
  if (asHTML) return `<p>${result.map((s) => s.join(" ")).join("</p>\n\n<p>")}</p>`;
  return result.map((s) => s.join(" ")).join("\n\n");
}

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(1);
  const [sentencesMin, setSentencesMin] = useState(3);
  const [sentencesMax, setSentencesMax] = useState(8);
  const [wordsMin, setWordsMin] = useState(8);
  const [wordsMax, setWordsMax] = useState(15);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [asHTML, setAsHTML] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const text = useMemo(
    () => generateLoremIpsum(
      paragraphs,
      [Math.min(sentencesMin, sentencesMax), Math.max(sentencesMin, sentencesMax)],
      [Math.min(wordsMin, wordsMax), Math.max(wordsMin, wordsMax)],
      startWithLorem,
      asHTML,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paragraphs, sentencesMin, sentencesMax, wordsMin, wordsMax, startWithLorem, asHTML, refreshKey],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Paragraphs</Label>
            <Input type="number" min={1} max={20} value={paragraphs} onChange={(e) => setParagraphs(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="h-8 rounded-sm font-mono text-xs" />
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={startWithLorem} onCheckedChange={setStartWithLorem} />
              <Label className="font-mono text-[11px] text-muted-foreground">Start with lorem ipsum ?</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={asHTML} onCheckedChange={setAsHTML} />
              <Label className="font-mono text-[11px] text-muted-foreground">As html ?</Label>
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Sentences per paragraph</Label>
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={50} value={sentencesMin} onChange={(e) => setSentencesMin(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="h-8 rounded-sm font-mono text-xs" />
              <span className="font-mono text-[11px] text-muted-foreground">to</span>
              <Input type="number" min={1} max={50} value={sentencesMax} onChange={(e) => setSentencesMax(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="h-8 rounded-sm font-mono text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Words per sentence</Label>
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={50} value={wordsMin} onChange={(e) => setWordsMin(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="h-8 rounded-sm font-mono text-xs" />
              <span className="font-mono text-[11px] text-muted-foreground">to</span>
              <Input type="number" min={1} max={50} value={wordsMax} onChange={(e) => setWordsMax(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="h-8 rounded-sm font-mono text-xs" />
            </div>
          </div>
        </div>
      </div>

      <textarea
        readOnly
        value={text}
        className="h-32 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground"
      />

      <div className="flex justify-center gap-3">
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" onClick={() => { navigator.clipboard.writeText(text); toast("Lorem ipsum copied to the clipboard"); }}>Copy</Button>
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" onClick={() => setRefreshKey((k) => k + 1)}>Refresh</Button>
      </div>
    </div>
  );
}
