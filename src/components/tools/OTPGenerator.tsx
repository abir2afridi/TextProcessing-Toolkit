import { useState } from "react";
import { OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateOTP } from "@/lib/text-utils";

export default function OTPGenerator() {
  const [digits, setDigits] = useState(6);
  const [code, setCode] = useState(() => generateOTP(6));

  const generate = () => setCode(generateOTP(digits));

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Digits</Label>
          <Input type="number" min={4} max={8} value={digits} onChange={(e) => setDigits(Math.max(4, Math.min(8, Number(e.target.value) || 4)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <Button size="sm" onClick={generate} className="h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <div className="rounded-sm border border-border bg-surface p-8 text-center">
        <span className="font-mono text-5xl tracking-widest text-foreground">{code}</span>
      </div>
    </div>
  );
}
