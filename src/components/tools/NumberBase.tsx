import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";
import { Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function convertBase({ value, fromBase, toBase }: { value: string; fromBase: number; toBase: number }) {
  const range = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);
  let decValue = value
    .split("")
    .reverse()
    .reduce((carry: bigint, digit: string, index: number) => {
      if (!fromRange.includes(digit)) {
        throw new Error(`Invalid digit "${digit}" for base ${fromBase}.`);
      }
      return carry + BigInt(fromRange.indexOf(digit)) * BigInt(fromBase) ** BigInt(index);
    }, 0n);
  let newValue = "";
  while (decValue > 0) {
    newValue = toRange[Number(decValue % BigInt(toBase))] + newValue;
    decValue = (decValue - (decValue % BigInt(toBase))) / BigInt(toBase);
  }
  return newValue || "0";
}

function CopyRow({ label, value, placeholder }: { label: string; value: string; placeholder?: string }) {
  return (
    <div className="flex items-stretch rounded-sm border border-border bg-surface">
      <div className="flex w-[170px] flex-shrink-0 items-center justify-end border-r border-border px-3 font-mono text-[11px] text-muted-foreground">
        {label}
      </div>
      <input
        value={value}
        readOnly
        placeholder={placeholder ?? ""}
        className="h-10 flex-1 bg-transparent px-3 font-mono text-xs text-primary outline-none"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 flex-shrink-0 rounded-none rounded-r-sm border-l border-border"
        disabled={!value}
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success(`Copied ${label}`);
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function NumberBase() {
  const [input, setInput] = useState("42");
  const [inputBase, setInputBase] = useState(10);
  const [customBase, setCustomBase] = useState(42);

  const fixedBases = [
    { label: "Binary (2)", base: 2 },
    { label: "Octal (8)", base: 8 },
    { label: "Decimal (10)", base: 10 },
    { label: "Hexadecimal (16)", base: 16 },
    { label: "Base64 (64)", base: 64 },
  ];

  const { results, error } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { results: null as Record<number, string> | null, error: null as string | null };
    try {
      const r: Record<number, string> = {};
      for (const { base } of fixedBases) {
        r[base] = convertBase({ value: trimmed, fromBase: inputBase, toBase: base });
      }
      r[customBase] = convertBase({ value: trimmed, fromBase: inputBase, toBase: customBase });
      return { results: r, error: null };
    } catch (e) {
      return { results: null, error: (e as Error).message };
    }
  }, [input, inputBase, customBase]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Input number</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Put your number here (ex: 42)"
            className="h-8 flex-1 rounded-sm font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Input base</Label>
          <Input
            type="number"
            min={2}
            max={64}
            value={inputBase}
            onChange={(e) => setInputBase(Math.max(2, Math.min(64, Number(e.target.value) || 10)))}
            placeholder="ex: 10"
            className="h-8 w-24 rounded-sm font-mono text-xs"
          />
        </div>
      </OptionRow>

      {error ? (
        <div className="flex items-center gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : (
        <div className="space-y-2">
          {fixedBases.map(({ label, base }) => (
            <CopyRow key={base} label={label} value={results?.[base] ?? ""} />
          ))}

          <div className="flex items-center gap-2">
            <div className="flex w-[170px] flex-shrink-0 items-center justify-end">
              <span className="font-mono text-[11px] text-muted-foreground">Custom:</span>
            </div>
            <Input
              type="number"
              min={2}
              max={64}
              value={customBase}
              onChange={(e) => setCustomBase(Math.max(2, Math.min(64, Number(e.target.value) || 42)))}
              className="h-8 w-24 rounded-sm font-mono text-xs"
            />
          </div>
          <CopyRow
            label={`Base ${customBase}`}
            value={results?.[customBase] ?? ""}
            placeholder={`Base ${customBase} will be here...`}
          />
        </div>
      )}
    </div>
  );
}
