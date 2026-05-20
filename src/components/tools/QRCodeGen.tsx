import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { OptionRow } from "@/components/ToolShell";
import QRCode from "qrcode";

const levels = [
  { value: "L" as const, label: "L (7%)" },
  { value: "M" as const, label: "M (15%)" },
  { value: "Q" as const, label: "Q (25%)" },
  { value: "H" as const, label: "H (30%)" },
];

export default function QRCodeGen() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(250);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) { setDataUrl(""); return; }
    const opts = {
      width: size,
      margin: 2,
      color: { dark: darkColor, light: lightColor },
      errorCorrectionLevel: errorLevel,
    };
    QRCode.toDataURL(text, opts)
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [text, size, darkColor, lightColor, errorLevel]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">text / url</Label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL…" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">size</Label>
          <Slider value={[size]} onValueChange={(v) => setSize(v[0])} min={100} max={500} step={10} className="w-32" />
          <span className="font-mono text-[11px] text-muted-foreground">{size}px</span>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">dark</Label>
          <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">light</Label>
          <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">ecc</Label>
          <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </OptionRow>
      <div className="flex justify-center">
        {dataUrl ? (
          <div className="inline-block rounded-sm border border-border bg-surface p-4">
            <img src={dataUrl} alt="QR Code" style={{ width: size, height: size }} />
          </div>
        ) : (
          <div className="grid h-64 w-64 place-items-center rounded-sm border border-dashed border-border font-mono text-xs text-muted-foreground">
            {text.trim() ? "error generating" : "enter text to generate"}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
