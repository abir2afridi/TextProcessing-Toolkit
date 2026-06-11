import { useState, useCallback, useRef } from "react";
import { Upload, Download, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFilePaste } from "@/hooks/use-file-paste";

interface ClipResult {
  originalWidth: number;
  originalHeight: number;
  clippedWidth: number;
  clippedHeight: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  url: string;
  blob: Blob;
  fileName: string;
}

type OutputFormat = "png" | "jpeg";

function findBoundingBox(
  imageData: ImageData,
  alphaThreshold: number,
): { top: number; right: number; bottom: number; left: number } | null {
  const { width, height, data } = imageData;
  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (top > bottom || left > right) return null;

  return { top, right: width - 1 - right, bottom: height - 1 - bottom, left };
}

export default function ImageClipper() {
  const [results, setResults] = useState<ClipResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [alphaThreshold, setAlphaThreshold] = useState(0);
  const [expandPx, setExpandPx] = useState(0);
  const [fillBg, setFillBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [jpegQuality, setJpegQuality] = useState(92);
  const [minSize, setMinSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const sourceRef = useRef<{ img: HTMLImageElement; file: File }[]>([]);

  const clip = useCallback(
    (index?: number) => {
      const src = index !== undefined ? sourceRef.current[index] : sourceRef.current[activeIndex];
      if (!src) return;
      const { img } = src;
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const bounds = findBoundingBox(imageData, alphaThreshold);

      if (!bounds) {
        setError("No opaque pixels found at this threshold — nothing to clip.");
        return;
      }

      const left = bounds.left - expandPx;
      const top = bounds.top - expandPx;
      const right = bounds.right - expandPx;
      const bottom = bounds.bottom - expandPx;

      const clippedWidth = w - left - right;
      const clippedHeight = h - top - bottom;

      if (clippedWidth <= 0 || clippedHeight <= 0) {
        setError("Expand contraction is too large — no pixels remain.");
        return;
      }

      const sx = left < 0 ? 0 : left;
      const sy = top < 0 ? 0 : top;
      const drawW = Math.min(clippedWidth, w - sx);
      const drawH = Math.min(clippedHeight, h - sy);

      let finalW = drawW;
      let finalH = drawH;

      if (minSize > 0) {
        finalW = Math.max(drawW, minSize);
        finalH = Math.max(drawH, minSize);
      }

      const outCanvas = document.createElement("canvas");
      outCanvas.width = finalW;
      outCanvas.height = finalH;
      const outCtx = outCanvas.getContext("2d")!;

      if (fillBg || outputFormat === "jpeg") {
        outCtx.fillStyle = fillBg ? bgColor : "#ffffff";
        outCtx.fillRect(0, 0, finalW, finalH);
      }

      const offsetX = finalW > drawW ? Math.floor((finalW - drawW) / 2) : 0;
      const offsetY = finalH > drawH ? Math.floor((finalH - drawH) / 2) : 0;

      outCtx.drawImage(canvas, sx, sy, drawW, drawH, offsetX, offsetY, drawW, drawH);

      const mimeType = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
      const quality = outputFormat === "jpeg" ? jpegQuality / 100 : undefined;

      outCanvas.toBlob(
        (blob) => {
          if (!mountedRef.current) return;
          if (!blob) {
            setError("Failed to encode clipped image.");
            return;
          }

          const ext = outputFormat === "jpeg" ? "jpg" : "png";
          const newResult: ClipResult = {
            originalWidth: w,
            originalHeight: h,
            clippedWidth: finalW,
            clippedHeight: finalH,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            left: bounds.left,
            url: URL.createObjectURL(blob),
            blob,
            fileName: src.file.name.replace(/\.(png|jpg|jpeg)$/i, `-clipped.${ext}`),
          };

          if (index !== undefined) {
            setResults((prev) => {
              const next = [...prev];
              if (next[index]) URL.revokeObjectURL(next[index].url);
              next[index] = newResult;
              return next;
            });
          } else {
            setResults((prev) => {
              if (prev[activeIndex]) URL.revokeObjectURL(prev[activeIndex].url);
              const next = [...prev];
              next[activeIndex] = newResult;
              return next;
            });
          }

          setError(null);
        },
        mimeType,
        quality,
      );
    },
    [alphaThreshold, expandPx, fillBg, bgColor, outputFormat, jpegQuality, minSize, activeIndex],
  );

  const processFile = useCallback(
    (file: File, batch?: boolean) => {
      if (!mountedRef.current) return;
      if (file.type !== "image/png") {
        setError("Only PNG files are supported.");
        return;
      }

      setError(null);
      setProcessing(true);

      const fileUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (!mountedRef.current) {
          URL.revokeObjectURL(fileUrl);
          return;
        }
        const idx = batch
          ? sourceRef.current.length
          : sourceRef.current.length > 0
            ? sourceRef.current.length - 1
            : 0;
        if (batch) {
          sourceRef.current.push({ img, file });
        } else {
          sourceRef.current = [{ img, file }];
        }
        URL.revokeObjectURL(fileUrl);
        setProcessing(false);
        if (!batch) setActiveIndex(0);
        clip(idx);
      };
      img.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        if (!mountedRef.current) return;
        setError("Failed to load image.");
        setProcessing(false);
      };
      img.src = fileUrl;
    },
    [clip],
  );

  const processImage = useCallback((file: File) => processFile(file, false), [processFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "image/png");
      if (files.length === 0) {
        setError("Only PNG files are supported.");
        return;
      }
      if (files.length === 1) {
        processImage(files[0]);
      } else {
        files.forEach((f) => processFile(f, true));
      }
    },
    [processImage, processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage],
  );

  useFilePaste(processImage, "image/png");

  const handleDownload = useCallback(() => {
    const r = results[activeIndex];
    if (!r) return;
    const a = document.createElement("a");
    a.href = r.url;
    a.download = r.fileName;
    a.click();
  }, [results, activeIndex]);

  const downloadAll = useCallback(() => {
    results.forEach((r, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = r.url;
        a.download = r.fileName;
        a.click();
      }, i * 200);
    });
  }, [results]);

  const reset = useCallback(() => {
    sourceRef.current.forEach((s) => s.img.remove());
    sourceRef.current = [];
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setActiveIndex(0);
    setError(null);
    setAlphaThreshold(0);
    setExpandPx(0);
    setFillBg(false);
    setBgColor("#ffffff");
    setOutputFormat("png");
    setJpegQuality(92);
    setMinSize(0);
    if (inputRef.current) inputRef.current.value = "";
  }, [results]);

  const activeResult = results[activeIndex];

  return (
    <div className="space-y-4">
      {results.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center transition-colors hover:border-muted-foreground/50 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Drop PNGs here or click to upload</p>
            <p className="text-sm text-muted-foreground">
              single or batch — or paste from clipboard
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {processing && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Scissors className="h-4 w-4 animate-pulse" />
          <span>Loading image…</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {results.length > 0 && !processing && (
        <>
          {results.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveIndex(i);
                    clip(i);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                    i === activeIndex
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:border-primary/50"
                  }`}
                >
                  {r.fileName.replace(/-clipped\.\w+$/, "") || `#${i + 1}`}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Alpha Threshold</label>
                <span className="text-sm text-muted-foreground font-mono">{alphaThreshold}</span>
              </div>
              <Slider
                value={[alphaThreshold]}
                onValueChange={([v]) => {
                  setAlphaThreshold(v);
                  clip();
                }}
                min={0}
                max={255}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {alphaThreshold === 0
                  ? "Trim only fully transparent pixels (alpha = 0)"
                  : `Treat pixels with alpha ≤ ${alphaThreshold} as transparent`}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Expand Bounds</label>
                <span className="text-sm text-muted-foreground font-mono">
                  {expandPx > 0 ? `+${expandPx}` : expandPx}px
                </span>
              </div>
              <Slider
                value={[expandPx]}
                onValueChange={([v]) => {
                  setExpandPx(v);
                  clip();
                }}
                min={-50}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {expandPx === 0
                  ? "Clip exactly to content bounds"
                  : expandPx > 0
                    ? `Expand by ${expandPx}px outward`
                    : `Contract by ${Math.abs(expandPx)}px inward`}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="font-bold">Fill Background</label>
                <button
                  type="button"
                  onClick={() => {
                    setFillBg(!fillBg);
                    clip();
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${fillBg ? "bg-primary" : "bg-border"}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${fillBg ? "translate-x-4.5" : "translate-x-0.75"}`}
                  />
                </button>
                {fillBg && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      clip();
                    }}
                    className="size-7 cursor-pointer rounded border"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {fillBg ? `Replace transparency with #${bgColor.slice(1)}` : "Keep transparency"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Output Format</label>
              </div>
              <Select
                value={outputFormat}
                onValueChange={(v) => {
                  setOutputFormat(v as OutputFormat);
                  clip();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (lossless, alpha)</SelectItem>
                  <SelectItem value="jpeg">JPEG (smaller file)</SelectItem>
                </SelectContent>
              </Select>
              {outputFormat === "jpeg" && (
                <div className="flex items-center gap-2">
                  <Slider
                    value={[jpegQuality]}
                    onValueChange={([v]) => {
                      setJpegQuality(v);
                      clip();
                    }}
                    min={1}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground font-mono w-8 text-right">
                    {jpegQuality}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {outputFormat === "png"
                  ? "Preserves transparency"
                  : `JPEG quality: ${jpegQuality}%`}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Minimum Size</label>
                <span className="text-sm text-muted-foreground font-mono">
                  {minSize > 0 ? `${minSize}px` : "Off"}
                </span>
              </div>
              <Slider
                value={[minSize]}
                onValueChange={([v]) => {
                  setMinSize(v);
                  clip();
                }}
                min={0}
                max={512}
                step={8}
              />
              <p className="text-xs text-muted-foreground">
                {minSize === 0
                  ? "No minimum — clip exactly to content"
                  : `Pad output to at least ${minSize}×${minSize}px (centred)`}
              </p>
            </div>
          </div>

          {activeResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {activeResult.originalWidth} × {activeResult.originalHeight}
                    {" → "}
                    {activeResult.clippedWidth} × {activeResult.clippedHeight}
                  </p>
                  {alphaThreshold === 0 &&
                  expandPx === 0 &&
                  activeResult.top === 0 &&
                  activeResult.right === 0 &&
                  activeResult.bottom === 0 &&
                  activeResult.left === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No transparent edges found — image is already minimal
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Trimmed {activeResult.top}px top, {activeResult.right}px right,{" "}
                      {activeResult.bottom}px bottom, {activeResult.left}px left
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={reset}>
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                  {results.length > 1 && (
                    <Button size="sm" variant="outline" onClick={downloadAll}>
                      <Download className="mr-1 h-3 w-3" />
                      All
                    </Button>
                  )}
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>

              <div
                className={`flex items-center justify-center rounded-lg border p-4 ${
                  fillBg || outputFormat === "jpeg"
                    ? ""
                    : "bg-[repeating-conic-gradient(oklch(0.9_0_0)_0%_25%,transparent_0%_50%)] bg-size-[16px_16px] dark:bg-[repeating-conic-gradient(oklch(0.3_0_0)_0%_25%,transparent_0%_50%)]"
                }`}
                style={
                  fillBg || outputFormat === "jpeg"
                    ? { backgroundColor: fillBg ? bgColor : "#ffffff" }
                    : undefined
                }
              >
                <img
                  src={activeResult.url}
                  alt="Clipped result"
                  className="max-h-96 max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
