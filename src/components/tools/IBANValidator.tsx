import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";

const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 27,
  ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
  HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20,
  LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19,
  MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
  RO: 24, RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28,
  TL: 23, TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

function parseIBAN(s: string) {
  const clean = s.replace(/\s/g, "").toUpperCase();
  if (!clean) return { error: "No IBAN entered" };
  const cc = clean.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(cc)) return { error: "Invalid country code" };
  const expected = IBAN_LENGTHS[cc];
  if (!expected) return { error: "Unknown country code: " + cc };
  if (clean.length !== expected) return { error: "Expected " + expected + " characters, got " + clean.length };
  const reordered = clean.slice(4) + clean.slice(0, 4);
  let numeric = "";
  for (const ch of reordered) {
    if (/[0-9]/.test(ch)) numeric += ch;
    else numeric += (ch.charCodeAt(0) - 55).toString();
  }
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
  }
  const valid = remainder === 1;
  const bankCode = cc === "DE" || cc === "AT" || cc === "CH" ? clean.slice(4, 12) : clean.slice(4, 8);
  const accountNumber = clean.slice(-10);

  return {
    valid,
    country: cc,
    countryName: new Intl.DisplayNames(["en"], { type: "region" }).of(cc) || cc,
    length: clean.length,
    expectedLength: expected,
    bankCode,
    accountNumber,
    full: clean,
    formatted: clean.match(/.{1,4}/g)?.join(" ") || clean,
  };
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-mono text-sm text-primary">{value}</div>
    </div>
  );
}

export default function IBANValidator() {
  const [input, setInput] = useState("DE89370400440532013000");
  const result = useMemo(() => {
    try { return parseIBAN(input); }
    catch (e) { return { error: (e as Error).message }; }
  }, [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">IBAN</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="DE89370400440532013000" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      {"error" in result ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{result.error}</div>
      ) : (
        <>
          <div className={"rounded-sm border px-4 py-3 font-mono text-sm " + (result.valid ? "border-green-500/40 bg-green-500/10 text-green-600" : "border-destructive/40 bg-destructive/10 text-destructive")}>
            {result.valid ? "Valid IBAN" : "Invalid IBAN"} · {result.countryName}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card label="Country" value={result.country + " (" + result.countryName + ")"} />
            <Card label="Length" value={result.length + " / " + result.expectedLength} />
            <Card label="Bank Code" value={result.bankCode} />
            <Card label="Account Number" value={result.accountNumber} />
            <Card label="Formatted" value={result.formatted} />
            <Card label="Checksum" value={result.valid ? "Passed" : "Failed"} />
          </div>
        </>
      )}
    </div>
  );
}
