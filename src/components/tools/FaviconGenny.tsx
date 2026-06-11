import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Download, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useFilePaste } from "@/hooks/use-file-paste";

const DEFAULT_SIZES = [16, 32, 48, 64, 128, 180, 192, 512];
type BgPreview = "transparent" | "light" | "dark";

interface GeneratedFavicon {
  size: number;
  dataUrl: string;
}

export default function FaviconGenny() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [favicons, setFavicons] = useState<GeneratedFavicon[]>([]);
  const [generating, setGenerating] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fillBg, setFillBg] = useState(false);
  const [padding, setPadding] = useState(0);
  const [customSizes, setCustomSizes] = useState<number[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [bgPreview, setBgPreview] = useState<BgPreview>("transparent");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const allSizes = [...DEFAULT_SIZES, ...customSizes];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSourceImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  useFilePaste(readFile, "image/*");

  useEffect(() => {
    if (!sourceImage) return;
    generateFavicons(sourceImage);
  }, [sourceImage, bgColor, fillBg, padding, customSizes]);

  const addCustomSize = () => {
    const num = parseInt(customInput, 10);
    if (isNaN(num) || num < 1 || num > 1024) return;
    if (allSizes.includes(num)) return;
    setCustomSizes((prev) => [...prev, num].sort((a, b) => a - b));
    setCustomInput("");
  };

  const removeCustomSize = (size: number) => {
    setCustomSizes((prev) => prev.filter((s) => s !== size));
  };

  const generateFavicons = (imageDataUrl: string) => {
    setGenerating(true);
    const img = new Image();
    img.onload = () => {
      const generated: GeneratedFavicon[] = [];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const srcSize = Math.min(img.width, img.height);
      const srcX = (img.width - srcSize) / 2;
      const srcY = (img.height - srcSize) / 2;

      for (const size of allSizes) {
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);

        if (fillBg) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
        }

        const padPx = Math.round(size * (padding / 100));
        const drawSize = size - padPx * 2;

        ctx.drawImage(img, srcX, srcY, srcSize, srcSize, padPx, padPx, drawSize, drawSize);

        generated.push({
          size,
          dataUrl: canvas.toDataURL("image/png"),
        });
      }

      setFavicons(generated);
      setGenerating(false);
    };
    img.src = imageDataUrl;
  };

  const downloadFavicon = (favicon: GeneratedFavicon) => {
    const link = document.createElement("a");
    link.download = `favicon-${favicon.size}x${favicon.size}.png`;
    link.href = favicon.dataUrl;
    link.click();
  };

  const downloadAll = () => {
    favicons.forEach((favicon, i) => {
      setTimeout(() => downloadFavicon(favicon), i * 100);
    });
  };

  const downloadAsIco = async () => {
    const icoSizes = [16, 32, 48, 64];
    const icoFavicons = favicons.filter((f) => icoSizes.includes(f.size));

    if (icoFavicons.length === 0) return;

    const pngBuffers: { size: number; data: Uint8Array }[] = [];

    for (const favicon of icoFavicons) {
      const response = await fetch(favicon.dataUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      pngBuffers.push({
        size: favicon.size,
        data: new Uint8Array(arrayBuffer),
      });
    }

    pngBuffers.sort((a, b) => a.size - b.size);

    const numImages = pngBuffers.length;
    const headerSize = 6 + numImages * 16;

    let totalSize = headerSize;
    for (const buf of pngBuffers) {
      totalSize += buf.data.length;
    }

    const icoBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(icoBuffer);
    const bytes = new Uint8Array(icoBuffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, numImages, true);

    let dataOffset = headerSize;

    for (let i = 0; i < pngBuffers.length; i++) {
      const entryOffset = 6 + i * 16;
      const { size, data } = pngBuffers[i];

      view.setUint8(entryOffset + 0, size < 256 ? size : 0);
      view.setUint8(entryOffset + 1, size < 256 ? size : 0);
      view.setUint8(entryOffset + 2, 0);
      view.setUint8(entryOffset + 3, 0);
      view.setUint16(entryOffset + 4, 1, true);
      view.setUint16(entryOffset + 6, 32, true);
      view.setUint32(entryOffset + 8, data.length, true);
      view.setUint32(entryOffset + 12, dataOffset, true);

      bytes.set(data, dataOffset);
      dataOffset += data.length;
    }

    const blob = new Blob([icoBuffer], { type: "image/x-icon" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "favicon.ico";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setSourceImage(null);
    setFileName("");
    setFavicons([]);
    setCustomSizes([]);
    setCustomInput("");
  };

  const getSizeLabel = (size: number) => {
    if (size === 180) return "Apple Touch";
    if (size === 192) return "Android";
    if (size === 512) return "PWA";
    return `${size}×${size}`;
  };

  const previewBgClass =
    bgPreview === "dark"
      ? "bg-gray-900"
      : bgPreview === "light"
        ? "bg-white"
        : "bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-size-[16px_16px]";

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("favicon-input")?.click()}
      >
        <input
          id="favicon-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Drop image here</p>
        <p className="text-sm text-muted-foreground mt-1">
          PNG, JPG, SVG or any image format, or paste
        </p>
      </div>

      {sourceImage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold">Source Image</label>
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="size-4 mr-2" /> Clear
            </Button>
          </div>
          <div className="p-4 rounded-lg border bg-muted/30 flex items-center gap-4">
            <img
              src={sourceImage}
              alt="Source"
              className="size-24 object-contain rounded border bg-white"
            />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{fileName}</p>
              <p className="mt-1">Image will be cropped to square</p>
            </div>
          </div>
        </div>
      )}

      {sourceImage && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="font-bold">Fill Background</label>
              <button
                type="button"
                onClick={() => setFillBg(!fillBg)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${fillBg ? "bg-primary" : "bg-border"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${fillBg ? "translate-x-[18px]" : "translate-x-[3px]"}`}
                />
              </button>
              {fillBg && (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="size-7 cursor-pointer rounded border"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {fillBg
                ? `Solid #${bgColor.slice(1)} background behind the icon`
                : "Transparent background (PNG default)"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold">Padding</label>
              <span className="text-sm text-muted-foreground font-mono">{padding}%</span>
            </div>
            <Slider
              value={[padding]}
              onValueChange={([v]) => setPadding(v)}
              min={0}
              max={40}
              step={1}
            />
            <p className="text-xs text-muted-foreground">Whitespace inside the favicon square</p>
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="font-bold">Custom Sizes</label>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={1024}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSize()}
                placeholder="e.g. 24, 72, 96..."
                className="font-mono max-w-40"
              />
              <Button variant="outline" size="icon" onClick={addCustomSize} disabled={!customInput}>
                <Plus className="size-4" />
              </Button>
            </div>
            {customSizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customSizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-mono"
                  >
                    {s}×{s}
                    <button onClick={() => removeCustomSize(s)} className="hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add extra sizes beyond the standard set (1–1024)
            </p>
          </div>
        </div>
      )}

      {favicons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-bold">Generated Favicons</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 mr-2 border rounded-md p-0.5">
                {(["transparent", "light", "dark"] as BgPreview[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBgPreview(b)}
                    className={`size-6 rounded text-[10px] font-bold ${
                      bgPreview === b ? "ring-1 ring-ring" : ""
                    } ${
                      b === "dark"
                        ? "bg-gray-900 text-white"
                        : b === "light"
                          ? "bg-white text-gray-900 border"
                          : "bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-size-[8px_8px]"
                    }`}
                  />
                ))}
              </div>
              <Button variant="outline" onClick={downloadAsIco}>
                <Download className="size-4 mr-2" /> Download .ico
              </Button>
              <Button onClick={downloadAll}>
                <Download className="size-4 mr-2" /> Download All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favicons.map((favicon) => (
              <button
                key={favicon.size}
                onClick={() => downloadFavicon(favicon)}
                className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
              >
                <div
                  className={`flex items-center justify-center h-20 mb-3 rounded ${previewBgClass}`}
                >
                  <img
                    src={favicon.dataUrl}
                    alt={`${favicon.size}x${favicon.size}`}
                    style={{
                      width: Math.min(favicon.size, 64),
                      height: Math.min(favicon.size, 64),
                    }}
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <div className="font-bold">
                    {favicon.size}×{favicon.size}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getSizeLabel(favicon.size)}
                  </div>
                </div>
                <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to download
                </div>
              </button>
            ))}
          </div>

          {favicons.filter((f) => f.size <= 64).length > 0 && (
            <div className="space-y-3">
              <label className="font-bold">Actual Size Preview</label>
              <div className="flex flex-wrap gap-6">
                {favicons
                  .filter((f) => f.size <= 64)
                  .map((favicon) => (
                    <div key={favicon.size} className="text-center space-y-2">
                      <div
                        className={`mx-auto rounded border ${previewBgClass}`}
                        style={{ width: favicon.size, height: favicon.size }}
                      >
                        <img
                          src={favicon.dataUrl}
                          alt={`${favicon.size}x${favicon.size}`}
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {favicon.size}×{favicon.size}px
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">
                This is exactly how small these favicons render in browser tabs
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-bold">HTML Snippet</label>
            <pre className="p-4 rounded-lg border bg-muted/50 text-sm font-mono overflow-x-auto">
              {`<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">`}
            </pre>
          </div>
        </div>
      )}

      {generating && (
        <div className="text-center py-8 text-muted-foreground">Generating favicons...</div>
      )}
    </div>
  );
}
