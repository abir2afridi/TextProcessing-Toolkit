import { useState } from "react";
import { Copy, Check, Ruler, Code, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "calculator" | "css" | "reverse" | "preview";

const LOREM = "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.";

export default function LineHeightCalcTool() {
  const [fontSize, setFontSize] = useState("16");
  const [customRatio, setCustomRatio] = useState("");
  const [baseFontSize, setBaseFontSize] = useState("16");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [previewWidth, setPreviewWidth] = useState("400");

  // Reverse calc state
  const [reverseTarget, setReverseTarget] = useState("");
  const [reverseRatio, setReverseRatio] = useState("1.5");

  const size = parseFloat(fontSize) || 16;
  const baseSize = parseFloat(baseFontSize) || 16;
  const cr = parseFloat(customRatio);

  const ratios = [
    { name: "Tight", ratio: 1.2, use: "Headings, large text" },
    { name: "Snug", ratio: 1.375, use: "Subheadings" },
    { name: "Normal", ratio: 1.5, use: "Body text (recommended)" },
    { name: "Relaxed", ratio: 1.625, use: "Long-form reading" },
    { name: "Loose", ratio: 2, use: "Large blocks, accessibility" },
  ];

  const copyValue = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const toUnitless = (lh: number) => (lh / size);
  const toRem = (lh: number) => lh / baseSize;
  const toPercent = (lh: number) => (lh / size * 100);

  const formatOutput = (lh: number) => ({
    px: `${lh.toFixed(1)}px`,
    unitless: toUnitless(lh).toFixed(3),
    rem: `${toRem(lh).toFixed(3)}rem`,
    percent: `${toPercent(lh).toFixed(1)}%`,
  });

  // Reverse: given line-height px and ratio, find font-size
  const reverseSize = parseFloat(reverseTarget) && parseFloat(reverseRatio)
    ? (parseFloat(reverseTarget) / parseFloat(reverseRatio))
    : null;

  // Baseline grid: check if line-height fits on a grid
  const baselineGrid = 8;
  const gridFit = (lh: number) => {
    const steps = Math.round(lh / baselineGrid);
    const closest = steps * baselineGrid;
    return { steps, closest, fits: Math.abs(closest - lh) < 0.5 };
  };

  const tabs: { id: Tab; label: string; icon: typeof Ruler }[] = [
    { id: "calculator", label: "Calculator", icon: Ruler },
    { id: "css", label: "CSS Output", icon: Code },
    { id: "reverse", label: "Reverse", icon: RefreshCw },
    { id: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== CALCULATOR TAB ===== */}
      {activeTab === "calculator" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-lg font-bold block">Font Size</label>
            <div className="flex gap-3 items-center max-w-xs">
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="text-2xl h-14 font-bold"
                min="1"
              />
              <span className="text-xl text-muted-foreground">px</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ratios.slice(0, 4).map((r) => {
              const lh = size * r.ratio;
              const out = formatOutput(lh);
              const id = `sum-${r.name.toLowerCase()}`;
              const isRec = r.ratio === 1.5;
              return (
                <div key={r.name} className={`p-4 rounded-xl border ${isRec ? "border-primary bg-primary/5" : "bg-card"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.ratio}×</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{out.px}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {out.unitless} / {out.rem} / {out.percent}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 px-2" onClick={() => copyValue(out.px, id)}>
                    {copied === id ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
                    Copy
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Custom Ratio */}
          <div className="space-y-3">
            <h3 className="font-bold">Custom Ratio</h3>
            <div className="flex gap-3 items-start">
              <div className="flex-1 max-w-40">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={customRatio}
                    onChange={(e) => setCustomRatio(e.target.value)}
                    placeholder="e.g. 1.75"
                    step="0.025"
                    min="1"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                </div>
              </div>
              {customRatio && !isNaN(cr) && (
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-2xl font-bold">{(size * cr).toFixed(1)}px</span>
                  <span className="text-sm text-muted-foreground">
                    {toUnitless(size * cr).toFixed(3)} / {toRem(size * cr).toFixed(3)}rem / {toPercent(size * cr).toFixed(1)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyValue(`${(size * cr).toFixed(1)}px`, "custom")}
                  >
                    {copied === "custom" ? <><Check className="size-3 mr-1" /> Copied</> : <><Copy className="size-3 mr-1" /> Copy</>}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* All Ratios Table */}
          <div className="space-y-3">
            <h3 className="font-bold">All Ratios</h3>
            <div className="space-y-2">
              {ratios.map((r) => {
                const lh = size * r.ratio;
                const out = formatOutput(lh);
                const id = r.name.toLowerCase();
                const grid = gridFit(lh);
                return (
                  <div key={r.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.ratio}×</span>
                        {r.ratio === 1.5 && <span className="text-xs text-green-600 dark:text-green-400">Recommended</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.use}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {out.px} · {out.unitless} · {out.rem} · {out.percent}
                        {grid.fits && <span className="text-green-600 dark:text-green-400 ml-2">✓ {baselineGrid}px grid</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyValue(out.px, id)}>
                      {copied === id ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Base font size for rem */}
          <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <span>Base font size for rem:</span>
              <Input
                type="number"
                value={baseFontSize}
                onChange={(e) => setBaseFontSize(e.target.value)}
                className="w-16 h-7 text-xs"
                min="1"
              />
              <span>px</span>
            </label>
          </div>
        </div>
      )}

      {/* ===== CSS OUTPUT TAB ===== */}
      {activeTab === "css" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Copy-ready CSS for each ratio value.</p>
          <div className="space-y-4">
            {ratios.map((r) => {
              const lh = size * r.ratio;
              const out = formatOutput(lh);
              const css = `.text-${r.name.toLowerCase()} {\n  font-size: ${size}px;\n  line-height: ${out.px};      /* ${r.ratio}× */\n  line-height: ${out.unitless};  /* unitless */\n  line-height: ${out.rem};    /* rem */\n  line-height: ${out.percent};   /* percentage */\n}`;
              const id = `css-${r.name.toLowerCase()}`;
              return (
                <div key={r.name} className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
                    <span className="font-medium text-sm">{r.name} — {r.ratio}×</span>
                    <Button variant="ghost" size="sm" onClick={() => copyValue(css, id)}>
                      {copied === id ? <><Check className="size-3 mr-1" /> Copied</> : <><Copy className="size-3 mr-1" /> Copy CSS</>}
                    </Button>
                  </div>
                  <pre className="p-4 text-sm font-mono overflow-x-auto">{css}</pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== REVERSE TAB ===== */}
      {activeTab === "reverse" && (
        <div className="space-y-6 max-w-lg">
          <p className="text-sm text-muted-foreground">Given a target line-height in px and a ratio, find the required font size.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Line Height (px)</label>
              <Input
                type="number"
                value={reverseTarget}
                onChange={(e) => setReverseTarget(e.target.value)}
                placeholder="e.g. 24"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ratio</label>
              <Input
                type="number"
                value={reverseRatio}
                onChange={(e) => setReverseRatio(e.target.value)}
                placeholder="e.g. 1.5"
                step="0.025"
                min="1"
              />
            </div>
          </div>
          {reverseSize !== null && reverseSize > 0 && (
            <div className="p-6 rounded-xl border-2 border-primary bg-primary/5">
              <div className="text-sm text-muted-foreground mb-1">Required Font Size</div>
              <div className="text-4xl font-bold">{reverseSize.toFixed(1)}px</div>
              <div className="text-sm text-muted-foreground mt-2">
                For {reverseTarget}px line-height at {reverseRatio}× ratio
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => copyValue(`${reverseSize.toFixed(1)}px`, "reverse")}
              >
                {copied === "reverse" ? <><Check className="size-4 mr-2" /> Copied!</> : <><Copy className="size-4 mr-2" /> Copy</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ===== PREVIEW TAB ===== */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap">Container Width</label>
            <Input
              type="number"
              value={previewWidth}
              onChange={(e) => setPreviewWidth(e.target.value)}
              className="w-20"
              min="100"
            />
            <span className="text-sm text-muted-foreground">px</span>
          </div>

          <div className="space-y-6">
            {[1.2, 1.4, 1.5, 1.625, 2].map((ratio) => {
              const lh = size * ratio;
              return (
                <div key={ratio} style={{ maxWidth: `${previewWidth || 400}px` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{ratio}× — {lh.toFixed(1)}px</span>
                    <span className="text-xs text-muted-foreground">
                      {toUnitless(lh).toFixed(3)} / {toRem(lh).toFixed(3)}rem
                    </span>
                  </div>
                  <div
                    className="p-3 rounded-lg border bg-card"
                    style={{ fontSize: `${Math.min(size, 24)}px`, lineHeight: ratio }}
                  >
                    {LOREM} {LOREM}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Accessibility note */}
          <div className="p-4 rounded-lg border bg-muted/30 text-sm text-muted-foreground space-y-1">
            <p><strong className="text-foreground">WCAG Accessibility:</strong></p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>WCAG 2.1 SC 1.4.12 recommends line-height <strong>at least 1.5×</strong> for body text</li>
              <li>Line spacing to at least <strong>0.5×</strong> the font size in paragraph spacing</li>
              <li>Larger line heights (1.625–2×) improve readability for users with dyslexia or low vision</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
