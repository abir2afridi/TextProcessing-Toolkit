import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, ClipboardPaste, Eye, EyeOff, X } from "lucide-react";
import { analyzePasswordStrength } from "@/lib/text-utils";

function getCharsetLength(password: string) {
  let len = 0;
  if (/[a-z]/.test(password)) len += 26;
  if (/[A-Z]/.test(password)) len += 26;
  if (/\d/.test(password)) len += 10;
  if (/\W|_/.test(password)) len += 32;
  return len;
}

function getHumanFriendlyDuration(seconds: number) {
  if (seconds <= 0.001) return "Instantly";
  if (seconds <= 1) return "Less than a second";

  const units = [
    { unit: "millennium", secondsInUnit: 31536000000, plural: "millennia" },
    { unit: "century", secondsInUnit: 3153600000, plural: "centuries" },
    { unit: "decade", secondsInUnit: 315360000, plural: "decades" },
    { unit: "year", secondsInUnit: 31536000, plural: "years" },
    { unit: "month", secondsInUnit: 2592000, plural: "months" },
    { unit: "week", secondsInUnit: 604800, plural: "weeks" },
    { unit: "day", secondsInUnit: 86400, plural: "days" },
    { unit: "hour", secondsInUnit: 3600, plural: "hours" },
    { unit: "minute", secondsInUnit: 60, plural: "minutes" },
    { unit: "second", secondsInUnit: 1, plural: "seconds" },
  ];

  let remaining = seconds;
  const parts: string[] = [];
  for (const { unit, secondsInUnit, plural } of units) {
    const qty = Math.floor(remaining / secondsInUnit);
    remaining %= secondsInUnit;
    if (qty <= 0) continue;
    const label = qty > 1 ? plural : unit;
    parts.push(`${qty.toLocaleString()} ${label}`);
    if (parts.length >= 2) break;
  }
  return parts.join(", ");
}

export default function PasswordStrength() {
  const [input, setInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const itools = useMemo(() => {
    if (!input) return null;
    const charsetLength = getCharsetLength(input);
    const passwordLength = input.length;
    const entropy = Math.log2(charsetLength || 1) * passwordLength;
    const secondsToCrack = 2 ** entropy / 1e9;
    const crackDurationFormatted = getHumanFriendlyDuration(secondsToCrack);
    const score = Math.min(entropy / 128, 1);
    return { charsetLength, passwordLength, entropy, crackDurationFormatted, secondsToCrack, score };
  }, [input]);

  const analysis = useMemo(() => {
    if (!input) return null;
    return analyzePasswordStrength(input);
  }, [input]);

  const details = useMemo(() => {
    if (!itools) return [];
    return [
      { label: "Password length:", value: itools.passwordLength },
      { label: "Entropy:", value: Math.round(itools.entropy * 100) / 100 },
      { label: "Character set size:", value: itools.charsetLength },
      { label: "Score:", value: `${Math.round(itools.score * 100)} / 100` },
    ];
  }, [itools]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <Input
            type={showPassword ? "text" : "password"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a password..."
            autoFocus
            className="h-8 w-full rounded-sm font-mono text-xs"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="h-8 w-8 rounded-sm p-0" title={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(input); toast.success("Password copied"); }} disabled={!input} className="h-8 w-8 rounded-sm p-0" title="Copy password">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={async () => { try { const text = await navigator.clipboard.readText(); setInput(text); toast.success("Pasted"); } catch { toast.error("Clipboard read blocked"); } }} className="h-8 w-8 rounded-sm p-0" title="Paste from clipboard">
          <ClipboardPaste className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input} className="h-8 w-8 rounded-sm p-0" title="Clear">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {itools && (
        <>
          <div className="rounded-sm border border-border bg-surface px-4 py-3 text-center font-mono">
            <div className="text-[11px] text-muted-foreground">Duration to crack this password with brute force</div>
            <div className="mt-1 text-2xl text-foreground">{itools.crackDurationFormatted}</div>
          </div>

          <div className="rounded-sm border border-border bg-surface px-4 py-3 font-mono text-xs">
            {details.map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <div className="flex-1 text-right text-muted-foreground">{label}</div>
                <div className="flex-1 text-left text-foreground">{value}</div>
              </div>
            ))}
          </div>

          {analysis && (
            <div className="rounded-sm border border-border bg-surface p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Strength</span>
                <span className="font-mono text-xs font-semibold" style={{ color: analysis.color }}>{analysis.label}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(itools.score * 100)}%`, backgroundColor: analysis.color }} />
              </div>
              {analysis.feedback.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Suggestions</span>
                  <ul className="space-y-0.5">
                    {analysis.feedback.map((f, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground/80">• {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="font-mono text-[11px] text-muted-foreground/70">
            <span className="font-bold">Note: </span>
            The computed strength is based on the time it would take to crack the password using a brute force approach, it does not take into account the possibility of a dictionary attack.
          </div>
        </>
      )}
    </div>
  );
}
