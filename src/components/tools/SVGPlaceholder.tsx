import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IOPanel, OptionRow } from "@/components/ToolShell";

export default function SVGPlaceholder() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState("#4ade80");
  const [textColor, setTextColor] = useState("#ffffff");
  const [text, setText] = useState("400x300");
  const [borderRadius, setBorderRadius] = useState(8);

  const svgCode = useMemo(() => {
    const safeText = text || `${width}x${height}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" fill="${bgColor}" />
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${Math.max(0, borderRadius - 1)}" ry="${Math.max(0, borderRadius - 1)}" fill="none" stroke="${bgColor}" stroke-opacity="0.3" />
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="${Math.min(width, height) * 0.08}" fill="${textColor}">${safeText}</text>
</svg>`;
  }, [width, height, bgColor, textColor, text, borderRadius]);

  const dataUrl = useMemo(() => {
    try {
      return `data:image/svg+xml,${encodeURIComponent(svgCode)}`;
    } catch { return ""; }
  }, [svgCode]);

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placeholder-${width}x${height}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">w</Label>
          <Input type="number" min={10} max={2000} value={width} onChange={(e) => setWidth(Number(e.target.value) || 10)} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">h</Label>
          <Input type="number" min={10} max={2000} value={height} onChange={(e) => setHeight(Number(e.target.value) || 10)} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">radius</Label>
          <Input type="number" min={0} max={200} value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value) || 0)} className="h-7 w-16 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">bg</Label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">text</Label>
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
        <Button size="sm" onClick={downloadSvg} className="h-7 rounded-sm font-mono text-[11px]">Download SVG</Button>
      </OptionRow>
      <div className="flex items-center gap-2">
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">text content</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`${width}x${height}`} className="h-8 flex-1 rounded-sm font-mono text-xs" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="SVG code" value={svgCode} readOnly rows={12} />
        <div className="flex flex-col rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            preview
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            {dataUrl ? (
              <img src={dataUrl} alt="SVG placeholder" className="max-w-full rounded-sm" style={{ maxHeight: 400 }} />
            ) : (
              <div className="font-mono text-xs text-muted-foreground">error generating preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
