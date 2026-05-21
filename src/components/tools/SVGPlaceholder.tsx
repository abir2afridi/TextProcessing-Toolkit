import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

function textToBase64(str: string) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
}

export default function SVGPlaceholder() {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(350);
  const [fontSize, setFontSize] = useState(26);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [fgColor, setFgColor] = useState("#333333");
  const [borderRadius, setBorderRadius] = useState(8);
  const [useExactSize, setUseExactSize] = useState(true);
  const [customText, setCustomText] = useState("");

  const svgString = useMemo(() => {
    const w = width;
    const h = height;
    const text = customText.length > 0 ? customText : `${w}x${h}`;
    const size = useExactSize ? ` width="${w}" height="${h}"` : "";

    const r = borderRadius;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size}>
  <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${bgColor}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize}px" fill="${fgColor}">${text}</text>
</svg>`;
  }, [width, height, fontSize, bgColor, fgColor, borderRadius, useExactSize, customText]);

  const base64 = useMemo(
    () => `data:image/svg+xml;base64,${textToBase64(svgString)}`,
    [svgString],
  );

  const copySVG = () => {
    navigator.clipboard.writeText(svgString);
    toast.success("SVG copied to clipboard");
  };

  const copyBase64 = () => {
    navigator.clipboard.writeText(base64);
    toast.success("Base64 copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
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
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">width</Label>
          <Input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value) || 1)} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">height</Label>
          <Input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value) || 1)} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">font size</Label>
          <Input type="number" min={1} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 1)} className="h-7 w-16 rounded-sm font-mono text-xs" />
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
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">text color</Label>
          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
      </OptionRow>

      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">custom text</Label>
          <Input value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder={`Default is ${width}x${height}`} className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={useExactSize} onCheckedChange={setUseExactSize} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">use exact size</Label>
        </div>
      </OptionRow>

      <IOPanel label="SVG HTML element" value={svgString} readOnly rows={6} />

      <IOPanel label="SVG in Base64" value={base64} readOnly rows={3} />

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="sm" onClick={copySVG} className="h-8 rounded-sm font-mono text-xs">
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copy svg
        </Button>
        <Button size="sm" onClick={copyBase64} className="h-8 rounded-sm font-mono text-xs">
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copy base64
        </Button>
        <Button size="sm" onClick={download} className="h-8 rounded-sm font-mono text-xs">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download svg
        </Button>
      </div>

      <div className="flex justify-center rounded-sm border border-border bg-surface p-4">
        <img src={base64} alt="SVG placeholder preview" className="max-w-full" />
      </div>
    </div>
  );
}
