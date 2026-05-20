import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { lorem } from "@/lib/text-utils";

export default function LoremIpsum() {
  const [paragraphs, setP] = useState(3);
  const [sentences, setS] = useState(5);
  const [words, setW] = useState(12);
  const [bump, setBump] = useState(0);
  const text = useMemo(() => lorem(paragraphs, sentences, words), [paragraphs, sentences, words, bump]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <Field label="paragraphs" v={paragraphs} on={setP} />
        <Field label="sentences/p" v={sentences} on={setS} />
        <Field label="words/s" v={words} on={setW} />
        <Button size="sm" onClick={() => setBump((b) => b + 1)} className="ml-auto h-7 rounded-sm font-mono text-[11px]">Regenerate</Button>
      </OptionRow>
      <IOPanel label="Lorem" value={text} readOnly rows={20} monospace={false} />
    </div>
  );
}
function Field({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input type="number" min={1} max={50} value={v} onChange={(e) => on(Math.max(1, Number(e.target.value) || 1))} className="h-7 w-16 rounded-sm font-mono text-xs" />
    </div>
  );
}
