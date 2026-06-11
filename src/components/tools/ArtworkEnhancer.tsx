import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Download, Trash2, RefreshCw, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFilePaste } from "@/hooks/use-file-paste";

type NoiseType = "colour" | "monochrome";
type BlendMode = "overlay" | "soft-light" | "hard-light" | "screen" | "multiply";
type DownloadFormat = "png" | "jpeg";

const BLEND_MODES: { value: BlendMode; label: string; description: string }[] = [
  { value: "overlay", label: "Overlay", description: "Classic — adds texture while preserving highlights/shadows" },
  { value: "soft-light", label: "Soft Light", description: "Gentler than overlay, like soft light shining through" },
  { value: "hard-light", label: "Hard Light", description: "Stronger contrast, multiplies or screens based on base" },
  { value: "screen", label: "Screen", description: "Brightens, gives a faded/washed look" },
  { value: "multiply", label: "Multiply", description: "Darkens, creates a gritty textured overlay" },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function ArtworkEnhancer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [opacity, setOpacity] = useState(2);
  const [noiseScale, setNoiseScale] = useState(1);
  const [noiseType, setNoiseType] = useState<NoiseType>("colour");
  const [blendMode, setBlendMode] = useState<BlendMode>("overlay");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [noiseSeed, setNoiseSeed] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png");
  const [jpegQuality, setJpegQuality] = useState(92);
  const [seedInput, setSeedInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setImage(dataUrl);
        setOriginalImage(dataUrl);
        setResultImage(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useFilePaste(readFile, "image/*");

  const generateNoise = useCallback(() => {
    const seed = Math.floor(Math.random() * 2147483646) + 1;
    setNoiseSeed(seed);
    setSeedInput(String(seed));
  }, []);

  const applySeed = () => {
    const parsed = parseInt(seedInput, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setSeedInput(String(noiseSeed || 1));
      return;
    }
    setNoiseSeed(parsed);
  };

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = img.width;
      noiseCanvas.height = img.height;
      const noiseCtx = noiseCanvas.getContext("2d");
      if (!noiseCtx) return;

      const rng = seededRandom(noiseSeed || 1);

      const imageData = noiseCtx.createImageData(img.width, img.height);
      const data = imageData.data;

      if (noiseType === "monochrome") {
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.floor(rng() * 256);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
      } else {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor(rng() * 256);
          data[i + 1] = Math.floor(rng() * 256);
          data[i + 2] = Math.floor(rng() * 256);
          data[i + 3] = 255;
        }
      }

      noiseCtx.putImageData(imageData, 0, 0);

      const renderNoise = (targetCtx: CanvasRenderingContext2D) => {
        if (noiseScale > 1) {
          const scaledNoiseCanvas = document.createElement("canvas");
          scaledNoiseCanvas.width = img.width;
          scaledNoiseCanvas.height = img.height;
          const scaledCtx = scaledNoiseCanvas.getContext("2d");
          if (!scaledCtx) return;

          scaledCtx.imageSmoothingEnabled = false;
          const smallWidth = Math.ceil(img.width / noiseScale);
          const smallHeight = Math.ceil(img.height / noiseScale);

          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = smallWidth;
          smallCanvas.height = smallHeight;
          const smallCtx = smallCanvas.getContext("2d");
          if (!smallCtx) return;

          const srng = seededRandom(noiseSeed + 9999);
          const smallImageData = smallCtx.createImageData(smallWidth, smallHeight);
          const smallData = smallImageData.data;

          if (noiseType === "monochrome") {
            for (let i = 0; i < smallData.length; i += 4) {
              const v = Math.floor(srng() * 256);
              smallData[i] = v;
              smallData[i + 1] = v;
              smallData[i + 2] = v;
              smallData[i + 3] = 255;
            }
          } else {
            for (let i = 0; i < smallData.length; i += 4) {
              smallData[i] = Math.floor(srng() * 256);
              smallData[i + 1] = Math.floor(srng() * 256);
              smallData[i + 2] = Math.floor(srng() * 256);
              smallData[i + 3] = 255;
            }
          }

          smallCtx.putImageData(smallImageData, 0, 0);
          scaledCtx.drawImage(smallCanvas, 0, 0, img.width, img.height);

          targetCtx.globalCompositeOperation = blendMode;
          targetCtx.globalAlpha = opacity / 100;
          targetCtx.drawImage(scaledNoiseCanvas, 0, 0);
        } else {
          targetCtx.globalCompositeOperation = blendMode;
          targetCtx.globalAlpha = opacity / 100;
          targetCtx.drawImage(noiseCanvas, 0, 0);
        }

        targetCtx.globalCompositeOperation = "source-over";
        targetCtx.globalAlpha = 1;
      };

      renderNoise(ctx);

      setResultImage(canvas.toDataURL("image/png"));
    };
    img.src = image;
  }, [image, opacity, noiseScale, noiseSeed, noiseType, blendMode]);

  const downloadResult = () => {
    if (!resultImage) return;
    if (downloadFormat === "png") {
      const link = document.createElement("a");
      link.download = `${fileName || "artwork"}-enhanced.png`;
      link.href = resultImage;
      link.click();
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${fileName || "artwork"}-enhanced.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/jpeg", jpegQuality / 100);
    }
  };

  const clearImage = () => {
    setImage(null);
    setOriginalImage(null);
    setResultImage(null);
    setFileName("");
  };

  return (
    <div className="space-y-6">
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">Drop your artwork here</p>
            <p className="text-sm text-muted-foreground">or click to browse, or paste</p>
          </label>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Noise Opacity</label>
                <span className="text-sm text-muted-foreground font-mono">{opacity}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => setOpacity(v)}
                min={1}
                max={20}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Classic trick uses 2% opacity</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Noise Scale</label>
                <span className="text-sm text-muted-foreground font-mono">{noiseScale}x</span>
              </div>
              <Slider
                value={[noiseScale]}
                onValueChange={([v]) => setNoiseScale(v)}
                min={1}
                max={4}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Higher = blockier noise</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Noise Type</label>
              </div>
              <Select value={noiseType} onValueChange={(v) => setNoiseType(v as NoiseType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colour">Colour Noise</SelectItem>
                  <SelectItem value="monochrome">Monochrome Noise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {noiseType === "colour" ? "Full RGB colour variation" : "Greyscale grain — closer to film"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Blend Mode</label>
              </div>
              <Select value={blendMode} onValueChange={(v) => setBlendMode(v as BlendMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLEND_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {BLEND_MODES.find((m) => m.value === blendMode)?.description}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Seed</label>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  onBlur={applySeed}
                  onKeyDown={(e) => e.key === "Enter" && applySeed()}
                  className="font-mono"
                  placeholder="Random seed"
                />
                <Button variant="outline" size="icon" onClick={generateNoise} title="Randomize seed">
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Same seed + settings = same noise pattern</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold">Download Format</label>
              </div>
              <div className="flex gap-2">
                <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as DownloadFormat)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (lossless)</SelectItem>
                    <SelectItem value="jpeg">JPEG (smaller file)</SelectItem>
                  </SelectContent>
                </Select>
                {downloadFormat === "jpeg" && (
                  <div className="flex items-center gap-2 flex-1">
                    <Slider
                      value={[jpegQuality]}
                      onValueChange={([v]) => setJpegQuality(v)}
                      min={1}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground font-mono w-8 text-right">{jpegQuality}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {downloadFormat === "png" ? "Lossless, larger file, supports transparency" : `JPEG quality: ${jpegQuality}%`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={generateNoise} className="gap-2">
              <RefreshCw className="size-4" />
              Regenerate Noise
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowOriginal(!showOriginal)}
              className="gap-2"
            >
              {showOriginal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showOriginal ? "Show Enhanced" : "Show Original"}
            </Button>
            <Button variant="outline" onClick={clearImage} className="gap-2">
              <Trash2 className="size-4" />
              Clear
            </Button>
            <Button onClick={downloadResult} disabled={!resultImage} className="gap-2 ml-auto">
              <Download className="size-4" />
              Download {downloadFormat.toUpperCase()}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="font-bold">Preview</label>
              {showOriginal && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="size-3" />
                  Original
                </span>
              )}
            </div>
            <div className="border rounded-xl overflow-hidden bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]">
              {showOriginal && originalImage && (
                <img
                  src={originalImage}
                  alt="Original artwork"
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              )}
              {!showOriginal && resultImage && (
                <img
                  src={resultImage}
                  alt="Enhanced artwork"
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {imageSize.width} × {imageSize.height}px
              {noiseSeed > 0 && (
                <span className="ml-2">· seed: {noiseSeed}</span>
              )}
            </p>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="p-4 rounded-lg border bg-muted/30 text-sm">
        <p className="font-bold mb-1">About this technique</p>
        <p className="text-muted-foreground">
          Adding noise at low opacity with a blend mode is a classic digital art trick.
          It adds subtle texture and colour variation that makes artwork feel more organic
          and cohesive, similar to the natural grain in traditional media. Experiment with
          different noise types and blend modes to find the perfect look.
        </p>
      </div>
    </div>
  );
}
