import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { unicodeNormalize, transliterateLatin, smartToAscii, removeInvisible, type NormForm } from "@/lib/text-utils";

const FORMS: NormForm[] = ["NFC", "NFD", "NFKC", "NFKD"];

export default function UnicodeCleaner() {
  const [input, setInput] = useState("Café — “smart” quotes… naïve résumé\u200B");
  const [form, setForm] = useState<NormForm>("NFC");
  const [translit, setTranslit] = useState(false);
  const [smart, setSmart] = useState(true);
  const [stripInvis, setStripInvis] = useState(true);

  const output = useMemo(() => {
    let t = unicodeNormalize(input, form);
    if (smart) t = smartToAscii(t);
    if (translit) t = transliterateLatin(t);
    if (stripInvis) t = removeInvisible(t, false);
    return t;
  }, [input, form, smart, translit, stripInvis]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {FORMS.map((f) => (
          <Button key={f} size="sm" variant={form === f ? "default" : "ghost"} onClick={() => setForm(f)} className="h-7 rounded-sm font-mono text-[11px]">{f}</Button>
        ))}
        <div className="mx-2 h-5 w-px bg-border" />
        <Toggle label="Smart punct → ASCII" v={smart} on={setSmart} />
        <Toggle label="Transliterate accents" v={translit} on={setTranslit} />
        <Toggle label="Strip invisible" v={stripInvis} on={setStripInvis} />
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Cleaned" value={output} readOnly />
      </div>
    </div>
  );
}
function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={v} onCheckedChange={on} />
      <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
    </div>
  );
}
