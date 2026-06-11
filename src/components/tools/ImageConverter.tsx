import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, Download, X, ImageIcon, Lock, Unlock, Archive, Scaling, RotateCw, RotateCcw, Copy, Check, ArrowLeftRight, ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFilePaste } from "@/hooks/use-file-paste";

type ImageFormat = "png" | "jpeg" | "webp" | "avif" | "gif" | "bmp" | "tiff" | "ico" | "icns";

type ResizeMode = "original" | "custom" | "percentage";

interface ResizeOptions {
  mode: ResizeMode;
  width: number;
  height: number;
  percentage: number;
  lockAspectRatio: boolean;
}

interface PngOptions {
  transparency: boolean;
  backgroundColour: string;
}

interface JpegOptions {
  quality: number;
  backgroundColour: string;
}

interface WebpOptions {
  quality: number;
  lossless: boolean;
}

interface AvifOptions {
  quality: number;
}

interface GifOptions {
  maxColours: number;
  quantization: "rgb565" | "rgb444" | "rgba4444";
}

interface BmpOptions {
  bitDepth: 24 | 32;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TiffOptions {}

interface IcoOptions {
  sizes: number[];
  multiSize: boolean;
}

interface IcnsOptions {
  sizes: number[];
  multiSize: boolean;
}

interface FormatOptionsMap {
  png: PngOptions;
  jpeg: JpegOptions;
  webp: WebpOptions;
  avif: AvifOptions;
  gif: GifOptions;
  bmp: BmpOptions;
  tiff: TiffOptions;
  ico: IcoOptions;
  icns: IcnsOptions;
}

interface ConvertedImage {
  name: string;
  originalFormat: string;
  targetFormat: ImageFormat;
  blob: Blob;
  size: number;
  url: string;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      mimeType,
      quality !== undefined ? quality / 100 : undefined
    );
  });
}

function prepareCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  fillBackground: boolean,
  backgroundColour: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;
  if (fillBackground) {
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas;
}

function getTargetDimensions(
  img: HTMLImageElement,
  resize: ResizeOptions
): { width: number; height: number } {
  if (resize.mode === "percentage") {
    const scale = resize.percentage / 100;
    return {
      width: Math.round(img.naturalWidth * scale),
      height: Math.round(img.naturalHeight * scale),
    };
  }
  if (resize.mode === "custom") {
    const w = resize.width || img.naturalWidth;
    const h = resize.height || img.naturalHeight;
    if (resize.lockAspectRatio) {
      const aspect = img.naturalWidth / img.naturalHeight;
      if (resize.width && !resize.height) {
        return { width: w, height: Math.round(w / aspect) };
      }
      if (resize.height && !resize.width) {
        return { width: Math.round(h * aspect), height: h };
      }
      if (resize.width && resize.height) {
        return { width: w, height: Math.round(w / aspect) };
      }
    }
    return { width: w, height: h };
  }
  return { width: img.naturalWidth, height: img.naturalHeight };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function encodePng(canvas: HTMLCanvasElement, _options: PngOptions): Promise<Blob> {
  return canvasToBlob(canvas, "image/png");
}

async function encodeJpeg(canvas: HTMLCanvasElement, options: JpegOptions): Promise<Blob> {
  return canvasToBlob(canvas, "image/jpeg", options.quality);
}

async function encodeWebp(canvas: HTMLCanvasElement, options: WebpOptions): Promise<Blob> {
  if (options.lossless) {
    return canvasToBlob(canvas, "image/webp", 100);
  }
  return canvasToBlob(canvas, "image/webp", options.quality);
}

async function encodeAvif(canvas: HTMLCanvasElement, options: AvifOptions): Promise<Blob> {
  return canvasToBlob(canvas, "image/avif", options.quality);
}

async function encodeGif(canvas: HTMLCanvasElement, options: GifOptions): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const palette = quantize(data, options.maxColours, { format: options.quantization });
  const index = applyPalette(data, palette, options.quantization);

  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, { palette });
  gif.finish();

  const bytes = gif.bytes();
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

