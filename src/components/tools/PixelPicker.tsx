import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Upload,
  Pipette,
  Copy,
  Check,
  Trash2,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  X,
  Download,
  Info,
  Lock,
  Unlock,
  Palette,
  Save,
  Shuffle,
  Shuffle as HarmonyIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFilePaste } from "@/hooks/use-file-paste";
import { getColourName } from "@/lib/colour-names";

function toHex(c: number): string {
  return c.toString(16).padStart(2, "0");
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
    case g: h = ((b - r) / d + 2) * 60; break;
    case b: h = ((r - g) / d + 4) * 60; break;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [Math.round(h), Math.round(s * 100), Math.round(v * 100)];
}

function hexFromRgb(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

interface PickedColor {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  name: string;
}

interface HarmonyColor {
  label: string;
  hex: string;
}

function computeHarmonies(hex: string): HarmonyColor[] {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const clamp = (val: number) => ((val % 360) + 360) % 360;
  const make = (deg: number, label: string): HarmonyColor => {
    const [hr, hg, hb] = hslToRgb(clamp(h + deg), s, l);
    return { label, hex: hexFromRgb(hr, hg, hb) };
  };
  return [
    make(0, "Base"),
    make(180, "Complementary"),
    make(30, "Analogous +30"),
    make(-30, "Analogous -30"),
    make(120, "Triadic +120"),
    make(-120, "Triadic -120"),
  ];
}

const MAGNIFIER_RADIUS = 64;
const ZOOM_OPTIONS = [2, 4, 6, 8, 10, 12, 14, 16] as const;
const STORAGE_KEY = "pixel-picker-history";

export default function PixelPicker() {
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<PickedColor | null>(null);
  const [colorHistory, setColorHistory] = useState<PickedColor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverColor, setHoverColor] = useState<PickedColor | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState<number>(8);
  const [showGrid, setShowGrid] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [showHarmonies, setShowHarmonies] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const keyboardRef = useRef<{ x: number; y: number } | null>(null);
  const lockedPosRef = useRef<{ x: number; y: number } | null>(null);
  const lockedColorRef = useRef<PickedColor | null>(null);
  const lockedImgPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(colorHistory)); }
    catch { /* quota exceeded */ }
  }, [colorHistory]);

  useEffect(() => {
    return () => { if (image) URL.revokeObjectURL(image); };
  }, [image]);

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (image) URL.revokeObjectURL(image);
      setImage(dataUrl);
      setPickedColor(null);
      setHoverPos(null);
      setHoverColor(null);
      setMagnifierPos(null);
      setImageLoaded(false);
      setImageDimensions(null);
      setIsLocked(false);
      keyboardRef.current = null;
      lockedPosRef.current = null;
      lockedColorRef.current = null;
      lockedImgPosRef.current = null;
    };
    reader.readAsDataURL(file);
  }, [image]);

  useFilePaste(readFile, "image/*");

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = "";
  }, [readFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, [readFile]);

  const getRenderBounds = useCallback(() => {
    const img = imageRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!img || !rect) return null;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const conRatio = rect.width / rect.height;
    let renderW: number, renderH: number, offsetX: number, offsetY: number;
    if (imgRatio > conRatio) {
      renderW = rect.width;
      renderH = rect.width / imgRatio;
      offsetX = 0;
      offsetY = (rect.height - renderH) / 2;
    } else {
      renderH = rect.height;
      renderW = rect.height * imgRatio;
      offsetX = (rect.width - renderW) / 2;
      offsetY = 0;
    }
    return { renderW, renderH, offsetX, offsetY, rect };
  }, []);

  const getImageCoords = useCallback((clientX: number, clientY: number) => {
    const img = imageRef.current;
    const bounds = getRenderBounds();
    if (!img || !bounds) return null;
    const { renderW, renderH, offsetX, offsetY, rect } = bounds;
    const x = Math.round(((clientX - rect.left - offsetX) / renderW) * img.naturalWidth);
    const y = Math.round(((clientY - rect.top - offsetY) / renderH) * img.naturalHeight);
    if (x < 0 || y < 0 || x >= img.naturalWidth || y >= img.naturalHeight) return null;
    return { x, y };
  }, [getRenderBounds]);

  const samplePixel = useCallback((imgData: ImageData, x: number, y: number): PickedColor | null => {
    const idx = (y * imgData.width + x) * 4;
    if (idx < 0 || idx + 3 >= imgData.data.length) return null;
    const r = imgData.data[idx];
    const g = imgData.data[idx + 1];
    const b = imgData.data[idx + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    const [hv, sv, vv] = rgbToHsv(r, g, b);
    const hex = hexFromRgb(r, g, b);
    return { hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${h}, ${s}%, ${l}%)`, hsv: `hsv(${hv}, ${sv}%, ${vv}%)`, name: getColourName(hex) };
  }, []);

  const getImageData = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return null;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const pickAt = useCallback((imgX: number, imgY: number, fromLock = false) => {
    const img = imageRef.current;
    const bounds = getRenderBounds();
    if (!img || !bounds) return;
    const clampedX = Math.max(0, Math.min(img.naturalWidth - 1, imgX));
    const clampedY = Math.max(0, Math.min(img.naturalHeight - 1, imgY));
    if (!fromLock) setHoverPos({ x: clampedX, y: clampedY });
    const imgData = getImageData();
    if (imgData) {
      const color = samplePixel(imgData, clampedX, clampedY);
      if (!fromLock) setHoverColor(color);
    }
    const { renderW, renderH, offsetX, offsetY, rect } = bounds;
    let mx = (clampedX / img.naturalWidth) * renderW + offsetX;
    let my = (clampedY / img.naturalHeight) * renderH + offsetY;
    const half = MAGNIFIER_RADIUS;
    mx = Math.max(half, Math.min(rect.width - half, mx));
    my = Math.max(half, Math.min(rect.height - half, my));
    if (!fromLock) setMagnifierPos({ x: mx, y: my });
    keyboardRef.current = { x: clampedX, y: clampedY };
  }, [getImageData, samplePixel, getRenderBounds]);

  const toggleLock = useCallback(() => {
    if (!isLocked) {
      if (!hoverPos || !hoverColor || !magnifierPos) return;
      lockedPosRef.current = magnifierPos;
      lockedColorRef.current = hoverColor;
      lockedImgPosRef.current = hoverPos;
      setIsLocked(true);
    } else {
      setIsLocked(false);
      lockedPosRef.current = null;
      lockedColorRef.current = null;
      lockedImgPosRef.current = null;
      if (hoverPos && keyboardRef.current) {
        pickAt(keyboardRef.current.x, keyboardRef.current.y);
      }
    }
  }, [isLocked, hoverPos, hoverColor, magnifierPos, pickAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    const coords = getImageCoords(e.clientX, e.clientY);
    if (!coords) {
      setHoverPos(null);
      setHoverColor(null);
      setMagnifierPos(null);
      return;
    }
    pickAt(coords.x, coords.y);
  }, [getImageCoords, pickAt, isLocked]);

  const handleClick = useCallback(() => {
    const color = isLocked ? lockedColorRef.current : hoverColor;
    if (!color) return;
    setPickedColor(color);
    setColorHistory((prev) => {
      const next = [color, ...prev];
      return next.slice(0, 20);
    });
  }, [isLocked, hoverColor]);

  const handleMouseLeave = useCallback(() => {
    if (isLocked) return;
    setHoverPos(null);
    setHoverColor(null);
    setMagnifierPos(null);
  }, [isLocked]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!imageLoaded) return;
    if (e.key === "l" || e.key === "L") { toggleLock(); return; }
    if (e.key === "c" || e.key === "C") { setShowCrosshair((p) => !p); return; }
    const cur = keyboardRef.current ?? { x: 0, y: 0 };
    let dx = 0, dy = 0;
    switch (e.key) {
      case "ArrowUp": dy = -1; break;
      case "ArrowDown": dy = 1; break;
      case "ArrowLeft": dx = -1; break;
      case "ArrowRight": dx = 1; break;
      case "Enter": {
        const color = isLocked ? lockedColorRef.current : hoverColor;
        if (color) { setPickedColor(color); setColorHistory((prev) => [color!, ...prev].slice(0, 20)); }
        return;
      }
      default: return;
    }
    e.preventDefault();
    pickAt(cur.x + dx, cur.y + dy);
  }, [imageLoaded, hoverColor, pickAt, toggleLock, isLocked]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const copyText = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const removeHistoryItem = useCallback((index: number) => {
    setColorHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearHistory = useCallback(() => {
    setColorHistory([]);
    setPickedColor(null);
  }, []);

  const clearImage = useCallback(() => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setPickedColor(null);
    setColorHistory([]);
    setHoverPos(null);
    setHoverColor(null);
    setMagnifierPos(null);
    setImageLoaded(false);
    setImageDimensions(null);
    setIsLocked(false);
    keyboardRef.current = null;
    lockedPosRef.current = null;
    lockedColorRef.current = null;
    lockedImgPosRef.current = null;
  }, [image]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    const img = imageRef.current;
    if (img) setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const toggleCrosshair = useCallback(() => setShowCrosshair((p) => !p), []);

  const exportAsCss = useCallback(async () => {
    if (colorHistory.length === 0) return;
    const lines = colorHistory.map((c, i) => `  --color-${i + 1}: ${c.hex};`);
    await navigator.clipboard.writeText(`:root {\n${lines.join("\n")}\n}`);
    setCopied("export-css");
    setTimeout(() => setCopied(null), 1500);
  }, [colorHistory]);

  const exportAsJson = useCallback(async () => {
    if (colorHistory.length === 0) return;
    const json = JSON.stringify(colorHistory.map((c) => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl, name: c.name })), null, 2);
    await navigator.clipboard.writeText(json);
    setCopied("export-json");
    setTimeout(() => setCopied(null), 1500);
  }, [colorHistory]);

  const savePalette = useCallback(() => {
    setSavedStatus("saved");
    setTimeout(() => setSavedStatus(null), 1500);
  }, []);

  useEffect(() => {
    if (!hoverPos && !isLocked) return;
    if (!imageLoaded || !magnifierCanvasRef.current || !imageRef.current) return;
    const displayPos = isLocked && lockedImgPosRef.current ? lockedImgPosRef.current : hoverPos;
    if (!displayPos) return;
    const mc = magnifierCanvasRef.current;
    const ctx = mc.getContext("2d");
    const img = imageRef.current;
    if (!ctx) return;
    const mr = MAGNIFIER_RADIUS;
    const size = (mr * 2) / zoom;
    const sx = Math.max(0, displayPos.x - size / 2);
    const sy = Math.max(0, displayPos.y - size / 2);
    const sw = Math.min(size, img.naturalWidth - sx);
    const sh = Math.min(size, img.naturalHeight - sy);
    mc.width = mr * 2;
    mc.height = mr * 2;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, mc.width, mc.height);
    if (showGrid && zoom >= 4) {
      const pixelSize = (mr * 2) / (sw / zoom) / zoom;
      const gridOffsetX = ((sx - Math.floor(sx)) / zoom) * pixelSize;
      const gridOffsetY = ((sy - Math.floor(sy)) / zoom) * pixelSize;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 0.5;
      for (let gx = gridOffsetX; gx <= mr * 2; gx += pixelSize) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, mr * 2); ctx.stroke(); }
      for (let gy = gridOffsetY; gy <= mr * 2; gy += pixelSize) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(mr * 2, gy); ctx.stroke(); }
    }
    const displayColor = isLocked && lockedColorRef.current ? lockedColorRef.current : hoverColor;
    ctx.strokeStyle = displayColor?.hex ?? "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(mr - zoom / 2 - 1, mr - zoom / 2 - 1, zoom + 2, zoom + 2);
  }, [hoverPos, isLocked, imageLoaded, hoverColor, zoom, showGrid]);

  const displayMagnifierPos = isLocked ? lockedPosRef.current : magnifierPos;
  const displayHoverColor = isLocked ? lockedColorRef.current : hoverColor;
  const displayHoverPos = isLocked ? lockedImgPosRef.current : hoverPos;

  const harmonies = useMemo(() => {
    if (!pickedColor || !showHarmonies) return [];
    return computeHarmonies(pickedColor.hex);
  }, [pickedColor, showHarmonies]);

  return (
    <div className="space-y-6">
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("pp-file-input")?.click()}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <input id="pp-file-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Drop an image here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to select a file, or paste</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Pixel Picker</h3>
              {imageDimensions && (
                <span className="text-xs text-muted-foreground font-mono">
                  <Info className="size-3 inline mr-0.5 align-text-bottom" />
                  {imageDimensions.w} &times; {imageDimensions.h}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => document.getElementById("pp-file-input")?.click()} variant="outline" size="sm">
                <Upload className="size-3 mr-1" /> New Image
              </Button>
              <input id="pp-file-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <Button onClick={clearImage} variant="ghost" size="sm">
                <Trash2 className="size-3 mr-1" /> Clear
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <ZoomOut className="size-4 text-muted-foreground" />
              {ZOOM_OPTIONS.map((z) => (
                <button key={z} onClick={() => setZoom(z)} className={cn("px-2 py-0.5 rounded text-xs font-mono transition-colors", zoom === z ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>{z}x</button>
              ))}
              <ZoomIn className="size-4 text-muted-foreground" />
            </div>
            <button onClick={() => setShowGrid((g) => !g)} className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors", showGrid ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-transparent hover:bg-accent")}>
              <Grid3x3 className="size-3" /> Grid
            </button>
            <button onClick={toggleCrosshair} className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors", showCrosshair ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-transparent hover:bg-accent")}>
              <Crosshair className="size-3" /> Crosshair
            </button>
            <button onClick={toggleLock} disabled={!hoverPos && !isLocked} className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors", isLocked ? "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground border border-transparent hover:bg-accent")}>
              {isLocked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
              {isLocked ? "Locked" : "Lock"}
            </button>
            {pickedColor && (
              <button onClick={() => setShowHarmonies((p) => !p)} className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors", showHarmonies ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-transparent hover:bg-accent")}>
                <HarmonyIcon className="size-3" /> Harmonies
              </button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Arrows &middot; <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">L</kbd> lock &middot; <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">C</kbd> crosshair
            </span>
          </div>

          <div
            ref={containerRef}
            className="relative rounded-xl overflow-hidden bg-muted cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseLeave={handleMouseLeave}
          >
            <canvas ref={canvasRef} className="hidden" />
            <img ref={imageRef} src={image} alt="Pixel picker target" className="max-w-full max-h-[70vh] mx-auto object-contain" onLoad={handleImageLoad} crossOrigin="anonymous" draggable={false} />
            {showCrosshair && displayHoverPos && (() => {
              const bounds = getRenderBounds();
              if (!bounds) return null;
              const { renderW, renderH, offsetX, offsetY, rect } = bounds;
              const cx = (displayHoverPos.x / imageRef.current!.naturalWidth) * renderW + offsetX;
              const cy = (displayHoverPos.y / imageRef.current!.naturalHeight) * renderH + offsetY;
              return (
                <>
                  <div className="absolute pointer-events-none" style={{ left: 0, top: cy, width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.6)", boxShadow: "0 0 4px rgba(0,0,0,0.4)" }} />
                  <div className="absolute pointer-events-none" style={{ left: cx, top: 0, width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.6)", boxShadow: "0 0 4px rgba(0,0,0,0.4)" }} />
                </>
              );
            })()}
            {isLocked && lockedPosRef.current && (
              <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: "100%", height: "100%" }}>
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100/90 text-amber-700 text-xs font-medium dark:bg-amber-900/80 dark:text-amber-300 shadow-sm">
                  <Lock className="size-3" /> Locked
                </div>
              </div>
            )}
            {displayMagnifierPos && displayHoverColor && (
              <div className="absolute pointer-events-none" style={{ left: displayMagnifierPos.x - MAGNIFIER_RADIUS, top: displayMagnifierPos.y - MAGNIFIER_RADIUS }}>
                <div className="relative rounded-full overflow-hidden border-2 border-border shadow-xl bg-white" style={{ width: MAGNIFIER_RADIUS * 2, height: MAGNIFIER_RADIUS * 2 }}>
                  <canvas ref={magnifierCanvasRef} width={MAGNIFIER_RADIUS * 2} height={MAGNIFIER_RADIUS * 2} className="block" />
                  <div className="absolute inset-0 rounded-full ring-1 ring-white/20" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full border-2 border-white shadow" style={{ backgroundColor: displayHoverColor.hex }} />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-1 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono whitespace-nowrap leading-tight shadow">
                    {displayHoverColor.hex}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm transition-opacity min-h-[52px]", displayHoverPos && displayHoverColor ? "opacity-100" : "opacity-0 pointer-events-none")}>
            {displayHoverPos && displayHoverColor ? (
              <>
                <div className="size-8 rounded-lg border border-border shrink-0" style={{ backgroundColor: displayHoverColor.hex }} />
                <span className="text-muted-foreground"><Crosshair className="size-3 inline mr-1 align-text-bottom" />({displayHoverPos.x}, {displayHoverPos.y})</span>
                <span className="font-mono text-xs">{displayHoverColor.hex}</span>
                <span className="text-xs text-muted-foreground">{displayHoverColor.name}</span>
                {isLocked ? (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400"><Lock className="size-3 inline mr-0.5" /> Click to pick</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Click to pick</span>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">&nbsp;</span>
            )}
          </div>

          {pickedColor && (
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl border-2 border-border shrink-0 shadow-sm" style={{ backgroundColor: pickedColor.hex }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    <Pipette className="size-3 inline mr-1 align-text-bottom" />
                    Picked Color
                    <span className="ml-2 text-xs font-medium text-foreground">{pickedColor.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "HEX", value: pickedColor.hex, key: "hex" },
                      { label: "RGB", value: pickedColor.rgb, key: "rgb" },
                      { label: "HSL", value: pickedColor.hsl, key: "hsl" },
                      { label: "HSV", value: pickedColor.hsv, key: "hsv" },
                    ].map(({ label, value, key }) => (
                      <div key={key} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">{label}</span>
                        <code className="text-xs font-mono">{value}</code>
                        <Button variant="ghost" size="icon" className="size-5 ml-0.5" onClick={() => copyText(value, key)}>
                          {copied === key ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {showHarmonies && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <HarmonyIcon className="size-3" /> Color Harmonies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {harmonies.map((h) => (
                      <div key={h.label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border">
                        <div className="size-5 rounded border border-border/50" style={{ backgroundColor: h.hex }} />
                        <span className="text-[10px] text-muted-foreground">{h.label}</span>
                        <code className="text-[10px] font-mono">{h.hex}</code>
                        <button onClick={() => copyText(h.hex, h.hex)} className="hover:text-foreground transition-colors">
                          {copied === h.hex ? <Check className="size-2.5 text-green-500" /> : <Copy className="size-2.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {colorHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  <Palette className="size-3 inline mr-1 align-text-bottom" />
                  History ({colorHistory.length})
                </h4>
                <div className="flex gap-1">
                  <Button onClick={savePalette} variant="outline" size="sm" className="h-7 text-xs">
                    {savedStatus === "saved" ? <Check className="size-3 mr-1 text-green-500" /> : <Save className="size-3 mr-1" />}
                    {savedStatus === "saved" ? "Saved" : "Save"}
                  </Button>
                  <Button onClick={exportAsCss} variant="outline" size="sm" className="h-7 text-xs">
                    {copied === "export-css" ? <Check className="size-3 mr-1 text-green-500" /> : <Download className="size-3 mr-1" />}
                    CSS
                  </Button>
                  <Button onClick={exportAsJson} variant="outline" size="sm" className="h-7 text-xs">
                    {copied === "export-json" ? <Check className="size-3 mr-1 text-green-500" /> : <Download className="size-3 mr-1" />}
                    JSON
                  </Button>
                  <Button onClick={clearHistory} variant="ghost" size="sm" className="h-7 text-xs"><Trash2 className="size-3 mr-1" /> Clear</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {colorHistory.map((c, i) => (
                  <div key={`${c.hex}-${i}`} className="relative group">
                    <button
                      onClick={() => { setPickedColor(c); navigator.clipboard.writeText(c.hex); setCopied("hex"); setTimeout(() => setCopied(null), 1500); }}
                      className={cn("size-8 rounded-lg border border-border overflow-hidden transition-all hover:scale-110 hover:z-10", pickedColor?.hex === c.hex && "ring-2 ring-primary ring-offset-1")}
                      title={`${c.hex}\n${c.rgb}\n${c.hsl}\n${c.name}`}
                    >
                      <div className="absolute inset-0" style={{ backgroundColor: c.hex }} />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/40 transition-opacity"><Copy className="size-3 text-white" /></div>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeHistoryItem(i); }} className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="size-2.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
