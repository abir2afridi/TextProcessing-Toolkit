import { useState, useCallback, useRef, useEffect } from "react";
import {
  Copy, Check, Plus, Minus, Shuffle, Download,
  Lock, Unlock, Trash2, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getColourName } from "@/lib/colour-names";
import { useBreakpoint, useIsTouchDevice } from "@/hooks/use-breakpoint";
import { generatePalette, getStrategiesByCategory, STRATEGY_CATEGORIES, STRATEGY_INFO, type PaletteStrategy } from "@/lib/palette-strategies";
import { formatColour, COLOUR_NOTATIONS, type ColourNotation } from "@/lib/colour-notation";

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function srgbToLinear(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const c = Math.sqrt(a * a + bVal * bVal);
  let h = Math.atan2(bVal, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return [L, c, h];
}

function getLuminance(r: number, g: number, b: number): number {
  const [lr, lg, lb] = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function getContrastText(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const luminance = getLuminance(...rgb);
  return luminance > 0.4 ? "#000000" : "#ffffff";
}

interface PaletteColour {
  id: string;
  hex: string;
  locked: boolean;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const MIN_COLOURS = 2;
const MAX_COLOURS = 11;
const GRID_THRESHOLD_MOBILE = 4;
const GRID_THRESHOLD_TABLET = 5;

function parseColorsFromParam(param: string | null): string[] | null {
  if (!param) return null;
  const colors = param.split(",").map(c => { const hex = c.trim(); return hex.startsWith("#") ? hex : `#${hex}`; }).filter(c => /^#[a-f\d]{6}$/i.test(c));
  return colors.length >= MIN_COLOURS ? colors : null;
}

export default function PaletteGenny() {
  const [colours, setColours] = useState<PaletteColour[]>(() =>
    generatePalette(5, "random-cohesive").map(hex => ({ id: generateId(), hex, locked: false }))
  );
  const [strategy, setStrategy] = useState<PaletteStrategy>("random-cohesive");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notation, setNotation] = useState<ColourNotation>("hex");
  const hasInitializedFromUrl = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const breakpoint = useBreakpoint();
  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    if (hasInitializedFromUrl.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlColors = parseColorsFromParam(params.get("colors"));
    if (urlColors) {
      setColours(urlColors.map(hex => ({ id: generateId(), hex, locked: false })));
      hasInitializedFromUrl.current = true;
    }
  }, []);

  const shouldUseGrid =
    (breakpoint === "mobile" && colours.length > GRID_THRESHOLD_MOBILE) ||
    (breakpoint === "tablet" && colours.length > GRID_THRESHOLD_TABLET);

  const copyToClipboard = useCallback(async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const regeneratePalette = useCallback(() => {
    setColours(prev => {
      const newHexes = generatePalette(prev.length, strategy);
      return prev.map((colour, i) => colour.locked ? colour : { id: generateId(), hex: newHexes[i], locked: false });
    });
    setSelectedId(null);
  }, [strategy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName);
      if (e.code === "Space" && !isInputFocused) {
        e.preventDefault();
        regeneratePalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [regeneratePalette]);

  useEffect(() => {
    if (!selectedId || !isTouchDevice) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (paletteRef.current && !paletteRef.current.contains(target)) setSelectedId(null);
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);
    return () => { document.removeEventListener("click", handleClickOutside); document.removeEventListener("touchend", handleClickOutside); };
  }, [selectedId, isTouchDevice]);

  const addColour = useCallback(() => {
    if (colours.length >= MAX_COLOURS) return;
    const newHexes = generatePalette(1, strategy);
    setColours(prev => [...prev, { id: generateId(), hex: newHexes[0], locked: false }]);
  }, [colours, strategy]);

  const removeColour = useCallback((id: string) => {
    if (colours.length <= MIN_COLOURS) return;
    setColours(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [colours.length, selectedId]);

  const toggleLock = useCallback((id: string) => {
    setColours(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  }, []);

  const updateColour = useCallback((id: string, hex: string) => {
    setColours(prev => prev.map(c => c.id === id ? { ...c, hex } : c));
  }, []);

  const handleSwatchClick = useCallback((id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-select]")) return;
    if (isTouchDevice) { e.stopPropagation(); setSelectedId(prev => prev === id ? null : id); }
  }, [isTouchDevice]);

  const copyAllHex = useCallback(() => {
    const values = colours.map(c => formatColour(c.hex, notation)).join(", ");
    copyToClipboard(values, "all-hex");
  }, [colours, copyToClipboard, notation]);

  const copyAsCss = useCallback(() => {
    const vars = colours.map((c, i) => `  --palette-${i + 1}: ${formatColour(c.hex, notation)};`).join("\n");
    copyToClipboard(`:root {\n${vars}\n}`, "css");
  }, [colours, copyToClipboard, notation]);

  const copyAsJson = useCallback(() => {
    const json = JSON.stringify(colours.map(c => formatColour(c.hex, notation)), null, 2);
    copyToClipboard(json, "json");
  }, [colours, copyToClipboard, notation]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = 1200, height = 630, padding = 40;
    const swatchHeight = height - padding * 2 - 80;
    const swatchWidth = (width - padding * 2 - (colours.length - 1) * 12) / colours.length;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height);
    colours.forEach((colour, i) => {
      const x = padding + i * (swatchWidth + 12);
      ctx.fillStyle = colour.hex; ctx.beginPath(); ctx.roundRect(x, padding, swatchWidth, swatchHeight, 16); ctx.fill();
      ctx.fillStyle = "#1a1a1a"; ctx.font = "bold 20px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(colour.hex.toUpperCase(), x + swatchWidth / 2, height - padding - 20);
    });
    ctx.fillStyle = "#999999"; ctx.font = "16px system-ui, sans-serif"; ctx.textAlign = "right";
    ctx.fillText("tpt.pages.dev", width - padding, height - padding + 5);
    const link = document.createElement("a"); link.download = "palette.png"; link.href = canvas.toDataURL("image/png"); link.click();
  }, [colours]);

  const groupedStrategies = getStrategiesByCategory();

  return (
    <div className="space-y-6">
      {/* Notation selector */}
      <div className="flex items-center gap-2">
        <Palette className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Notation:</span>
        <Select value={notation} onValueChange={(v) => setNotation(v as ColourNotation)}>
          <SelectTrigger className="h-8 w-32 rounded-lg text-xs font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLOUR_NOTATIONS.map(n => (
              <SelectItem key={n.id} value={n.id} className="font-mono text-xs">{n.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Palette Display */}
      <div
        ref={paletteRef}
        className={cn("relative rounded-2xl overflow-hidden shadow-xl shadow-black/10 border border-border/50 transition-all duration-300 ease-out")}
        style={{ minHeight: shouldUseGrid ? "auto" : "320px" }}
      >
        <div
          className={cn("transition-all duration-300 ease-out", shouldUseGrid ? "grid gap-1 p-1" : "flex h-80")}
          style={shouldUseGrid ? { gridTemplateColumns: breakpoint === "mobile" ? "repeat(2, 1fr)" : "repeat(3, 1fr)" } : undefined}
        >
          {colours.map((colour) => {
            const isSelected = selectedId === colour.id;
            const showControls = isSelected || !isTouchDevice;
            return (
              <div
                key={colour.id}
                data-swatch
                onClick={(e) => handleSwatchClick(colour.id, e)}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 ease-out",
                  shouldUseGrid ? "aspect-square rounded-xl" : "flex-1",
                  !shouldUseGrid && isSelected && "flex-[1.5]",
                  !shouldUseGrid && !isTouchDevice && "group hover:flex-[1.5]",
                  shouldUseGrid && isSelected && "ring-4 ring-white/60 scale-[1.03] z-10 shadow-2xl",
                )}
                style={{ backgroundColor: colour.hex }}
              >
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200",
                    showControls ? "opacity-100" : "opacity-0",
                    !isTouchDevice && "group-hover:opacity-100"
                  )}
                >
                  <div className="absolute top-3 left-3 right-3 flex justify-between">
                    {colours.length > MIN_COLOURS ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeColour(colour.id); }}
                        className="p-2 rounded-full transition-all bg-black/20 hover:bg-red-500/80 hover:scale-110 active:scale-95"
                        style={{ color: getContrastText(colour.hex) }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : <div />}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLock(colour.id); }}
                      className={cn(
                        "p-2 rounded-full transition-all hover:scale-110 active:scale-95",
                        colour.locked ? "bg-white/90 text-black shadow-lg" : "bg-black/20 hover:bg-black/40"
                      )}
                      style={{ color: colour.locked ? "#000" : getContrastText(colour.hex) }}
                    >
                      {colour.locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                    </button>
                  </div>

                  <label data-no-select className="cursor-pointer p-3 rounded-full transition-all bg-white/20 hover:bg-white/40 backdrop-blur-sm hover:scale-110 active:scale-95">
                    <input type="color" value={colour.hex} onChange={(e) => updateColour(colour.id, e.target.value)} className="sr-only" />
                    <div className="size-8 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: colour.hex }} />
                  </label>

                  <button
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(formatColour(colour.hex, notation), colour.id); }}
                    className="mt-3 px-4 py-2 rounded-full transition-all bg-white/20 hover:bg-white/40 backdrop-blur-sm font-mono text-sm font-semibold tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 drop-shadow-sm"
                    style={{ color: getContrastText(colour.hex) }}
                  >
                    {copied === colour.id ? <><Check className="size-4" /> Copied!</> : <><Copy className="size-4" /> {formatColour(colour.hex, notation)}</>}
                  </button>
                </div>

                {colour.locked && !showControls && (
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-lg animate-in fade-in zoom-in duration-200">
                    <Lock className="size-4 text-black" />
                  </div>
                )}

                {!showControls && (
                  <div className="absolute bottom-3 left-0 right-0 text-center font-mono text-sm font-semibold tracking-wider opacity-70 drop-shadow-sm"
                    style={{ color: getContrastText(colour.hex) }}>
                    {formatColour(colour.hex, notation)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={regeneratePalette} className="gap-2 transition-transform hover:scale-105 active:scale-95" size="lg">
          <Shuffle className="size-4" /> Generate
        </Button>

        <Select value={strategy} onValueChange={(v) => setStrategy(v as PaletteStrategy)}>
          <SelectTrigger className="h-11 rounded-xl border-2 font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STRATEGY_CATEGORIES).map(([category, label]) => (
              <SelectGroup key={category}>
                <SelectLabel>{label}</SelectLabel>
                {groupedStrategies[category as keyof typeof groupedStrategies]?.map(({ key, info }) => (
                  <SelectItem key={key} value={key}>{info.name}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <Button variant="outline" size="icon" onClick={() => removeColour(colours[colours.length - 1].id)} disabled={colours.length <= MIN_COLOURS}
            className="transition-transform hover:scale-105 active:scale-95">
            <Minus className="size-4" />
          </Button>
          <span className="px-3 font-mono text-sm font-bold min-w-[3ch] text-center">{colours.length}</span>
          <Button variant="outline" size="icon" onClick={addColour} disabled={colours.length >= MAX_COLOURS}
            className="transition-transform hover:scale-105 active:scale-95">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Strategy description */}
      <div className="p-4 rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{STRATEGY_INFO[strategy].name}:</span>{" "}
        {STRATEGY_INFO[strategy].description}
      </div>

      {/* Export Options */}
      <div className="space-y-3">
        <label className="font-bold">Export</label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={copyAllHex} className="gap-2 transition-transform hover:scale-105 active:scale-95">
            {copied === "all-hex" ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy Colours
          </Button>
          <Button variant="outline" onClick={copyAsCss} className="gap-2 transition-transform hover:scale-105 active:scale-95">
            {copied === "css" ? <Check className="size-4" /> : <Copy className="size-4" />}
            CSS Variables
          </Button>
          <Button variant="outline" onClick={copyAsJson} className="gap-2 transition-transform hover:scale-105 active:scale-95">
            {copied === "json" ? <Check className="size-4" /> : <Copy className="size-4" />}
            JSON
          </Button>
          <Button variant="outline" onClick={downloadImage} className="gap-2 transition-transform hover:scale-105 active:scale-95">
            <Download className="size-4" /> Download Image
          </Button>
        </div>
      </div>

      {/* Colour List */}
      <div className="space-y-3">
        <label className="font-bold">Colours</label>
        <div className="grid gap-2">
          {colours.map((colour) => {
            const rgb = hexToRgb(colour.hex);
            const oklch = rgb ? rgbToOklch(...rgb) : null;
            const colourName = getColourName(colour.hex);
            return (
              <div key={colour.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group"
              >
                <label className="cursor-pointer">
                  <input type="color" value={colour.hex} onChange={(e) => updateColour(colour.id, e.target.value)} className="sr-only" />
                  <div className="size-14 rounded-lg border border-black/10 shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: colour.hex }} />
                </label>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg tracking-wide">{formatColour(colour.hex, notation)}</span>
                    <span className="text-sm text-muted-foreground capitalize">{colourName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {rgb && <span>RGB {rgb.join(" ")}</span>}
                    {oklch && <><span className="mx-2 opacity-50">|</span><span>L{(oklch[0] * 100).toFixed(0)} C{oklch[1].toFixed(2)} H{oklch[2].toFixed(0)}</span></>}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleLock(colour.id)}
                    className={cn("transition-transform hover:scale-110 active:scale-95", colour.locked && "text-primary")}
                    title={colour.locked ? "Unlock colour" : "Lock colour"}>
                    {colour.locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(formatColour(colour.hex, notation), `list-${colour.id}`)}
                    title="Copy colour" className="transition-transform hover:scale-110 active:scale-95">
                    {copied === `list-${colour.id}` ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                  {colours.length > MIN_COLOURS && (
                    <Button variant="ghost" size="icon" onClick={() => removeColour(colour.id)}
                      className="text-muted-foreground hover:text-destructive transition-transform hover:scale-110 active:scale-95" title="Remove colour">
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Space</kbd> to generate a new palette
      </div>
    </div>
  );
}