async function encodeBmp(canvas: HTMLCanvasElement, options: BmpOptions): Promise<Blob> {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const bpp = options.bitDepth;
  const bytesPerPixel = bpp / 8;
  const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const headerSize = 14 + 40;
  const fileSize = headerSize + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP file header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, headerSize, true);

  // DIB header (BITMAPINFOHEADER, 40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // negative = top-down
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, bpp, true);
  view.setUint32(30, 0, true); // no compression
  view.setUint32(34, pixelDataSize, true);
  view.setUint32(38, 2835, true); // ~72 DPI horizontal
  view.setUint32(42, 2835, true); // ~72 DPI vertical

  for (let y = 0; y < height; y++) {
    const rowStart = headerSize + y * rowSize;
    let off = rowStart;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (bpp === 32) {
        view.setUint8(off++, data[i + 2]); // B
        view.setUint8(off++, data[i + 1]); // G
        view.setUint8(off++, data[i]);     // R
        view.setUint8(off++, data[i + 3]); // A
      } else {
        view.setUint8(off++, data[i + 2]); // B
        view.setUint8(off++, data[i + 1]); // G
        view.setUint8(off++, data[i]);     // R
      }
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function encodeTiff(canvas: HTMLCanvasElement, _options: TiffOptions): Promise<Blob> {
  const UTIF = await import("utif");
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const arrayBuffer = UTIF.encodeImage(imageData.data, width, height);
  return new Blob([arrayBuffer], { type: "image/tiff" });
}

async function encodeIco(canvas: HTMLCanvasElement, options: IcoOptions): Promise<Blob> {
  const sizes = options.multiSize ? options.sizes : [options.sizes[0] || 32];
  const pngBlobs: ArrayBuffer[] = [];

  for (const size of sizes) {
    const resized = document.createElement("canvas");
    resized.width = size;
    resized.height = size;
    const ctx = resized.getContext("2d")!;
    ctx.drawImage(canvas, 0, 0, size, size);
    const blob = await canvasToBlob(resized, "image/png");
    pngBlobs.push(await blob.arrayBuffer());
  }

  // ICO header: 6 bytes + 16 bytes per image + PNG data
  const headerSize = 6 + sizes.length * 16;
  const totalDataSize = pngBlobs.reduce((sum, b) => sum + b.byteLength, 0);
  const buffer = new ArrayBuffer(headerSize + totalDataSize);
  const view = new DataView(buffer);

  // ICO header
  view.setUint16(0, 0, true);     // reserved
  view.setUint16(2, 1, true);     // ICO type
  view.setUint16(4, sizes.length, true); // image count

  let dataOffset = headerSize;
  for (let i = 0; i < sizes.length; i++) {
    const dirOffset = 6 + i * 16;
    const size = sizes[i];
    const pngData = pngBlobs[i];

    view.setUint8(dirOffset, size >= 256 ? 0 : size);     // width (0 = 256)
    view.setUint8(dirOffset + 1, size >= 256 ? 0 : size); // height
    view.setUint8(dirOffset + 2, 0);   // colour palette
    view.setUint8(dirOffset + 3, 0);   // reserved
    view.setUint16(dirOffset + 4, 1, true);  // colour planes
    view.setUint16(dirOffset + 6, 32, true); // bits per pixel
    view.setUint32(dirOffset + 8, pngData.byteLength, true); // data size
    view.setUint32(dirOffset + 12, dataOffset, true);        // data offset

    new Uint8Array(buffer, dataOffset, pngData.byteLength).set(new Uint8Array(pngData));
    dataOffset += pngData.byteLength;
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

const ICNS_TYPE_MAP: Record<number, string> = {
  16: "icp4",
  32: "icp5",
  64: "icp6",
  128: "ic07",
  256: "ic08",
  512: "ic09",
  1024: "ic10",
};

async function encodeIcns(canvas: HTMLCanvasElement, options: IcnsOptions): Promise<Blob> {
  const sizes = options.multiSize ? options.sizes : [options.sizes[0] || 128];
  const entries: { type: string; data: ArrayBuffer }[] = [];

  for (const size of sizes) {
    const type = ICNS_TYPE_MAP[size];
    if (!type) continue;

    const resized = document.createElement("canvas");
    resized.width = size;
    resized.height = size;
    const ctx = resized.getContext("2d")!;
    ctx.drawImage(canvas, 0, 0, size, size);
    const blob = await canvasToBlob(resized, "image/png");
    entries.push({ type, data: await blob.arrayBuffer() });
  }

  // ICNS: 4-byte magic + 4-byte file size + entries (each: 4-byte type + 4-byte size + data)
  const totalDataSize = entries.reduce((sum, e) => sum + 8 + e.data.byteLength, 0);
  const fileSize = 8 + totalDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // File header
  bytes[0] = 0x69; // 'i'
  bytes[1] = 0x63; // 'c'
  bytes[2] = 0x6e; // 'n'
  bytes[3] = 0x73; // 's'
  view.setUint32(4, fileSize, false); // big-endian

  let offset = 8;
  for (const entry of entries) {
    // Entry type (4 ASCII chars)
    for (let i = 0; i < 4; i++) {
      bytes[offset + i] = entry.type.charCodeAt(i);
    }
    // Entry size (big-endian, includes the 8-byte header)
    view.setUint32(offset + 4, 8 + entry.data.byteLength, false);
    // PNG data
    new Uint8Array(buffer, offset + 8, entry.data.byteLength).set(new Uint8Array(entry.data));
    offset += 8 + entry.data.byteLength;
  }

  return new Blob([buffer], { type: "image/x-icns" });
}

type OrientationAction = "none" | "cw" | "ccw" | "fliph" | "flipv";

interface FilterSettings {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
}

interface ConversionPreset {
  name: string;
  width: number;
  height: number;
}

const PRESETS: ConversionPreset[] = [
  { name: "Original", width: 0, height: 0 },
  { name: "Twitter Card", width: 1200, height: 628 },
  { name: "OG Image", width: 1200, height: 630 },
  { name: "Instagram Square", width: 1080, height: 1080 },
  { name: "Instagram Portrait", width: 1080, height: 1350 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
  { name: "Facebook Cover", width: 1640, height: 624 },
  { name: "LinkedIn Banner", width: 1584, height: 396 },
];

function applyOrientation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  orientation: OrientationAction
): void {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);

  switch (orientation) {
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

function applyFilters(imageData: ImageData, filters: FilterSettings): void {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (filters.grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    if (filters.sepia) {
      r = r * 0.393 + g * 0.769 + b * 0.189;
      g = r * 0.349 + g * 0.686 + b * 0.168;
      b = r * 0.272 + g * 0.534 + b * 0.131;
    }

    if (filters.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    if (filters.brightness !== 100) {
      const ratio = filters.brightness / 100;
      r *= ratio;
      g *= ratio;
      b *= ratio;
    }

    if (filters.contrast !== 100) {
      const factor = (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
    }

    if (filters.saturation !== 100) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const ratio = filters.saturation / 100;
      r = gray + (r - gray) * ratio;
      g = gray + (g - gray) * ratio;
      b = gray + (b - gray) * ratio;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    data[i + 3] = a;
  }
}

export default function ImageConverter() {
  const [images, setImages] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("webp");
  const [converted, setConverted] = useState<ConvertedImage[]>([]);
  const [converting, setConverting] = useState(false);

  const [avifSupported, setAvifSupported] = useState<boolean | null>(null);

  const [orientation, setOrientation] = useState<OrientationAction>("none");
  const [showOriginal, setShowOriginal] = useState(false);

  const [filters, setFilters] = useState<FilterSettings>({
    grayscale: false,
    sepia: false,
    invert: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const [resize, setResize] = useState<ResizeOptions>({
    mode: "original",
    width: 0,
    height: 0,
    percentage: 100,
    lockAspectRatio: true,
  });

  const [formatOptions, setFormatOptions] = useState<FormatOptionsMap>({
    png: { transparency: true, backgroundColour: "#ffffff" },
    jpeg: { quality: 90, backgroundColour: "#ffffff" },
    webp: { quality: 90, lossless: false },
    avif: { quality: 80 },
    gif: { maxColours: 256, quantization: "rgb565" },
    bmp: { bitDepth: 32 },
    tiff: {},
    ico: { sizes: [32], multiSize: false },
    icns: { sizes: [128], multiSize: false },
  });

  const prevPreviewUrls = useRef<string[]>([]);

  const previewUrls = images.map((file) => URL.createObjectURL(file));

  useEffect(() => {
    const prev = prevPreviewUrls.current;
    prevPreviewUrls.current = previewUrls;
    return () => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      prevPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  });

  useEffect(() => {
    return () => {
      prevPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const result = canvas.toDataURL("image/avif").startsWith("data:image/avif");
    setAvifSupported(result);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...files]);
    setConverted([]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setImages((prev) => [...prev, ...files]);
      setConverted([]);
    }
  };

  useFilePaste((file: File) => {
    setImages((prev) => [...prev, file]);
    setConverted([]);
  }, "image/*");

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setConverted([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearAll = () => {
    converted.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setConverted([]);
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      img.src = objectUrl;
    });
  };

  const convertImages = async () => {
    setConverting(true);
    converted.forEach((img) => URL.revokeObjectURL(img.url));
    const results: ConvertedImage[] = [];

    for (const file of images) {
      try {
        const img = await loadImage(file);
        const { width, height } = getTargetDimensions(img, resize);

        const needsBackground =
          targetFormat === "jpeg" ||
          (targetFormat === "png" && !formatOptions.png.transparency) ||
          (targetFormat === "bmp" && formatOptions.bmp.bitDepth === 24);

        const bgColour =
          targetFormat === "jpeg"
            ? formatOptions.jpeg.backgroundColour
            : targetFormat === "png"
              ? formatOptions.png.backgroundColour
              : "#ffffff";

        const canvas = prepareCanvas(img, width, height, needsBackground, bgColour);
        const ctx = canvas.getContext("2d")!;

        if (orientation !== "none") {
          applyOrientation(ctx, canvas, orientation);
        }

        const hasFilters =
          filters.grayscale || filters.sepia || filters.invert ||
          filters.brightness !== 100 || filters.contrast !== 100 || filters.saturation !== 100;
        if (hasFilters) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyFilters(imageData, filters);
          ctx.putImageData(imageData, 0, 0);
        }

        let blob: Blob;
        switch (targetFormat) {
          case "png":
            blob = await encodePng(canvas, formatOptions.png);
            break;
          case "jpeg":
            blob = await encodeJpeg(canvas, formatOptions.jpeg);
            break;
          case "webp":
            blob = await encodeWebp(canvas, formatOptions.webp);
            break;
          case "avif":
            blob = await encodeAvif(canvas, formatOptions.avif);
            break;
          case "gif":
            blob = await encodeGif(canvas, formatOptions.gif);
            break;
          case "bmp":
            blob = await encodeBmp(canvas, formatOptions.bmp);
            break;
          case "tiff":
            blob = await encodeTiff(canvas, formatOptions.tiff);
            break;
          case "ico":
            blob = await encodeIco(canvas, formatOptions.ico);
            break;
          case "icns":
            blob = await encodeIcns(canvas, formatOptions.icns);
            break;
        }

        const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
        const url = URL.createObjectURL(blob);

        results.push({
          name: file.name.replace(/\.[^.]+$/, `.${ext}`),
          originalFormat: file.type.split("/")[1] || "unknown",
          targetFormat,
          blob,
          size: blob.size,
          url,
        });

        URL.revokeObjectURL(img.src);
      } catch (err) {
        console.error(`Failed to convert ${file.name}:`, err);
      }
    }

    setConverted(results);
    setConverting(false);
  };

  const downloadImage = (img: ConvertedImage) => {
    const link = document.createElement("a");
    link.download = img.name;
    link.href = img.url;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const img of converted) {
      zip.file(img.name, img.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = "converted-images.zip";
    link.href = URL.createObjectURL(zipBlob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyAsDataUrl = async (img: ConvertedImage) => {
    try {
      const text = await img.blob.text();
      const buffer = await img.blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const mime = img.blob.type;
      const dataUrl = `data:${mime};base64,${base64}`;
      await navigator.clipboard.writeText(dataUrl);
      setCopiedUrl(img.url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        navigator.clipboard.writeText(reader.result as string);
        setCopiedUrl(img.url);
        setTimeout(() => setCopiedUrl(null), 2000);
      };
      reader.readAsDataURL(img.blob);
    }
  };

  const updateFormatOption = <F extends ImageFormat>(
    format: F,
    key: keyof FormatOptionsMap[F],
    value: FormatOptionsMap[F][keyof FormatOptionsMap[F]]
  ) => {
    setFormatOptions((prev) => ({
      ...prev,
      [format]: { ...prev[format], [key]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Drop images here</p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to select files, or paste
        </p>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="font-bold block">Convert to</label>
        <div className="flex flex-wrap gap-2">
          {(["png", "jpeg", "webp", "avif", "gif", "bmp", "tiff", "ico", "icns"] as ImageFormat[]).map((fmt) => (
            <Button
              key={fmt}
              variant={targetFormat === fmt ? "default" : "outline"}
              onClick={() => setTargetFormat(fmt)}
              className="uppercase font-bold"
              size="lg"
              disabled={fmt === "avif" && avifSupported === false}
              title={fmt === "avif" && avifSupported === false ? "AVIF encoding not supported in your browser" : undefined}
            >
              {fmt}
            </Button>
          ))}
        </div>
        {targetFormat === "avif" && avifSupported === false && (
          <p className="text-sm text-destructive">
            Your browser does not support AVIF encoding. Try Chrome or Edge.
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Format Options Card */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {targetFormat.toUpperCase()} Options
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {targetFormat === "png" && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Preserve transparency</Label>
                <Switch
                  checked={formatOptions.png.transparency}
                  onCheckedChange={(v) => updateFormatOption("png", "transparency", v)}
                />
              </div>
              {!formatOptions.png.transparency && (
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Background colour</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formatOptions.png.backgroundColour}
                      onChange={(e) => updateFormatOption("png", "backgroundColour", e.target.value)}
                      className="size-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{formatOptions.png.backgroundColour}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {targetFormat === "jpeg" && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Quality</Label>
                  <span className="text-sm font-mono text-muted-foreground tabular-nums">{formatOptions.jpeg.quality}%</span>
                </div>
                <Slider
                  value={[formatOptions.jpeg.quality]}
                  onValueChange={([v]) => updateFormatOption("jpeg", "quality", v)}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="text-sm">Background colour</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formatOptions.jpeg.backgroundColour}
                    onChange={(e) => updateFormatOption("jpeg", "backgroundColour", e.target.value)}
                    className="size-8 rounded border cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{formatOptions.jpeg.backgroundColour}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Used when input has transparency</p>
            </>
          )}

          {targetFormat === "webp" && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Lossless</Label>
                <Switch
                  checked={formatOptions.webp.lossless}
                  onCheckedChange={(v) => updateFormatOption("webp", "lossless", v)}
                />
              </div>
              {!formatOptions.webp.lossless && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Quality</Label>
                    <span className="text-sm font-mono text-muted-foreground tabular-nums">{formatOptions.webp.quality}%</span>
                  </div>
                  <Slider
                    value={[formatOptions.webp.quality]}
                    onValueChange={([v]) => updateFormatOption("webp", "quality", v)}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
              )}
            </>
          )}

          {targetFormat === "avif" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Quality</Label>
                <span className="text-sm font-mono text-muted-foreground tabular-nums">{formatOptions.avif.quality}%</span>
              </div>
              <Slider
                value={[formatOptions.avif.quality]}
                onValueChange={([v]) => updateFormatOption("avif", "quality", v)}
                min={1}
                max={100}
                step={1}
              />
            </div>
          )}

          {targetFormat === "gif" && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Max colours</Label>
                  <span className="text-sm font-mono text-muted-foreground tabular-nums">{formatOptions.gif.maxColours}</span>
                </div>
                <Slider
                  value={[formatOptions.gif.maxColours]}
                  onValueChange={([v]) => updateFormatOption("gif", "maxColours", v)}
                  min={2}
                  max={256}
                  step={1}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm">Quantization</Label>
                <Select
                  value={formatOptions.gif.quantization}
                  onValueChange={(v) => updateFormatOption("gif", "quantization", v as GifOptions["quantization"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rgb565">RGB565 (best quality)</SelectItem>
                    <SelectItem value="rgb444">RGB444 (smaller)</SelectItem>
                    <SelectItem value="rgba4444">RGBA4444 (with transparency)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {targetFormat === "bmp" && (
            <div className="space-y-2">
              <Label className="text-sm">Bit depth</Label>
              <div className="flex gap-2">
                {([24, 32] as const).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => updateFormatOption("bmp", "bitDepth", depth)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      formatOptions.bmp.bitDepth === depth
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    {depth}-bit
                    <span className="block text-xs font-normal opacity-70">
                      {depth === 24 ? "No transparency" : "With alpha"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {targetFormat === "tiff" && (
            <p className="text-sm text-muted-foreground">
              TIFF output is uncompressed. Output files will be large.
            </p>
          )}

          {targetFormat === "ico" && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Multi-size</Label>
                <Switch
                  checked={formatOptions.ico.multiSize}
                  onCheckedChange={(v) => {
                    setFormatOptions((prev) => ({
                      ...prev,
                      ico: {
                        ...prev.ico,
                        multiSize: v,
                        sizes: v ? [16, 32, 48, 64, 128, 256] : [prev.ico.sizes[0] || 32],
                      },
                    }));
                  }}
                />
              </div>
              {!formatOptions.ico.multiSize ? (
                <div className="space-y-2">
                  <Label className="text-sm">Icon size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[16, 32, 48, 64, 128, 256].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateFormatOption("ico", "sizes", [s])}
                        className={`px-2 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                          formatOptions.ico.sizes[0] === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Embeds all sizes: {[...formatOptions.ico.sizes].sort((a, b) => a - b).join(", ")}px
                </p>
              )}
            </>
          )}

          {targetFormat === "icns" && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Multi-size</Label>
                <Switch
                  checked={formatOptions.icns.multiSize}
                  onCheckedChange={(v) => {
                    setFormatOptions((prev) => ({
                      ...prev,
                      icns: {
                        ...prev.icns,
                        multiSize: v,
                        sizes: v ? [16, 32, 64, 128, 256, 512, 1024] : [prev.icns.sizes[0] || 128],
                      },
                    }));
                  }}
                />
              </div>
              {!formatOptions.icns.multiSize ? (
                <div className="space-y-2">
                  <Label className="text-sm">Icon size</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[16, 32, 64, 128, 256, 512, 1024].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateFormatOption("icns", "sizes", [s])}
                        className={`px-2 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                          formatOptions.icns.sizes[0] === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Embeds all sizes: {[...formatOptions.icns.sizes].sort((a, b) => a - b).join(", ")}px
                </p>
              )}
            </>
          )}
        </div>

        {/* Resize Card */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resize
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex rounded-lg border overflow-hidden">
            {([
              { value: "original", label: "Original" },
              { value: "custom", label: "Dimensions" },
              { value: "percentage", label: "Scale" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setResize((prev) => ({ ...prev, mode: value }))}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  resize.mode === value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {resize.mode === "original" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scaling className="size-4" />
              <span>Images will keep their original dimensions</span>
            </div>
          )}

          {resize.mode === "custom" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={resize.width || ""}
                    onChange={(e) => setResize((prev) => ({ ...prev, width: Number(e.target.value) }))}
                  />
                </div>
                <button
                  onClick={() => setResize((prev) => ({ ...prev, lockAspectRatio: !prev.lockAspectRatio }))}
                  className={`mt-5 p-2 rounded-lg border transition-colors ${
                    resize.lockAspectRatio
                      ? "bg-primary/10 border-primary text-primary"
                      : "text-muted-foreground hover:border-primary/50"
                  }`}
                  title={resize.lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {resize.lockAspectRatio ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                </button>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={resize.height || ""}
                    onChange={(e) => setResize((prev) => ({ ...prev, height: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {resize.lockAspectRatio
                  ? "Aspect ratio locked — leave one field empty to auto-calculate"
                  : "Aspect ratio unlocked — both dimensions are independent"}
              </p>
            </div>
          )}

          {resize.mode === "percentage" && (
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {[25, 50, 75, 150, 200].map((p) => (
                  <button
                    key={p}
                    onClick={() => setResize((prev) => ({ ...prev, percentage: p }))}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                      resize.percentage === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Custom:</span>
                <Input
                  type="number"
                  value={resize.percentage}
                  onChange={(e) => setResize((prev) => ({ ...prev, percentage: Number(e.target.value) }))}
                  className="w-20 h-8 text-sm"
                  min={1}
                  max={1000}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Presets</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                if (p.width === 0) {
                  setResize((prev) => ({ ...prev, mode: "original" }));
                } else {
                  setResize((prev) => ({
                    ...prev,
                    mode: "custom",
                    width: p.width,
                    height: p.height,
                    lockAspectRatio: false,
                  }));
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                resize.mode === "custom" && resize.width === p.width && resize.height === p.height && p.width > 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : resize.mode === "original" && p.width === 0
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:border-primary/50"
              }`}
            >
              {p.name}
              {p.width > 0 && <span className="ml-1 opacity-60">{p.width}×{p.height}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Orientation */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orientation</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOrientation(orientation === "cw" ? "none" : "cw")}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                orientation === "cw" ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"
              }`}
              title="Rotate 90° CW"
            >
              <RotateCw className="size-4" />
              <span>CW</span>
            </button>
            <button
              onClick={() => setOrientation(orientation === "ccw" ? "none" : "ccw")}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                orientation === "ccw" ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"
              }`}
              title="Rotate 90° CCW"
            >
              <RotateCcw className="size-4" />
              <span>CCW</span>
            </button>
            <button
              onClick={() => setOrientation(orientation === "fliph" ? "none" : "fliph")}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                orientation === "fliph" ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"
              }`}
              title="Flip horizontal"
            >
              <ArrowLeftRight className="size-4" />
              <span>H-Flip</span>
            </button>
            <button
              onClick={() => setOrientation(orientation === "flipv" ? "none" : "flipv")}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                orientation === "flipv" ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"
              }`}
              title="Flip vertical"
            >
              <ArrowUpDown className="size-4" />
              <span>V-Flip</span>
            </button>
          </div>
          {orientation !== "none" && (
            <button
              onClick={() => setOrientation("none")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset orientation
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
            <div className="flex-1 h-px bg-border" />
            <div className="flex gap-1">
              {(["grayscale", "sepia", "invert"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilters((prev) => ({ ...prev, [f]: !prev[f] }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    filters[f] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {([
            { key: "brightness" as const, label: "Brightness", min: 0, max: 200 },
            { key: "contrast" as const, label: "Contrast", min: 0, max: 200 },
            { key: "saturation" as const, label: "Saturation", min: 0, max: 200 },
          ]).map(({ key, label, min, max }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">{filters[key]}%</span>
              </div>
              <Slider
                value={[filters[key]]}
                onValueChange={([v]) => setFilters((prev) => ({ ...prev, [key]: v }))}
                min={min}
                max={max}
                step={1}
              />
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                showOriginal ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {showOriginal ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              {showOriginal ? "Showing original size" : "Compare sizes"}
            </button>
            {(filters.grayscale || filters.sepia || filters.invert || filters.brightness !== 100 || filters.contrast !== 100 || filters.saturation !== 100) && (
              <button
                onClick={() => setFilters({ grayscale: false, sepia: false, invert: false, brightness: 100, contrast: 100, saturation: 100 })}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">
              {images.length} image{images.length !== 1 ? "s" : ""} selected
            </h3>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>

          <div className="grid gap-3">
            {images.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="size-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold"
            onClick={convertImages}
            disabled={converting}
          >
            {converting ? (
              "Converting..."
            ) : (
              <>
                <ImageIcon className="size-5 mr-2" />
                Convert to {targetFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Converted Results */}
      {converted.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Converted</h3>
            <div className="flex items-center gap-2">
              {showOriginal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOriginal(false)}
                >
                  <EyeOff className="size-4 mr-1.5" />
                  Hide original
                </Button>
              )}
              {converted.length >= 2 && (
                <Button variant="outline" onClick={downloadAllAsZip}>
                  <Archive className="size-4 mr-2" />
                  Download All as ZIP
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            {converted.map((img, idx) => {
              const originalFile = images[idx];
              return (
                <div
                  key={img.url}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="size-12 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {img.targetFormat === "ico" || img.targetFormat === "icns" || img.targetFormat === "bmp" || img.targetFormat === "tiff" ? (
                      <ImageIcon className="size-6 text-muted-foreground" />
                    ) : (
                      <img
                        src={img.url}
                        alt={img.name}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{img.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatSize(img.size)}</span>
                      {originalFile && (
                        <span className="text-xs opacity-60">
                          was {formatSize(originalFile.size)}
                          {showOriginal && (
                            <button
                              onClick={() => setShowOriginal(true)}
                              className="ml-1 text-primary hover:underline"
                            >
                              <Eye className="size-3 inline" />
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyAsDataUrl(img)}
                      title="Copy as data URL"
                    >
                      {copiedUrl === img.url ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                    <Button size="sm" onClick={() => downloadImage(img)}>
                      <Download className="size-4 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
