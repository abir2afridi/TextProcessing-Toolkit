import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateMnemonic, entropyToMnemonic, mnemonicToEntropy, wordlists, validateMnemonic } from "bip39";
import banglaWordlist from "@/data/bangla-bip39.json";

const languageMap: Record<string, string | undefined> = {
  English: "english",
  "Chinese simplified": "chinese_simplified",
  "Chinese traditional": "chinese_traditional",
  Czech: "czech",
  French: "french",
  Italian: "italian",
  Japanese: "japanese",
  Korean: "korean",
  Portuguese: "portuguese",
  Spanish: "spanish",
  "Bengali (Bangla)": undefined,
};

const languageLabels = Object.keys(languageMap);
type Language = keyof typeof languageMap;

function getWordlist(lang: Language): string[] {
  const key = languageMap[lang];
  return key ? wordlists[key] : (banglaWordlist as string[]);
}

export default function BIP39Generator() {
  const [language, setLanguage] = useState<Language>("English");
  const [entropy, setEntropy] = useState("");
  const [mnemonic, setMnemonic] = useState("");

  const wordlist = getWordlist(language);

  const entropyError = useMemo(() => {
    if (!entropy) return "";
    if (!/^[a-fA-F0-9]*$/.test(entropy)) return "Entropy should be an hexadecimal string";
    const len = entropy.length;
    if (len < 32 || len > 64 || len % 8 !== 0) return "Entropy length should be >= 32, <= 64 and be a multiple of 8 hex chars (16-32 bytes)";
    return "";
  }, [entropy]);

  const mnemonicError = useMemo(() => {
    if (!mnemonic) return "";
    try {
      if (!validateMnemonic(mnemonic, wordlist)) {
        return "Invalid mnemonic";
      }
      return "";
    } catch { return "Invalid mnemonic"; }
  }, [mnemonic, wordlist]);

  const validEntropy = !entropyError && entropy.length > 0;

  function refreshEntropy() {
    const strength = 128;
    const newMnemonic = generateMnemonic(strength, undefined, wordlist);
    setMnemonic(newMnemonic);
    try {
      setEntropy(mnemonicToEntropy(newMnemonic, wordlist));
    } catch { setEntropy(""); }
  }

  function onEntropyChange(value: string) {
    setEntropy(value);
    const h = value.trim();
    if (!h) { setMnemonic(""); return; }
    try {
      setMnemonic(entropyToMnemonic(h, wordlist));
    } catch { setMnemonic(""); }
  }

  function onMnemonicChange(value: string) {
    setMnemonic(value);
    const m = value.trim();
    if (!m) { setEntropy(""); return; }
    try {
      setEntropy(mnemonicToEntropy(m, wordlist));
    } catch { setEntropy(""); }
  }

  return (
    <div className="space-y-4">
      <OptionRow>
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Language</Label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="h-8 rounded-sm border border-border bg-surface px-2 font-mono text-[11px] text-foreground"
        >
          {languageLabels.map((l) => (<option key={l} value={l}>{l}</option>))}
        </select>
      </OptionRow>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="w-32 flex-shrink-0 font-mono text-[11px] text-muted-foreground">Entropy (seed):</Label>
          <Input
            value={entropy}
            onChange={(e) => onEntropyChange(e.target.value)}
            placeholder="Your string..."
            className={`h-8 flex-1 rounded-sm font-mono text-xs ${entropyError ? "border-destructive" : ""}`}
          />
          <Button size="sm" variant="ghost" onClick={refreshEntropy} className="h-8 w-8 rounded-sm p-0" title="Refresh entropy">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(entropy); toast.success("Entropy copied"); }} disabled={!entropy} className="h-8 w-8 rounded-sm p-0" title="Copy entropy">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </Button>
        </div>
        {entropyError && <p className="px-1 font-mono text-[10px] text-destructive">{entropyError}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="w-32 flex-shrink-0 font-mono text-[11px] text-muted-foreground">Passphrase (mnemonic):</Label>
          <Input
            value={mnemonic}
            onChange={(e) => onMnemonicChange(e.target.value)}
            placeholder="Your mnemonic..."
            className={`h-8 flex-1 rounded-sm font-mono text-xs ${mnemonicError ? "border-destructive" : ""}`}
          />
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(mnemonic); toast.success("Passphrase copied"); }} disabled={!mnemonic} className="h-8 w-8 rounded-sm p-0" title="Copy passphrase">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </Button>
        </div>
        {mnemonicError && <p className="px-1 font-mono text-[10px] text-destructive">{mnemonicError}</p>}
      </div>
    </div>
  );
}
