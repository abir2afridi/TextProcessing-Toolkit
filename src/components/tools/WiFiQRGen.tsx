import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OptionRow } from "@/components/ToolShell";
import QRCode from "qrcode";

const encOptions = [
  { value: "WPA", label: "WPA/WPA2" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "None" },
];

export default function WiFiQRGen() {
  const [ssid, setSsid] = useState("MyWiFi");
  const [password, setPassword] = useState("secret123");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [dataUrl, setDataUrl] = useState("");

  const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};${hidden ? "H:true;" : ""};`;

  useEffect(() => {
    if (!ssid.trim()) { setDataUrl(""); return; }
    QRCode.toDataURL(wifiString, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [wifiString, ssid]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">ssid</Label>
          <Input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="Network name" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">password</Label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">encryption</Label>
          <select value={encryption} onChange={(e) => setEncryption(e.target.value)}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
          >
            {encOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={hidden} onCheckedChange={setHidden} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">hidden</Label>
        </div>
      </OptionRow>
      <div className="flex flex-col items-center gap-4">
        <div className="inline-block rounded-sm border border-border bg-surface p-4">
          {dataUrl ? (
            <img src={dataUrl} alt="WiFi QR Code" style={{ width: 300, height: 300 }} />
          ) : (
            <div className="grid h-[300px] w-[300px] place-items-center font-mono text-xs text-muted-foreground">
              {ssid.trim() ? "generating…" : "enter SSID"}
            </div>
          )}
        </div>
        <div className="w-full max-w-md rounded-sm border border-border bg-surface p-3">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">generated string</Label>
          <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{wifiString}</p>
        </div>
      </div>
    </div>
  );
}
