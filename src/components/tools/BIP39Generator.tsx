import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { generateBIP39Passphrase } from "@/lib/text-utils";

const wordCounts = [12, 15, 18, 21, 24] as const;

export default function BIP39Generator() {
  const [words, setWords] = useState<12 | 15 | 18 | 21 | 24>(12);
  const [phrase, setPhrase] = useState(() => generateBIP39Passphrase(12));

  const generate = () => setPhrase(generateBIP39Passphrase(words));

  return (
    <div className="space-y-4">
      <OptionRow>
        {wordCounts.map((wc) => (
          <Button key={wc} size="sm" variant={words === wc ? "default" : "ghost"} onClick={() => setWords(wc)} className="h-7 rounded-sm font-mono text-[11px]">
            {wc}
          </Button>
        ))}
        <Button size="sm" onClick={generate} className="ml-auto h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <IOPanel label="BIP39 Passphrase" value={phrase} readOnly rows={6} />
    </div>
  );
}
