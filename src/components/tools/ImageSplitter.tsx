import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  Grid3X3,
  Archive,
  Copy,
  RotateCw,
  RotateCcw,
  ArrowLeftRight,
  ArrowUpDown,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilePaste } from "@/hooks/use-file-paste";

type OutputFormat = "png" | "jpeg" | "webp";
type OrientationAction = "none" | "cw" | "ccw" | "fliph" | "flipv";
type NumberingStyle = "row-col" | "col-row" | "sequential";

interface Tile {
  row: number;
  col: number;
  dataUrl: string;
}

export default function ImageSplitter() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(90);
  const [prefix, setPrefix] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [orientation, setOrientation] = useState<OrientationAction>("none");
  const [numbering, setNumbering] = useState<NumberingStyle>("row-col");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const splitImageRef = useRef<() => void>(() => {});

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
      const img = new Image();
      img.onload = () => {
        sourceImgRef.current = img;
        setImageSize({ width: img.width, height: img.height });
        setSourceImage(dataUrl);
        setTiles([]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useFilePaste(readFile, "image/*");

  const splitImage = useCallback(() => {
    const img = sourceImgRef.current;
    if (!img) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render source at native size, then apply orientation
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    applyOrientation(ctx, canvas, orientation);

    const orientedW = canvas.width;
    const orientedH = canvas.height;
    const tileWidth = Math.floor(orientedW / cols);
    const tileHeight = Math.floor(orientedH / rows);

    if (tileWidth < 1 || tileHeight < 1) return;

    const mimeType =
      outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";

    // Reference canvas holding the full oriented image for tile extraction
    const orientedCanvas = document.createElement("canvas");
    orientedCanvas.width = orientedW;
    orientedCanvas.height = orientedH;
    const oCtx = orientedCanvas.getContext("2d")!;
    oCtx.drawImage(canvas, 0, 0);

    const newTiles: Tile[] = [];

    canvas.width = tileWidth;
    canvas.height = tileHeight;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.clearRect(0, 0, tileWidth, tileHeight);
        if (mimeType !== "image/png") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, tileWidth, tileHeight);
        }
        ctx.drawImage(
          orientedCanvas,
          col * tileWidth,
          row * tileHeight,
          tileWidth,
          tileHeight,
          0,
          0,
          tileWidth,
          tileHeight,
        );
        const dataUrl =
          mimeType === "image/png"
            ? canvas.toDataURL(mimeType)
            : canvas.toDataURL(mimeType, quality / 100);
        newTiles.push({ row, col, dataUrl });
      }
    }

    setTiles(newTiles);
  }, [rows, cols, outputFormat, quality, bgColor, orientation]);

  splitImageRef.current = splitImage;

  useEffect(() => {
    if (sourceImage) {
      splitImageRef.current();
    }
  }, [sourceImage, rows, cols, outputFormat, quality, bgColor, orientation]);

  useEffect(() => {
    if (!sourceImage) {
      setPreviewImage(null);
      return;
    }
    const img = sourceImgRef.current;
    if (!img) return;
    if (orientation === "none") {
      setPreviewImage(sourceImage);
      return;
    }
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    applyOrientation(tempCtx, tempCanvas, orientation);
    setPreviewImage(tempCanvas.toDataURL("image/png"));
  }, [sourceImage, orientation]);

  function applyOrientation(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    action: OrientationAction,
  ) {
    const w = canvas.width;
    const h = canvas.height;
    if (action === "none" || w < 1 || h < 1) return;
    const imageData = ctx.getImageData(0, 0, w, h);
    switch (action) {
      case "cw": {
        canvas.width = h;
        canvas.height = w;
        ctx.save();
        ctx.translate(h, 0);
        ctx.rotate(Math.PI / 2);
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
        break;
      }
      case "ccw": {
        canvas.width = h;
        canvas.height = w;
        ctx.save();
        ctx.translate(0, w);
        ctx.rotate(-Math.PI / 2);
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
        break;
      }
      case "fliph": {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
        break;
      }
      case "flipv": {
        ctx.save();
        ctx.translate(0, h);
        ctx.scale(1, -1);
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
        break;
      }
    }
  }

  const getTileName = (row: number, col: number) => {
    const total = rows * cols;
    switch (numbering) {
      case "row-col":
        return `${row + 1}-${col + 1}`;
      case "col-row":
        return `${col + 1}-${row + 1}`;
      case "sequential":
        return `${row * cols + col + 1}`;
    }
  };

  const outputExt = outputFormat === "jpeg" ? "jpg" : outputFormat;

  const downloadTile = (tile: Tile) => {
    const link = document.createElement("a");
    link.download = `${prefix || fileName}-${getTileName(tile.row, tile.col)}.${outputExt}`;
    link.href = tile.dataUrl;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const tile of tiles) {
      const response = await fetch(tile.dataUrl);
      const blob = await response.blob();
      zip.file(`${prefix || fileName}-${getTileName(tile.row, tile.col)}.${outputExt}`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = `${prefix || fileName}-split.zip`;
    link.href = URL.createObjectURL(zipBlob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyTile = async (tile: Tile) => {
    try {
      const response = await fetch(tile.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      // fallback: copy dataUrl as text
      try {
        await navigator.clipboard.writeText(tile.dataUrl);
      } catch {
        // silently ignore
      }
    }
  };

  const clear = () => {
    sourceImgRef.current = null;
    setSourceImage(null);
    setFileName("");
    setTiles([]);
    setImageSize({ width: 0, height: 0 });
    setPreviewImage(null);
    setOrientation("none");
    setShowAllTiles(false);
  };

  const [showAllTiles, setShowAllTiles] = useState(false);
  const maxDisplayTiles = 100;
  const displayTiles = showAllTiles ? tiles : tiles.slice(0, maxDisplayTiles);

  const orientedWidth =
    orientation === "cw" || orientation === "ccw" ? imageSize.height : imageSize.width;
  const orientedHeight =
    orientation === "cw" || orientation === "ccw" ? imageSize.width : imageSize.height;
  const tileWidth = imageSize.width ? Math.floor(orientedWidth / cols) : 0;
  const tileHeight = imageSize.height ? Math.floor(orientedHeight / rows) : 0;

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Drop Zone */}
      {!sourceImage && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("splitter-input")?.click()}
        >
          <input
            id="splitter-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Drop image here</p>
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG, or any image format, or paste
          </p>
        </div>
      )}

      {/* Source Preview & Settings */}
      {sourceImage && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-bold">Source Image</label>
              {imageSize.width > 0 && (
                <p className="text-sm text-muted-foreground">
                  {orientation === "cw" || orientation === "ccw"
                    ? `${imageSize.height} x ${imageSize.width} px`
                    : `${imageSize.width} x ${imageSize.height} px`}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="size-4 mr-2" /> Clear
            </Button>
          </div>

          {/* Preview with grid overlay */}
          <div className="relative inline-block">
            <img
              src={previewImage || sourceImage}
              alt="Source"
              className="max-w-full max-h-80 rounded border"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {Array.from({ length: rows * cols }).map((_, i) => {
                const r = Math.floor(i / cols);
                const c = i % cols;
                return (
                  <div
                    key={i}
                    className="border border-primary/50 border-dashed flex items-center justify-center"
                  >
                    {(r === 0 || (r > 0 && c === 0)) && (
                      <span className="text-[10px] font-semibold text-primary/70 bg-background/50 px-0.5 rounded leading-none">
                        {r === 0 ? c + 1 : r + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Settings */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <label className="font-bold text-sm">Columns</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm">Rows</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm">Output Format</label>
              <Select
                value={outputFormat}
                onValueChange={(v) => setOutputFormat(v as OutputFormat)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm">Filename Prefix</label>
              <Input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder={fileName || "file-name"}
                className="h-12 text-base"
              />
            </div>
          </div>

          {outputFormat !== "png" && (
            <div className="space-y-2 max-w-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-sm">Quality</label>
                <span className="text-sm font-mono text-muted-foreground tabular-nums">
                  {quality}%
                </span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={1}
                max={100}
                step={1}
              />
            </div>
          )}

          {outputFormat !== "png" && (
            <div className="space-y-2 max-w-xs">
              <label className="font-bold text-sm">Background Colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="size-10 rounded cursor-pointer border"
                />
                <span className="text-sm font-mono text-muted-foreground">{bgColor}</span>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-sm mb-2 block">Grid Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "2×2", r: 2, c: 2 },
                { label: "3×3", r: 3, c: 3 },
                { label: "4×4", r: 4, c: 4 },
                { label: "2×3", r: 2, c: 3 },
                { label: "3×4", r: 3, c: 4 },
              ].map((p) => (
                <Button
                  key={p.label}
                  variant={rows === p.r && cols === p.c ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setRows(p.r);
                    setCols(p.c);
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-sm mb-2 block">Orientation</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { label: "CW", icon: RotateCw, action: "cw" as const },
                  { label: "CCW", icon: RotateCcw, action: "ccw" as const },
                  { label: "H-Flip", icon: ArrowLeftRight, action: "fliph" as const },
                  { label: "V-Flip", icon: ArrowUpDown, action: "flipv" as const },
                ] as const
              ).map(({ label, icon: Icon, action }) => (
                <Button
                  key={action}
                  variant={orientation === action ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOrientation(orientation === action ? "none" : action)}
                >
                  <Icon className="size-4 mr-1" /> {label}
                </Button>
              ))}
              {orientation !== "none" && (
                <Button variant="ghost" size="sm" onClick={() => setOrientation("none")}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="max-w-xs space-y-2">
            <label className="font-bold text-sm">Numbering</label>
            <Select value={numbering} onValueChange={(v) => setNumbering(v as NumberingStyle)}>
              <SelectTrigger className="h-10 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="row-col">
                  <span className="font-mono">Row-Col</span>
                  <span className="text-muted-foreground ml-2">1-1, 1-2, …</span>
                </SelectItem>
                <SelectItem value="col-row">
                  <span className="font-mono">Col-Row</span>
                  <span className="text-muted-foreground ml-2">1-1, 2-1, …</span>
                </SelectItem>
                <SelectItem value="sequential">
                  <span className="font-mono">
                    <Hash className="size-3 inline" />
                  </span>
                  <span className="text-muted-foreground ml-2">1, 2, 3, …</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Tile: {tileWidth} x {tileHeight} px &middot; Total: {rows * cols} tiles
          </div>
        </div>
      )}

      {/* Generated Tiles */}
      {tiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-bold">Generated Tiles</label>
              <p className="text-sm text-muted-foreground">
                {tiles.length} tiles &middot; {tileWidth} x {tileHeight} px each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={downloadAllAsZip}>
                <Archive className="size-4 mr-2" /> Download ZIP
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="size-3.5 mr-1" /> Tile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <ScrollArea className="max-h-80">
                    {tiles.map((tile) => (
                      <DropdownMenuItem
                        key={`${tile.row}-${tile.col}`}
                        onSelect={() => downloadTile(tile)}
                        className="flex items-center gap-3 py-2"
                      >
                        <img
                          src={tile.dataUrl}
                          alt=""
                          className="size-8 rounded object-cover border shrink-0"
                        />
                        <span className="font-mono text-xs">{getTileName(tile.row, tile.col)}</span>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {displayTiles.map((tile) => (
              <div
                key={`${tile.row}-${tile.col}`}
                className="rounded border bg-card overflow-hidden group relative"
              >
                <div className="absolute top-1 left-1 z-10 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none">
                  {getTileName(tile.row, tile.col)}
                </div>
                <img
                  src={tile.dataUrl}
                  alt={`Tile ${tile.row + 1}-${tile.col + 1}`}
                  className="w-full h-auto"
                />
                <div className="flex divide-x border-t">
                  <button
                    onClick={() => downloadTile(tile)}
                    className="flex-1 py-1.5 text-xs hover:bg-accent flex items-center justify-center gap-1 transition-colors"
                    title="Download"
                  >
                    <Download className="size-3" /> Save
                  </button>
                  <button
                    onClick={() => copyTile(tile)}
                    className="flex-1 py-1.5 text-xs hover:bg-accent flex items-center justify-center gap-1 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="size-3" /> Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
          {tiles.length > maxDisplayTiles && !showAllTiles && (
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setShowAllTiles(true)}>
                Show all {tiles.length} tiles ({tiles.length - maxDisplayTiles} more)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
