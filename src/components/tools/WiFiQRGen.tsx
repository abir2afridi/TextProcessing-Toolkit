import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

const encOptions = [
  { value: "WPA", label: "WPA/WPA2" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "None" },
  { value: "WPA2-EAP", label: "WPA2-EAP" },
];

const EAPMethods = [
  "MD5", "POTP", "GTC", "TLS", "IKEv2", "SIM", "AKA", "AKA'",
  "TTLS", "PWD", "LEAP", "PSK", "FAST", "TEAP", "EKE", "NOOB", "PEAP",
];

const EAPPhase2Methods = ["None", "MSCHAPV2"];

function escapeString(str: string) {
  return str.replace(/([\\;,:"])/g, "\\$1");
}

export default function WiFiQRGen() {
  const [encryption, setEncryption] = useState("WPA");
  const [ssid, setSsid] = useState("MyWiFi");
  const [hidden, setHidden] = useState(false);
  const [password, setPassword] = useState("secret123");
  const [eapMethod, setEapMethod] = useState("PEAP");
  const [eapIdentity, setEapIdentity] = useState("");
  const [eapAnonymous, setEapAnonymous] = useState(false);
  const [eapPhase2Method, setEapPhase2Method] = useState("None");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!ssid.trim()) { setDataUrl(""); return; }

    let wifiStr = "";
    if (encryption === "nopass") {
      wifiStr = `WIFI:S:${escapeString(ssid)};;`;
    } else if (encryption !== "WPA2-EAP" && password) {
      wifiStr = `WIFI:S:${escapeString(ssid)};T:${encryption};P:${escapeString(password)};${hidden ? "H:true" : ""};`;
    } else if (encryption === "WPA2-EAP" && password && eapMethod) {
      if (!eapIdentity && !eapAnonymous) { setDataUrl(""); return; }
      if (eapMethod === "PEAP" && eapPhase2Method === "None") { setDataUrl(""); return; }
      const identity = eapAnonymous ? "A:anon" : `I:${escapeString(eapIdentity)}`;
      const phase2 = eapPhase2Method !== "None" ? `PH2:${eapPhase2Method};` : "";
      wifiStr = `WIFI:S:${escapeString(ssid)};T:WPA2-EAP;P:${escapeString(password)};E:${eapMethod};${phase2}${identity};${hidden ? "H:true" : ""};`;
    }

    if (!wifiStr) { setDataUrl(""); return; }

    QRCode.toDataURL(wifiStr.trim(), {
      width: 1024,
      color: { dark: "#000000ff", light: "#ffffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [encryption, ssid, hidden, password, eapMethod, eapIdentity, eapAnonymous, eapPhase2Method]);

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
      </OptionRow>

      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">ssid</Label>
          <Input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="Your WiFi SSID..." className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={hidden} onCheckedChange={setHidden} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">hidden</Label>
        </div>
      </OptionRow>

      {encryption !== "nopass" && (
        <OptionRow>
          <div className="flex flex-1 items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your WiFi Password..." type="password" className="h-8 flex-1 rounded-sm font-mono text-xs" />
          </div>
        </OptionRow>
      )}

      {encryption === "WPA2-EAP" && (
        <>
          <OptionRow>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">eap method</Label>
              <select value={eapMethod} onChange={(e) => setEapMethod(e.target.value)}
                className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
              >
                {EAPMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </OptionRow>

          <OptionRow>
            <div className="flex flex-1 items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">identity</Label>
              <Input value={eapIdentity} onChange={(e) => setEapIdentity(e.target.value)} placeholder="Your EAP Identity..." className="h-8 flex-1 rounded-sm font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={eapAnonymous} onCheckedChange={setEapAnonymous} />
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">anonymous</Label>
            </div>
          </OptionRow>

          <OptionRow>
            <div className="flex items-center gap-2">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">eap phase 2</Label>
              <select value={eapPhase2Method} onChange={(e) => setEapPhase2Method(e.target.value)}
                className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
              >
                {EAPPhase2Methods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </OptionRow>
        </>
      )}

      <div className="flex flex-col items-center gap-3">
        {dataUrl ? (
          <div className="inline-block rounded-sm border border-border bg-surface p-4">
            <img src={dataUrl} alt="WiFi QR Code" width={200} />
          </div>
        ) : (
          <div className="grid h-[200px] w-[200px] place-items-center rounded-sm border border-dashed border-border font-mono text-xs text-muted-foreground">
            {ssid.trim() ? "enter missing fields" : "enter SSID"}
          </div>
        )}
        <Button size="sm" disabled={!dataUrl} onClick={handleDownload} className="h-8 rounded-sm font-mono text-xs">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download qr-code
        </Button>
      </div>
    </div>
  );
}
