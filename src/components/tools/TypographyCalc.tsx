import { useState } from "react";
import { ArrowRightLeft, Copy, Check, Hash, Layers, Code, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Unit = "px" | "pt" | "pc" | "ag" | "cc" | "in" | "mm" | "cm" | "em" | "rem";

interface UnitInfo {
  name: string;
  description: string;
  toPx: (value: number, basePx: number) => number;
  fromPx: (px: number, basePx: number) => number;
}

const UNITS: Record<Unit, UnitInfo> = {
  px: {
    name: "Pixels",
    description: "Screen pixels (96 per inch)",
    toPx: (v) => v,
    fromPx: (px) => px,
  },
  pt: {
    name: "Points",
    description: "Print points (72 per inch)",
    toPx: (v) => v * (96 / 72),
    fromPx: (px) => px * (72 / 96),
  },
  pc: {
    name: "Picas",
    description: "12 points per pica",
    toPx: (v) => v * 12 * (96 / 72),
    fromPx: (px) => px / 12 * (72 / 96),
  },
  ag: {
    name: "Agates",
    description: "14 agates per inch (US newspapers)",
    toPx: (v) => v * (96 / 14),
    fromPx: (px) => px * (14 / 96),
  },
  cc: {
    name: "Ciceros",
    description: "European unit (≈4.512mm)",
    toPx: (v) => v * 4.512 * (96 / 25.4),
    fromPx: (px) => px / (4.512 * (96 / 25.4)),
  },
  in: {
    name: "Inches",
    description: "Imperial inch",
    toPx: (v) => v * 96,
    fromPx: (px) => px / 96,
  },
  mm: {
    name: "Millimeters",
    description: "Metric millimeter",
    toPx: (v) => v * (96 / 25.4),
    fromPx: (px) => px * (25.4 / 96),
  },
  cm: {
    name: "Centimeters",
    description: "Metric centimeter",
    toPx: (v) => v * (96 / 2.54),
    fromPx: (px) => px * (2.54 / 96),
  },
  em: {
    name: "Em",
    description: "Relative to parent font-size",
    toPx: (v, basePx) => v * basePx,
    fromPx: (px, basePx) => px / basePx,
  },
  rem: {
    name: "Rem",
    description: "Relative to root font-size",
    toPx: (v, basePx) => v * basePx,
    fromPx: (px, basePx) => px / basePx,
  },
};

const UNIT_ORDER: Unit[] = ["px", "pt", "pc", "ag", "cc", "in", "mm", "cm", "em", "rem"];

const PRESET_SIZES = [
  { px: 8, label: "Caption 2" },
  { px: 10, label: "Caption" },
  { px: 12, label: "Small" },
  { px: 14, label: "Body sm" },
  { px: 16, label: "Body" },
  { px: 18, label: "Lead" },
  { px: 20, label: "H6" },
  { px: 24, label: "H5" },
  { px: 32, label: "H4/H3" },
  { px: 48, label: "H2" },
  { px: 64, label: "H1" },
  { px: 96, label: "Display" },
];

const BASE_PRESETS = [
  { value: 16, label: "Browser" },
  { value: 14, label: "Bootstrap" },
  { value: 10, label: "Easy math" },
  { value: 20, label: "Large" },
];

const SCALE_RATIOS = [
  { value: 1.067, label: "Minor Second" },
  { value: 1.125, label: "Major Second" },
  { value: 1.2, label: "Minor Third" },
  { value: 1.25, label: "Major Third" },
  { value: 1.333, label: "Perfect Fourth" },
  { value: 1.414, label: "Aug. Fourth" },
  { value: 1.5, label: "Perfect Fifth" },
  { value: 1.618, label: "Golden Ratio" },
];

export default function TypographyCalcTool() {
  const [inputValue, setInputValue] = useState("16");
  const [inputUnit, setInputUnit] = useState<Unit>("px");
  const [baseFontSize, setBaseFontSize] = useState("16");
  const [copiedCss, setCopiedCss] = useState(false);
  const [scaleBase, setScaleBase] = useState("16");
  const [scaleRatio, setScaleRatio] = useState("1.25");
  const [scaleUp, setScaleUp] = useState("5");
  const [scaleDown, setScaleDown] = useState("3");
  const [scaleUnit, setScaleUnit] = useState<Unit>("px");
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [clampMin, setClampMin] = useState("16");
  const [clampMax, setClampMax] = useState("24");
  const [clampMinVw, setClampMinVw] = useState("375");
  const [clampMaxVw, setClampMaxVw] = useState("1440");

  const basePx = parseFloat(baseFontSize) || 16;
  const numValue = parseFloat(inputValue) || 0;
  const pxValue = UNITS[inputUnit].toPx(numValue, basePx);

  const formatValue = (value: number) => {
    if (Math.abs(value) < 0.001) return "0";
    if (Math.abs(value) >= 1000) return value.toFixed(2);
    if (Math.abs(value) >= 100) return value.toFixed(3);
    if (Math.abs(value) >= 10) return value.toFixed(4);
    if (Math.abs(value) >= 1) return value.toFixed(5);
    return value.toFixed(6);
  };

  const swapUnit = (newUnit: Unit) => {
    const newValue = UNITS[newUnit].fromPx(pxValue, basePx);
    setInputValue(formatValue(newValue));
    setInputUnit(newUnit);
  };

  const cssVars = UNIT_ORDER.map((unit) => {
    const val = UNITS[unit].fromPx(pxValue, basePx);
    return `  --fs-${unit}: ${val}${unit};`;
  }).join("\n");

  const copyCss = async () => {
    await navigator.clipboard.writeText(`:root {\n${cssVars}\n}`);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 1500);
  };

  const scalePx = parseFloat(scaleBase) || 16;
  const ratio = parseFloat(scaleRatio) || 1.25;
  const stepsUp = parseInt(scaleUp) || 5;
  const stepsDown = parseInt(scaleDown) || 3;

  const scale = [];
  for (let i = -stepsDown; i <= stepsUp; i++) {
    scale.push({ step: i, px: scalePx * Math.pow(ratio, i) });
  }

  const scaleUnitVal = (px: number) => UNITS[scaleUnit].fromPx(px, basePx);

  const lhRatio = Math.max(1.1, Math.min(1.6, 1.5 - (pxValue - 16) * 0.005));
  const lhPx = pxValue * lhRatio;

  const clampResult = (() => {
    const min = parseFloat(clampMin) || 16;
    const max = parseFloat(clampMax) || 24;
    const minVw = parseFloat(clampMinVw) || 375;
    const maxVw = parseFloat(clampMaxVw) || 1440;
    const slope = (max - min) / (maxVw - minVw);
    const intercept = min - slope * minVw;
    const preferred = (intercept / basePx).toFixed(4).replace(/\.?0+$/, "") + "rem";
    const slopeRem = (slope * 100).toFixed(4).replace(/\.?0+$/, "");
    return `clamp(${(min / basePx).toFixed(4).replace(/\.?0+$/, "")}rem, ${slopeRem}vw + ${preferred}, ${(max / basePx).toFixed(4).replace(/\.?0+$/, "")}rem)`;
  })();

  const copyCard = async (unit: Unit, val: number) => {
    await navigator.clipboard.writeText(`${formatValue(val)}${unit}`);
    setCopiedCard(unit);
    setTimeout(() => setCopiedCard(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Base Font Size */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="font-bold">Base Font Size</label>
            <p className="text-sm text-muted-foreground">
              Used for em and rem calculations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(e.target.value)}
              className="w-24 text-center font-mono"
            />
            <span className="text-muted-foreground">px</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {BASE_PRESETS.map((p) => (
            <Button
              key={p.value}
              variant={basePx === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setBaseFontSize(p.value.toString())}
            >
              {p.value}px <span className="text-[10px] opacity-70 ml-0.5">{p.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Preset Sizes */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Hash className="size-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground mr-1">Presets:</span>
        {PRESET_SIZES.map((p) => (
          <Button
            key={p.px}
            variant={parseFloat(inputValue) === p.px ? "default" : "outline"}
            size="sm"
            onClick={() => setInputValue(p.px.toString())}
          >
            {p.px}px
            <span className="ml-1 text-[10px] opacity-70">{p.label}</span>
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-3">
        <label className="font-bold">Convert From</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="text-2xl h-14 font-mono w-full pr-12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              step="any"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
              <button
                type="button"
                onClick={() => setInputValue((prev) => String((parseFloat(prev) || 0) + 1))}
                className="flex h-5 w-6 items-center justify-center rounded-t rounded-b-none hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setInputValue((prev) => String((parseFloat(prev) || 0) - 1))}
                className="flex h-5 w-6 items-center justify-center rounded-b rounded-t-none hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border-t border-border"
              >
                <Minus className="h-3 w-3" />
              </button>
            </div>
          </div>
          <Select value={inputUnit} onValueChange={(v) => setInputUnit(v as Unit)}>
            <SelectTrigger className="h-14 text-lg font-mono min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_ORDER.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold">Converted Values</label>
          <Button variant="outline" size="sm" onClick={copyCss}>
            {copiedCss ? (
              <><Check className="size-4 mr-1" /> Copied CSS</>
            ) : (
              <><Copy className="size-4 mr-1" /> Copy as CSS</>
            )}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {UNIT_ORDER.map((unit) => {
            const converted = UNITS[unit].fromPx(pxValue, basePx);
            const isActive = unit === inputUnit;

            return (
              <button
                key={unit}
                onClick={() => swapUnit(unit)}
                disabled={isActive}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:border-primary/50"
                } group`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{UNITS[unit].name}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {unit}
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold tabular-nums">
                  {formatValue(converted)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {UNITS[unit].description}
                </div>
                <div className="flex items-center justify-between mt-2">
                  {!isActive && (
                    <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100">
                      <ArrowRightLeft className="size-3" />
                      Click to convert from
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 ml-auto"
                    onClick={(e) => { e.stopPropagation(); copyCard(unit, converted); }}
                  >
                    {copiedCard === unit ? <Check className="size-3" /> : <Copy className="size-3" />}
                  </Button>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Line Height Recommendation */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="font-bold">Recommended Line Height</label>
            <p className="text-sm text-muted-foreground">
              For {formatValue(pxValue)}px font size
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono font-bold tabular-nums">
              {lhRatio.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatValue(lhPx)}px
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      {pxValue > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <label className="font-bold block mb-3">
            Live Preview — {formatValue(pxValue)}px
          </label>
          <div
            className="leading-snug text-foreground"
            style={{ fontSize: `${pxValue}px` }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
          <div
            className="leading-snug text-muted-foreground"
            style={{ fontSize: `${Math.max(pxValue * 0.5, 8)}px` }}
          >
            Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
          </div>
        </div>
      )}

      {/* Clamp Generator */}
      <Collapsible className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Code className="size-4 text-muted-foreground" />
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
              <Input type="number" value={clampMin} onChange={(e) => setClampMin(e.target.value)} className="text-center font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max font-size (px)</label>
              <Input type="number" value={clampMax} onChange={(e) => setClampMax(e.target.value)} className="text-center font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Min viewport (px)</label>
              <Input type="number" value={clampMinVw} onChange={(e) => setClampMinVw(e.target.value)} className="text-center font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max viewport (px)</label>
              <Input type="number" value={clampMaxVw} onChange={(e) => setClampMaxVw(e.target.value)} className="text-center font-mono" />
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
              <Copy className="size-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div>Min: {(parseFloat(clampMin) / basePx).toFixed(4).replace(/\.?0+$/, "")}rem / {clampMin}px @ {clampMinVw}px</div>
            <div>Max: {(parseFloat(clampMax) / basePx).toFixed(4).replace(/\.?0+$/, "")}rem / {clampMax}px @ {clampMaxVw}px</div>
            <div>Slope: {((parseFloat(clampMax) - parseFloat(clampMin)) / (parseFloat(clampMaxVw) - parseFloat(clampMinVw)) * 100).toFixed(2)}vw</div>
            <div>Base: {basePx}px</div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Modular Scale Generator */}
      <Collapsible className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <span className="font-medium">Modular Scale Generator</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto">
              <ArrowRightLeft className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Base (px)</label>
              <Input type="number" value={scaleBase} onChange={(e) => setScaleBase(e.target.value)} className="text-center font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ratio</label>
              <Select value={scaleRatio} onValueChange={setScaleRatio}>
                <SelectTrigger className="text-sm font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCALE_RATIOS.map((r) => (
                    <SelectItem key={r.value} value={r.value.toString()}>
                      {r.label} ({r.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Steps up</label>
              <Input type="number" value={scaleUp} onChange={(e) => setScaleUp(e.target.value)} className="text-center" min="0" max="20" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Steps down</label>
              <Input type="number" value={scaleDown} onChange={(e) => setScaleDown(e.target.value)} className="text-center" min="0" max="20" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Show in</label>
              <Select value={scaleUnit} onValueChange={(v) => setScaleUnit(v as Unit)}>
                <SelectTrigger className="text-sm font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_ORDER.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-1 pr-4">Step</th>
                  <th className="text-left py-1 pr-4">Label</th>
                  <th className="text-right py-1 pr-4">px</th>
                  <th className="text-right py-1 pr-4">{scaleUnit}</th>
                  <th className="text-right py-1">rem</th>
                </tr>
              </thead>
              <tbody>
                {scale.slice().reverse().map((s) => {
                  const label =
                    s.step === 0 ? "Base" :
                    s.step < 0 ? `-${Math.abs(s.step)}` : `+${s.step}`;
                  return (
                    <tr key={s.step} className={`border-b last:border-0 ${s.step === 0 ? "font-bold" : ""}`}>
                      <td className="py-1.5 pr-4 text-muted-foreground font-mono">{s.step}</td>
                      <td className="py-1.5 pr-4">{label}</td>
                      <td className="py-1.5 pr-4 text-right font-mono tabular-nums">{formatValue(s.px)}</td>
                      <td className="py-1.5 pr-4 text-right font-mono tabular-nums">{formatValue(scaleUnitVal(s.px))}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums">{formatValue(s.px / basePx)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const lines = scale.map((s) => {
                const label =
                  s.step === 0 ? "base" :
                  s.step < 0 ? `neg-${Math.abs(s.step)}` : `pos-${s.step}`;
                return `  --scale-${label}: ${formatValue(s.px)}px;`;
              });
              await navigator.clipboard.writeText(`:root {\n${lines.join("\n")}\n}`);
            }}
          >
            <Copy className="size-4 mr-2" /> Copy scale as CSS
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Reference */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <label className="font-bold block mb-3">Quick Reference</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">1 inch =</div>
            <div className="font-mono">96px / 72pt / 25.4mm</div>
          </div>
          <div>
            <div className="text-muted-foreground">1 pica =</div>
            <div className="font-mono">12 points</div>
          </div>
          <div>
            <div className="text-muted-foreground">1 point =</div>
            <div className="font-mono">1/72 inch</div>
          </div>
          <div>
            <div className="text-muted-foreground">1 agate =</div>
            <div className="font-mono">1/14 inch (≈5.14pt)</div>
          </div>
          <div>
            <div className="text-muted-foreground">1 cicero =</div>
            <div className="font-mono">12 Didot pts (≈4.512mm)</div>
          </div>
          <div>
            <div className="text-muted-foreground">1 em/rem =</div>
            <div className="font-mono">{basePx}px (base)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
