import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";

interface UAResult {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  engine: string;
  device: string;
}

function parseUA(ua: string): UAResult {
  const r: UAResult = { browser: "Unknown", browserVersion: "", os: "Unknown", osVersion: "", engine: "Unknown", device: "Desktop" };
  const lower = ua.toLowerCase();

  // Engine
  if (/applewebkit/.test(lower)) {
    r.engine = /applewebkit\/([\d.]+)/i.exec(ua)?.[1] || "WebKit";
    if (/gecko\//.test(lower) && /firefox/.test(lower)) r.engine = "Gecko";
  }
  if (/trident/.test(lower)) r.engine = "Trident";
  if (/Gecko\//.test(ua) && !/like Gecko/.test(ua)) r.engine = "Gecko";

  // Browser
  if (/Edg\//i.test(ua)) { r.browser = "Edge"; r.browserVersion = /Edg\/([\d.]+)/i.exec(ua)?.[1] || ""; }
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) { r.browser = "Opera"; r.browserVersion = /OPR\/([\d.]+)/i.exec(ua)?.[1] || ""; }
  else if (/Firefox/i.test(ua)) { r.browser = "Firefox"; r.browserVersion = /Firefox\/([\d.]+)/i.exec(ua)?.[1] || ""; }
  else if (/Chrome/i.test(ua)) { r.browser = "Chrome"; r.browserVersion = /Chrome\/([\d.]+)/i.exec(ua)?.[1] || ""; }
  else if (/Safari/i.test(ua)) { r.browser = "Safari"; r.browserVersion = /Version\/([\d.]+)/i.exec(ua)?.[1] || ""; }
  else if (/MSIE/i.test(ua) || /Trident/i.test(ua)) { r.browser = "Internet Explorer"; r.browserVersion = /MSIE ([\d.]+)/i.exec(ua)?.[1] || /rv:([\d.]+)/i.exec(ua)?.[1] || ""; }

  // OS
  if (/windows nt (\d+\.?\d*)/i.test(ua)) {
    r.os = "Windows";
    const v = /windows nt (\d+\.?\d*)/i.exec(ua)?.[1];
    const map: Record<string, string> = { "10.0": "10", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista", "5.2": "XP x64", "5.1": "XP" };
    r.osVersion = map[v || ""] || v || "";
  } else if (/mac os x ([\d_.]+)/i.test(ua)) {
    r.os = "macOS";
    r.osVersion = /mac os x ([\d_.]+)/i.exec(ua)?.[1]?.replace(/_/g, ".") || "";
  } else if (/android ([\d.]+)/i.test(ua)) {
    r.os = "Android";
    r.osVersion = /android ([\d.]+)/i.exec(ua)?.[1] || "";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    r.os = "iOS";
    r.osVersion = /os ([\d_]+)/i.exec(ua)?.[1]?.replace(/_/g, ".") || "";
  } else if (/linux/i.test(ua)) { r.os = "Linux"; }

  // Device
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(lower)) r.device = "Mobile";
  else if (/tablet|ipad|android(?!.*mobile)|kindle|silk/i.test(lower)) r.device = "Tablet";

  return r;
}

const fields: { key: keyof UAResult; label: string }[] = [
  { key: "browser", label: "Browser" },
  { key: "browserVersion", label: "Browser Version" },
  { key: "os", label: "OS" },
  { key: "osVersion", label: "OS Version" },
  { key: "engine", label: "Engine" },
  { key: "device", label: "Device Type" },
];

export default function UserAgentParser() {
  const [input, setInput] = useState(navigator.userAgent);
  const result = useMemo(() => { try { return parseUA(input); } catch { return null; } }, [input]);

  return (
    <div className="space-y-4">
      <IOPanel label="User-Agent String" value={input} onChange={setInput} rows={4} />
      {result && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ key, label }) => (
            <div key={key} className="rounded-sm border border-border bg-surface p-3">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="font-mono text-xs text-foreground">{result[key] || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
