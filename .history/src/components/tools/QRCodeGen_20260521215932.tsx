import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

const levels = [
  { value: "low" as const, label: "low" },
  { value: "medium" as const, label: "medium" },
  { value: "quartile" as const, label: "quartile" },
  { value: "high" as const, label: "high" },
];

export default function QRCodeGen() {
  const [text, setText] = useState("https://it-tools.tech");
  const [foreground, setForeground] = useState("#000000ff");
  const [background, setBackground] = useState("#ffffffff");
  const [errorLevel, setErrorLevel] = useState("medium");
  const [dataUrl, setDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) { setDataUrl(""); return; }
    QRCode.toDataURL(text.trim(), {
      width: 1024,
      color: { dark: foreground, light: background },
      errorCorrectionLevel: errorLevel as "L" | "M" | "Q" | "H",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [text, foreground, background, errorLevel]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = dataUrl;
    link.click();
    toast.success("QR code downloaded");
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">text / url</Label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Your link or text..." className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">foreground</Label>
          <input type="color" value={foreground.slice(0, 7)} onChange={(e) => setForeground(e.target.value + "ff")} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">background</Label>
          <input type="color" value={background.slice(0, 7)} onChange={(e) => setBackground(e.target.value + "ff")} className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">ecc</Label>
          <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value)}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </OptionRow>
      <div className="flex flex-col items-center gap-3">
        {dataUrl ? (
          <div className="inline-block rounded-sm border border-border bg-surface p-4">
            <img src={dataUrl} alt="QR Code" width={200} />
          </div>
        ) : (
          <div className="grid h-[200px] w-[200px] place-items-center rounded-sm border border-dashed border-border font-mono text-xs text-muted-foreground">
            {text.trim() ? "error generating" : "enter text to generate"}
          </div>
        )}
        <Button size="sm" disabled={!dataUrl} onClick={handleDownload} className="h-8 rounded-sm font-mono text-xs">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download qr-code
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
