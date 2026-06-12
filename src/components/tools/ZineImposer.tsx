import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Upload,
  Download,
  X,
  Maximize,
  Minimize,
  GripVertical,
  Info,
  BookOpen,
  Scissors,
  RotateCw,
  Printer,
  StepForward,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PaperSizeCombobox } from "@/components/ui/paper-size-combobox";
import { findPaperSize } from "@/lib/paper-sizes";
import { cn } from "@/lib/utils";
import { PDFDocument, degrees } from "pdf-lib";
import { PAPER_SIZES, MM_TO_POINTS } from "@/lib/imposition";
import {
  ZINE_FOLDS,
  buildFoldLayout,
  getFoldOption,
  type ZineFoldId,
  type ZineFoldLayout,
  type ZineSide,
} from "@/lib/zine-folds";
import { useFilePaste } from "@/hooks/use-file-paste";

interface ZineImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  fitMode: "fit" | "fill";
}

const DPI_OPTIONS = [72, 150, 300, 600];

function FoldGlyph({ id, className }: { id: ZineFoldId; className?: string }) {
  if (id === "accordion") {
    return (
      <svg viewBox="0 0 44 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden="true">
        <polyline points="3,23 11,5 19,23 27,5 35,23 42,9" />
      </svg>
    );
  }
  if (id === "mini-8") {
    return (
      <svg viewBox="0 0 44 28" fill="none" stroke="currentColor" className={className} aria-hidden="true">
        <rect x="2" y="2" width="40" height="24" rx="2.5" strokeWidth={1.6} />
        <path d="M12 2v24M22 2v24M32 2v24M2 14h40" strokeWidth={1} opacity={0.55} />
        <path d="M12 14h20" strokeWidth={2.6} strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

function SegmentedControl<T extends string | number>({
  options, value, onChange, ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel}
      className="grid h-9 rounded-md border border-input overflow-hidden"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt, i) => (
        <button key={String(opt.value)} type="button" role="radio" aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn("text-sm font-medium transition-colors", i > 0 && "border-l border-input",
            value === opt.value ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ZineImposer() {
  const [foldId, setFoldId] = useState<ZineFoldId>("mini-8");
  const [panels, setPanels] = useState(8);
  const [doubleSided, setDoubleSided] = useState(false);
  const [split, setSplit] = useState(false);

  const layout: ZineFoldLayout = useMemo(
    () => buildFoldLayout(foldId, { panels, doubleSided, split }),
    [foldId, panels, doubleSided, split]
  );
  const foldOption = getFoldOption(foldId);
  const pageCount = layout.pageCount;
  const duplexLabel = layout.duplexFlip === "long-edge" ? "long edge" : "short edge";

  const [images, setImages] = useState<(ZineImage | null)[]>(() => Array(pageCount).fill(null));
  const [paperSizeId, setPaperSizeId] = useState("a4");
  const [customPaperW, setCustomPaperW] = useState(320);
  const [customPaperH, setCustomPaperH] = useState(450);

  const paperSize = paperSizeId === "custom"
    ? { id: "custom" as const, label: `Custom (${customPaperW} × ${customPaperH} mm)`, widthMm: customPaperW, heightMm: customPaperH }
    : findPaperSize(paperSizeId) ?? PAPER_SIZES[0];

  const [bleedEnabled, setBleedEnabled] = useState(false);
  const [selectedDpi, setSelectedDpi] = useState(300);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showFoldLines, setShowFoldLines] = useState(true);
  const [showCutLines, setShowCutLines] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [isExportingPreview, setIsExportingPreview] = useState(false);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    setImages((prev) => {
      if (prev.length === pageCount) return prev;
      for (let i = pageCount; i < prev.length; i++) {
        if (prev[i]) loadedImagesRef.current.delete(prev[i]!.id);
      }
      const next = Array<ZineImage | null>(pageCount).fill(null);
      for (let i = 0; i < Math.min(prev.length, pageCount); i++) next[i] = prev[i];
      return next;
    });
  }, [pageCount]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const loadImage = (file: File): Promise<ZineImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const id = generateId();
          loadedImagesRef.current.set(id, img);
          resolve({ id, dataUrl: reader.result as string, width: img.width, height: img.height, fitMode: "fill" });
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (index: number, files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    try {
      const zineImage = await loadImage(file);
      setImages((prev) => { const n = [...prev]; n[index] = zineImage; return n; });
    } catch { /* skip */ }
  };

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newImages = [...images];
    let slotIndex = 0;
    for (const file of imageFiles) {
      while (slotIndex < newImages.length && newImages[slotIndex] !== null) slotIndex++;
      if (slotIndex >= newImages.length) break;
      try {
        newImages[slotIndex] = await loadImage(file);
        slotIndex++;
      } catch { /* skip */ }
    }
    setImages(newImages);
  };

  useFilePaste(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const zineImage = await loadImage(file);
      setImages((prev) => {
        const idx = prev.findIndex((img) => img === null);
        if (idx === -1) return prev;
        const n = [...prev];
        n[idx] = zineImage;
        return n;
      });
    } catch { /* ignore */ }
  }, "image/*");

  const removeImage = (index: number) => {
    setImages((prev) => {
      const n = [...prev];
      if (n[index]) loadedImagesRef.current.delete(n[index]!.id);
      n[index] = null;
      return n;
    });
  };

  const toggleFitMode = (index: number) => {
    setImages((prev) => {
      const n = [...prev];
      if (n[index]) n[index] = { ...n[index]!, fitMode: n[index]!.fitMode === "fit" ? "fill" : "fit" };
      return n;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!images[index]) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex === index) return;
    setDragOverIndex(index);
    e.dataTransfer.dropEffect = draggedIndex !== null ? "move" : "copy";
  };

  const handleDragLeave = () => setDragOverIndex(null);

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const files = e.dataTransfer.files;
    if (files?.length) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        try {
          const zineImage = await loadImage(file);
          setImages((prev) => { const n = [...prev]; n[targetIndex] = zineImage; return n; });
        } catch { /* skip */ }
      }
      setDraggedIndex(null);
      return;
    }
    if (draggedIndex === null || draggedIndex === targetIndex) { setDraggedIndex(null); return; }
    setImages((prev) => { const n = [...prev]; const a = n[draggedIndex]; n[draggedIndex] = n[targetIndex]; n[targetIndex] = a; return n; });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };

  const drawImageOnCanvas = (
    ctx: CanvasRenderingContext2D, img: HTMLImageElement,
    targetX: number, targetY: number, targetWidth: number, targetHeight: number,
    fitMode: "fit" | "fill", rotation: number
  ) => {
    ctx.save();
    const cx = targetX + targetWidth / 2;
    const cy = targetY + targetHeight / 2;
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    const imgAspect = img.width / img.height;
    const targetAspect = targetWidth / targetHeight;
    let dw: number, dh: number, sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (fitMode === "fit") {
      if (imgAspect > targetAspect) { dw = targetWidth; dh = targetWidth / imgAspect; }
      else { dh = targetHeight; dw = targetHeight * imgAspect; }
    } else {
      dw = targetWidth; dh = targetHeight;
      if (imgAspect > targetAspect) { sw = img.height * targetAspect; sx = (img.width - sw) / 2; }
      else { sh = img.width / targetAspect; sy = (img.height - sh) / 2; }
    }
    ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  };

  const drawGuides = (ctx: CanvasRenderingContext2D, side: ZineSide, w: number, h: number) => {
    if (showFoldLines) {
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 4]);
      for (const fold of layout.foldLines) {
        ctx.beginPath();
        if (fold.axis === "v") { const x = fold.pos * w; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        else { const y = fold.pos * h; ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (showCutLines && side.side === "front" && layout.cutLines.length > 0) {
      ctx.strokeStyle = "#cc0000";
      ctx.lineWidth = 2;
      for (const cut of layout.cutLines) {
        ctx.beginPath();
        ctx.moveTo(cut.x1 * w, cut.y1 * h);
        ctx.lineTo(cut.x2 * w, cut.y2 * h);
        ctx.stroke();
        const mx = ((cut.x1 + cut.x2) / 2) * w;
        const my = ((cut.y1 + cut.y2) / 2) * h;
        ctx.fillStyle = "#cc0000";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("✂ CUT", mx, my - 6);
      }
    }
  };

  const drawPageNumbersBadge = (ctx: CanvasRenderingContext2D, side: ZineSide, cw: number, ch: number) => {
    if (!showPageNumbers) return;
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of side.placements) {
      const x = p.col * cw + cw / 2;
      const y = p.row * ch + ch / 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(p.page.toString(), 0, 0);
      ctx.restore();
    }
  };

  const generatePreview = useCallback(async () => {
    const hasImages = images.some((img) => img !== null);
    if (!hasImages) { setPreviews([]); return; }
    const loadPromises = images.map((img) => {
      if (!img) return Promise.resolve();
      if (loadedImagesRef.current.has(img.id)) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const htmlImg = new Image();
        htmlImg.onload = () => { loadedImagesRef.current.set(img.id, htmlImg); resolve(); };
        htmlImg.onerror = () => resolve();
        htmlImg.src = img.dataUrl;
      });
    });
    await Promise.all(loadPromises);

    const scale = 2;
    const sheetWPx = Math.max(paperSize.widthMm, paperSize.heightMm) * scale;
    const sheetHPx = Math.min(paperSize.widthMm, paperSize.heightMm) * scale;
    const cellWPx = sheetWPx / layout.cols;
    const cellHPx = sheetHPx / layout.rows;
    const result: string[] = [];

    for (const side of layout.sides) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = sheetWPx;
      canvas.height = sheetHPx;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sheetWPx, sheetHPx);

      for (const p of side.placements) {
        const zi = images[p.page - 1];
        if (!zi) continue;
        const htmlImg = loadedImagesRef.current.get(zi.id);
        if (!htmlImg) continue;
        drawImageOnCanvas(ctx, htmlImg, p.col * cellWPx, p.row * cellHPx, cellWPx, cellHPx, zi.fitMode, p.rotation);
      }

      drawGuides(ctx, side, sheetWPx, sheetHPx);
      drawPageNumbersBadge(ctx, side, cellWPx, cellHPx);
      result.push(canvas.toDataURL());
    }

    setPreviews(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, paperSize, layout, showFoldLines, showCutLines, showPageNumbers]);

  useEffect(() => { generatePreview(); }, [generatePreview]);

  const cropImageToAspect = (img: HTMLImageElement, targetAspect: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const imgAspect = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgAspect > targetAspect) { sw = img.height * targetAspect; sx = (img.width - sw) / 2; }
      else { sh = img.width / targetAspect; sy = (img.height - sh) / 2; }
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL("image/png"));
    });
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const sheetWPt = Math.max(paperSize.widthMm, paperSize.heightMm) * MM_TO_POINTS;
      const sheetHPt = Math.min(paperSize.widthMm, paperSize.heightMm) * MM_TO_POINTS;
      const cellWPt = sheetWPt / layout.cols;
      const cellHPt = sheetHPt / layout.rows;
      const targetAspect = cellWPt / cellHPt;

      for (const side of layout.sides) {
        const page = pdfDoc.addPage([sheetWPt, sheetHPt]);
        for (const p of side.placements) {
          const zi = images[p.page - 1];
          if (!zi) continue;
          const htmlImg = loadedImagesRef.current.get(zi.id);
          let dataUrl = zi.dataUrl;
          if (zi.fitMode === "fill" && htmlImg) dataUrl = await cropImageToAspect(htmlImg, targetAspect);
          const imgBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
          let em;
          try {
            em = dataUrl.includes("image/png") ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
          } catch {
            try { em = await pdfDoc.embedJpg(imgBytes); } catch { em = await pdfDoc.embedPng(imgBytes); }
          }
          let dw: number, dh: number;
          if (zi.fitMode === "fit") {
            const ia = em.width / em.height;
            if (ia > targetAspect) { dw = cellWPt; dh = cellWPt / ia; }
            else { dh = cellHPt; dw = cellHPt * ia; }
          } else { dw = cellWPt; dh = cellHPt; }
          const cx = p.col * cellWPt;
          const cy = (layout.rows - 1 - p.row) * cellHPt;
          const ox = (cellWPt - dw) / 2;
          const oy = (cellHPt - dh) / 2;
          if (p.rotation === 180) {
            page.drawImage(em, { x: cx + cellWPt - ox, y: cy + cellHPt - oy, width: dw, height: dh, rotate: degrees(180) });
          } else {
            page.drawImage(em, { x: cx + ox, y: cy + oy, width: dw, height: dh });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `zine-${foldId}-${paperSize.id}${layout.sides.length > 1 ? "-duplex" : ""}${bleedEnabled ? "-bleed" : ""}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPreviewAsPng = async () => {
    setIsExportingPreview(true);
    try {
      for (let i = 0; i < previews.length; i++) {
        const side = layout.sides[i];
        const link = document.createElement("a");
        link.href = previews[i];
        link.download = `zine-${foldId}-${paperSize.id}${layout.sides.length > 1 ? `-${side.side}` : ""}.png`;
        link.click();
      }
    } finally {
      setIsExportingPreview(false);
    }
  };

  const clearAll = () => {
    loadedImagesRef.current.clear();
    setImages(Array(pageCount).fill(null));
  };

  const imageCount = images.filter((img) => img !== null).length;
  const sheetWMm = Math.max(paperSize.widthMm, paperSize.heightMm);
  const sheetHMm = Math.min(paperSize.widthMm, paperSize.heightMm);
  const pW = sheetWMm / layout.cols;
  const pH = sheetHMm / layout.rows;
  const pWPx = Math.round((pW / 25.4) * selectedDpi);
  const pHPx = Math.round((pH / 25.4) * selectedDpi);

  return (
    <div className="space-y-8">
      {/* Fold type picker */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Fold type</span>
        <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Fold type">
          {ZINE_FOLDS.map((f) => {
            const selected = f.id === foldId;
            return (
              <button key={f.id} type="button" role="tab" aria-selected={selected}
                onClick={() => setFoldId(f.id)}
                className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  selected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-input bg-card/60 hover:bg-muted")}
              >
                <FoldGlyph id={f.id} className={cn("h-7 w-11 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sheet setup */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Options card */}
        <div className="rounded-lg border bg-card/60 p-4 space-y-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">Options</span>
          <p className="text-sm text-muted-foreground">{foldOption.description}</p>

          {foldOption.configurablePanels || foldOption.supportsDoubleSided || foldOption.supportsSplit ? (
            <div className="space-y-4">
              {foldOption.configurablePanels && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Panels</span>
                  <SegmentedControl ariaLabel="Panels"
                    options={(foldOption.panelOptions ?? []).map((p) => ({ value: p, label: String(p) }))}
                    value={panels} onChange={setPanels} />
                </div>
              )}
              {foldOption.supportsDoubleSided && (
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="double-sided" className="text-sm font-medium cursor-pointer">Double-sided</Label>
                    <p className="text-xs text-muted-foreground">
                      {doubleSided ? `Front + back · print flip on ${duplexLabel}` : "Single side · fold-out strip"}
                    </p>
                  </div>
                  <Switch id="double-sided" checked={doubleSided} onCheckedChange={setDoubleSided} />
                </div>
              )}
              {foldOption.supportsSplit && (
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="split" className="text-sm font-medium cursor-pointer">Split in half (two-up)</Label>
                    <p className="text-xs text-muted-foreground">
                      {split ? "Two copies stacked · cut in half · shorter panels" : "One full-height strip"}
                    </p>
                  </div>
                  <Switch id="split" checked={split} onCheckedChange={setSplit} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Fixed {pageCount}-page layout — no options to set.</p>
          )}

          <SeparatorLine />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block pt-1">Preview guides</span>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-fold" className="text-sm font-medium cursor-pointer">Fold lines</Label>
              <Switch id="show-fold" checked={showFoldLines} onCheckedChange={setShowFoldLines} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-cut" className="text-sm font-medium cursor-pointer">Cut lines</Label>
              <Switch id="show-cut" checked={showCutLines} onCheckedChange={setShowCutLines} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-pages" className="text-sm font-medium cursor-pointer">Page numbers</Label>
              <Switch id="show-pages" checked={showPageNumbers} onCheckedChange={setShowPageNumbers} />
            </div>
          </div>
        </div>

        {/* Sheet & output card */}
        <div className="rounded-lg border bg-card/60 p-4 space-y-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">Sheet &amp; output</span>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Paper size</span>
            <PaperSizeCombobox value={paperSizeId} onValueChange={setPaperSizeId} showCustom triggerClassName="w-full" />
          </div>

          {paperSizeId === "custom" && (
            <div className="flex items-center gap-2">
              <Input type="number" min={50} max={1500} value={customPaperW}
                onChange={(e) => setCustomPaperW(Math.max(50, parseFloat(e.target.value) || 50))} className="w-20 h-8" />
              <span className="text-muted-foreground text-xs">&times;</span>
              <Input type="number" min={50} max={1500} value={customPaperH}
                onChange={(e) => setCustomPaperH(Math.max(50, parseFloat(e.target.value) || 50))} className="w-20 h-8" />
              <span className="text-xs text-muted-foreground">mm</span>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reference DPI</span>
            <SegmentedControl ariaLabel="Reference DPI"
              options={DPI_OPTIONS.map((dpi) => ({ value: dpi, label: String(dpi) }))}
              value={selectedDpi} onChange={setSelectedDpi} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <Label htmlFor="bleed" className="text-sm font-medium cursor-pointer">Add 3mm bleed</Label>
            <Switch id="bleed" checked={bleedEnabled} onCheckedChange={setBleedEnabled} />
          </div>
        </div>
      </div>

      {/* Page dimensions stats strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-dashed px-4 py-2.5 text-sm">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Each page</span>
        <span className="font-mono font-medium">{pW.toFixed(1)} × {pH.toFixed(1)} mm</span>
        <span className="font-mono text-muted-foreground">{pWPx} × {pHPx} px @ {selectedDpi} dpi</span>
        <span className="font-mono text-muted-foreground">{(pW / pH).toFixed(3)}:1</span>
        <span className="font-mono text-muted-foreground">{pW < pH ? "Portrait" : "Landscape"}</span>
      </div>

      {/* Bulk upload zone */}
      <div onDrop={(e) => { e.preventDefault(); handleBulkUpload(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.multiple = true; i.onchange = (e) => handleBulkUpload((e.target as HTMLInputElement).files); i.click(); }}
      >
        <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium">Drop images here to fill empty slots</p>
        <p className="text-sm text-muted-foreground mt-1">or click to select multiple files, or paste</p>
      </div>

      {/* Image grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Zine pages · drag to reorder</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {imageCount}/{pageCount} filled
              {layout.sides.length > 1 && " · " + layout.sides.map((s) => {
                const pages = s.placements.map((p) => p.page);
                return `${s.side} ${Math.min(...pages)}–${Math.max(...pages)}`;
              }).join(", ")}
            </span>
            {imageCount > 0 && <Button variant="ghost" size="sm" onClick={clearAll} className="h-7">Clear all</Button>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={image ? image.id : `empty-${index}`} draggable={!!image}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn("relative aspect-[3/4] border-2 rounded-lg overflow-hidden transition-all",
                image ? "border-solid bg-card cursor-grab active:cursor-grabbing" : "border-dashed hover:border-primary/50 cursor-pointer",
                draggedIndex === index && "opacity-50 border-primary",
                dragOverIndex === index && "border-primary bg-primary/5")}
              onClick={() => { if (!image) fileInputRefs.current[index]?.click(); }}
            >
              <input ref={(el) => { fileInputRefs.current[index] = el; }} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleFileUpload(index, e.target.files)} />
              {image ? (
                <>
                  <img src={image.dataUrl} alt={`Page ${index + 1}`}
                    className={cn("size-full", image.fitMode === "fill" ? "object-cover" : "object-contain")} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 left-2"><GripVertical className="size-5 text-white/80" /></div>
                    <div className="absolute top-2 right-2 size-6 rounded-full bg-black/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                      <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); toggleFitMode(index); }}>
                        {image.fitMode === "fill" ? <><Minimize className="size-3 mr-1" /> Fit</> : <><Maximize className="size-3 mr-1" /> Fill</>}
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); removeImage(index); }}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Upload className="size-6 mb-2" />
                  <span className="text-xs font-medium">Page {index + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="font-bold">Imposition Preview</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                onClick={() => setZoom((z) => Math.max(50, z - 10))} disabled={zoom <= 50}>
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-xs tabular-nums w-9 text-center font-medium">{zoom}%</span>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                onClick={() => setZoom((z) => Math.min(200, z + 10))} disabled={zoom >= 200}>
                <ZoomIn className="size-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={() => setZoom(100)}>
                <Maximize className="size-3" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                onClick={exportPreviewAsPng} disabled={isExportingPreview}>
                <ImageIcon className="size-3.5" />
                {isExportingPreview ? "..." : "PNG"}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {layout.sides.length > 1 ? `Double-sided print. Print both pages, flip on the ${duplexLabel}.` : "Single-sided print."}
            {layout.cutLines.length > 0 && " The red line shows where to cut."}
          </p>

          <div className={cn("grid gap-4", layout.sides.length > 1 && "sm:grid-cols-2")}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 0.15s ease" }}>
            {layout.sides.map((side, i) =>
              previews[i] ? (
                <div key={side.side} className="space-y-1">
                  {layout.sides.length > 1 && (
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{side.side}</span>
                  )}
                  <img src={previews[i]} alt={`Zine imposition preview ${side.side}`} className="w-full border rounded-lg" />
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Download buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="flex-1 h-14 text-lg font-bold"
          onClick={generatePdf} disabled={imageCount === 0 || isGenerating}
        >
          {isGenerating ? "Generating PDF..." : <><Download className="size-5 mr-2" /> Download Zine PDF</>}
        </Button>
      </div>

      {/* Folding instructions */}
      <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/50 rounded-lg">
        <p className="font-medium text-foreground">How to fold your zine:</p>
        <ol className="list-decimal list-inside space-y-1">
          {layout.instructions.map((step, i) => (
            <li key={`${i}-${step}`}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SeparatorLine() {
  return <div className="h-px bg-border" />;
}
