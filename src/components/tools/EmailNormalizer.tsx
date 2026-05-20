import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeEmail(email: string): { original: string; normalized: string; valid: boolean; error?: string } {
  const original = email;
  let e = email.trim();
  if (!e) return { original, normalized: "", valid: false, error: "Empty email" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(e)) return { original, normalized: "", valid: false, error: "Invalid email format" };

  const [local, domain] = e.split("@");
  if (!local || !domain) return { original, normalized: "", valid: false, error: "Missing local or domain part" };

  let normalizedLocal = local.toLowerCase();
  const normalizedDomain = domain.toLowerCase();

  if (normalizedDomain === "gmail.com" || normalizedDomain === "googlemail.com") {
    normalizedLocal = normalizedLocal.replace(/\./g, "");
    normalizedLocal = normalizedLocal.replace(/\+.*$/, "");
  }

  const normalized = `${normalizedLocal}@${normalizedDomain}`;
  return { original, normalized, valid: true };
}

export default function EmailNormalizer() {
  const [input, setInput] = useState("User.Name+spam@gmail.com");

  const result = useMemo(() => normalizeEmail(input), [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">email</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="user.name+tag@gmail.com" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
        {result.valid && (
          <span className="font-mono text-[11px] text-green-500/80">valid</span>
        )}
        {result.error && (
          <span className="font-mono text-[11px] text-destructive">{result.error}</span>
        )}
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="original" value={result.original} readOnly />
        <IOPanel label="normalized" value={result.normalized || "(invalid)"} readOnly />
      </div>
    </div>
  );
}
