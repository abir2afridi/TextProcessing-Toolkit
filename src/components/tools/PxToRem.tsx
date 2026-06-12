import { useState } from "react";
import { ArrowRightLeft, Copy, Check, Info, Hash, Code, List, TextQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const COMMON_PX = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

const PRESETS = [
  { value: 16, label: "Browser default" },
  { value: 14, label: "Bootstrap / TW" },
  { value: 10, label: "Easy math" },
  { value: 12, label: "Small base" },
  { value: 20, label: "Large base" },
];

export default function PxToRemTool() {
  const [pxValue, setPxValue] = useState("");
  const [remValue, setRemValue] = useState("");
  const [baseSize, setBaseSize] = useState("16");
  const [copied, setCopied] = useState<"px" | "rem" | null>(null);
  const [mode, setMode] = useState<"px-to-rem" | "rem-to-px">("px-to-rem");
  const [bulkInput, setBulkInput] = useState("");
  const [clampMin, setClampMin] = useState("16");
  const [clampMax, setClampMax] = useState("24");
  const [clampMinVw, setClampMinVw] = useState("375");
  const [clampMaxVw, setClampMaxVw] = useState("1440");

  const base = parseFloat(baseSize) || 16;

  const formatRem = (px: number) => (px / base).toFixed(4).replace(/\.?0+$/, "");
  const formatEm = (px: number) => (px / base).toFixed(3).replace(/\.?0+$/, "");
  const formatPx = (rem: number) => (rem * base).toFixed(2).replace(/\.?0+$/, "");

  const handlePxChange = (value: string) => {
    setPxValue(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setRemValue(formatRem(num));
    } else {
      setRemValue("");
    }
  };

  const handleRemChange = (value: string) => {
    setRemValue(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setPxValue(formatPx(num));
    } else {
      setPxValue("");
    }
  };

  const handleBaseChange = (value: string) => {
    setBaseSize(value);
    const newBase = parseFloat(value) || 16;
    if (mode === "px-to-rem" && pxValue) {
      const num = parseFloat(pxValue);
      if (!isNaN(num)) {
        setRemValue((num / newBase).toFixed(4).replace(/\.?0+$/, ""));
      }
    } else if (mode === "rem-to-px" && remValue) {
      const num = parseFloat(remValue);
      if (!isNaN(num)) {
        setPxValue((num * newBase).toFixed(2).replace(/\.?0+$/, ""));
      }
    }
  };

  const copyToClipboard = async (value: string, type: "px" | "rem") => {
    const text = type === "px" ? `${value}px` : `${value}rem`;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleMode = () => {
    setMode(mode === "px-to-rem" ? "rem-to-px" : "px-to-rem");
  };

  const bulkPx = bulkInput
    .split(/[\n,]+/)
    .map(s => s.trim().replace(/px$/i, ""))
    .map(Number)
    .filter(n => !isNaN(n));

  const clampResult = (() => {
    const min = parseFloat(clampMin) || 16;
    const max = parseFloat(clampMax) || 24;
    const minVw = parseFloat(clampMinVw) || 375;
    const maxVw = parseFloat(clampMaxVw) || 1440;
    const slope = (max - min) / (maxVw - minVw);
    const intercept = min - slope * minVw;
    const preferred = (intercept / base).toFixed(4).replace(/\.?0+$/, "") + "rem";
    const slopeRem = (slope * 100).toFixed(4).replace(/\.?0+$/, "");
    return `clamp(${formatRem(min)}rem, ${slopeRem}vw + ${preferred}, ${formatRem(max)}rem)`;
  })();

  return (
    <div className="space-y-8">
      {/* Base Size Setting */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground">
          Base font size:
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={baseSize}
            onChange={(e) => handleBaseChange(e.target.value)}
            className="w-20 text-center font-bold"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
        {base !== 16 && (
          <span className="text-xs text-muted-foreground">
            (default: 16px)
          </span>
        )}
      </div>

      {/* Preset Base Sizes */}
      <div className="flex flex-wrap items-center gap-2">
        <Hash className="size-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mr-1">Presets:</span>
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            variant={base === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleBaseChange(p.value.toString())}
          >
            {p.value}px
            <span className="ml-1 text-[10px] opacity-70">{p.label}</span>
          </Button>
        ))}
      </div>

      {/* Formula Display */}
      {pxValue && remValue && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-2 text-center">
          {mode === "px-to-rem"
            ? `${pxValue}px ÷ ${base}px = ${remValue}rem`
            : `${remValue}rem × ${base}px = ${pxValue}px`}
        </div>
      )}

      {/* Main Converter */}
      <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-center">
        <div className="space-y-3">
          <label className="text-lg font-bold block">
            {mode === "px-to-rem" ? "Pixels" : "Result"}
          </label>
          <div className="relative">
            <Input
              type="number"
              value={pxValue}
              onChange={(e) =>
                mode === "px-to-rem"
                  ? handlePxChange(e.target.value)
                  : undefined
              }
              readOnly={mode === "rem-to-px"}
              placeholder="0"
              className="text-3xl h-16 pr-16 font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground font-medium">
              px
            </span>
          </div>
          {pxValue && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyToClipboard(pxValue, "px")}
            >
              {copied === "px" ? (
                <><Check className="size-4 mr-2" /> Copied!</>
              ) : (
                <><Copy className="size-4 mr-2" /> Copy {pxValue}px</>
              )}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full shrink-0"
          onClick={toggleMode}
        >
          <ArrowRightLeft className="size-6" />
        </Button>

        <div className="space-y-3">
          <label className="text-lg font-bold block">
            {mode === "rem-to-px" ? "REM" : "Result"}
          </label>
          <div className="relative">
            <Input
              type="number"
              value={remValue}
              onChange={(e) =>
                mode === "rem-to-px"
                  ? handleRemChange(e.target.value)
                  : undefined
              }
              readOnly={mode === "px-to-rem"}
              placeholder="0"
              className="text-3xl h-16 pr-20 font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground font-medium">
              rem
            </span>
          </div>
          {remValue && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyToClipboard(remValue, "rem")}
            >
              {copied === "rem" ? (
                <><Check className="size-4 mr-2" /> Copied!</>
              ) : (
                <><Copy className="size-4 mr-2" /> Copy {remValue}rem</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Reference with EM */}
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="font-bold mb-4">Quick Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {COMMON_PX.map((px) => (
            <button
              key={px}
              onClick={() => handlePxChange(px.toString())}
              className="p-3 rounded-md border bg-background hover:bg-accent transition-colors text-center"
            >
              <div className="font-bold">{px}px</div>
              <div className="text-sm text-muted-foreground">
                {formatRem(px)}rem
              </div>
              <div className="text-xs text-muted-foreground/60">
                {formatEm(px)}em
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Converter */}
      <Collapsible className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <List className="size-4 text-muted-foreground" />
          <span className="font-medium">Bulk Converter</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto">
              <ArrowRightLeft className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-4 space-y-4">
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Enter pixel values, one per line or comma-separated.&#10;Example:&#10;16&#10;24, 32, 48&#10;64px, 128px"
            rows={5}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono resize-y"
          />
          {bulkPx.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bulkPx.map((px, i) => (
                <div key={i} className="p-2 rounded-md border bg-muted/20 text-center text-sm">
                  <div className="font-bold">{px}px</div>
                  <div className="text-muted-foreground">{formatRem(px)}rem</div>
                  <div className="text-xs text-muted-foreground/60">{formatEm(px)}em</div>
                </div>
              ))}
            </div>
          )}
          {bulkPx.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const text = bulkPx.map(px => `${px}px → ${formatRem(px)}rem`).join("\n");
                await navigator.clipboard.writeText(text);
              }}
            >
              <Copy className="size-4 mr-2" /> Copy all results
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Clamp() Generator */}
      <Collapsible className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <TextQuote className="size-4 text-muted-foreground" />
          <span className="font-medium">CSS clamp() Generator</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto">
              <ArrowRightLeft className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Min font-size (px)</label>
              <Input type="number" value={clampMin} onChange={(e) => setClampMin(e.target.value)} className="text-center" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max font-size (px)</label>
              <Input type="number" value={clampMax} onChange={(e) => setClampMax(e.target.value)} className="text-center" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Min viewport (px)</label>
              <Input type="number" value={clampMinVw} onChange={(e) => setClampMinVw(e.target.value)} className="text-center" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max viewport (px)</label>
              <Input type="number" value={clampMaxVw} onChange={(e) => setClampMaxVw(e.target.value)} className="text-center" />
            </div>
          </div>
          <div className="relative">
            <code className="block p-3 rounded-lg border bg-muted/30 text-sm font-mono break-all">
              {clampResult}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              onClick={async () => {
                await navigator.clipboard.writeText(clampResult);
              }}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div>Min: {formatRem(parseFloat(clampMin) || 16)}rem / {clampMin}px</div>
            <div>Max: {formatRem(parseFloat(clampMax) || 24)}rem / {clampMax}px</div>
            <div>Vw min: {clampMinVw}px / {(parseFloat(clampMinVw) / base).toFixed(2)}rem</div>
            <div>Vw max: {clampMaxVw}px / {(parseFloat(clampMaxVw) / base).toFixed(2)}rem</div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* CSS Breakpoints Reference */}
      <Collapsible className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-muted-foreground" />
          <span className="font-medium">Media Query Breakpoints</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto">
              <ArrowRightLeft className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              { label: "xs", minPx: 0, maxPx: 639, note: "phones" },
              { label: "sm", minPx: 640, maxPx: 767, note: "phones landscape" },
              { label: "md", minPx: 768, maxPx: 1023, note: "tablets" },
              { label: "lg", minPx: 1024, maxPx: 1279, note: "desktop" },
              { label: "xl", minPx: 1280, maxPx: 1535, note: "wide desktop" },
              { label: "2xl", minPx: 1536, maxPx: Infinity, note: "extra wide" },
            ].map((bp) => (
              <div key={bp.label} className="p-3 rounded-md border bg-muted/20">
                <div className="font-bold uppercase">{bp.label}</div>
                <div className="text-xs text-muted-foreground">{bp.note}</div>
                <div className="text-xs mt-1">
                  {bp.minPx}px / {(bp.minPx / base).toFixed(2)}rem
                  {bp.maxPx < Infinity && (
                    <> – {bp.maxPx}px / {(bp.maxPx / base).toFixed(2)}rem</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
