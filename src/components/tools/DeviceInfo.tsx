import { useState, useEffect } from "react";

interface DeviceData {
  userAgent: string;
  platform: string;
  language: string;
  languages: string;
  cookiesEnabled: string;
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  orientation: string;
  deviceMemory: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  online: boolean;
  javaEnabled: string;
  doNotTrack: string;
  timezone: string;
  timezoneOffset: number;
}

function collect(): DeviceData {
  const n = navigator;
  const s = screen;
  const d = {
    userAgent: n.userAgent,
    platform: (n as any).platform || "N/A",
    language: n.language,
    languages: n.languages.join(", "),
    cookiesEnabled: n.cookieEnabled ? "Yes" : "No",
    screenWidth: s.width,
    screenHeight: s.height,
    availWidth: s.availWidth,
    availHeight: s.availHeight,
    colorDepth: s.colorDepth,
    pixelDepth: s.pixelDepth,
    orientation: (s as any).orientation?.type || "N/A",
    deviceMemory: (n as any).deviceMemory ? `${(n as any).deviceMemory} GB` : "N/A",
    hardwareConcurrency: n.hardwareConcurrency,
    maxTouchPoints: n.maxTouchPoints,
    online: n.onLine,
    javaEnabled: (n as any).javaEnabled?.() ? "Yes" : "No",
    doNotTrack: (n as any).doNotTrack || "unspecified",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
  };
  return d;
}

const fields: { key: keyof DeviceData; label: string }[] = [
  { key: "userAgent", label: "User Agent" },
  { key: "platform", label: "Platform" },
  { key: "language", label: "Language" },
  { key: "languages", label: "Languages" },
  { key: "cookiesEnabled", label: "Cookies Enabled" },
  { key: "screenWidth", label: "Screen Width" },
  { key: "screenHeight", label: "Screen Height" },
  { key: "availWidth", label: "Available Width" },
  { key: "availHeight", label: "Available Height" },
  { key: "colorDepth", label: "Color Depth" },
  { key: "pixelDepth", label: "Pixel Depth" },
  { key: "orientation", label: "Orientation" },
  { key: "deviceMemory", label: "Device Memory" },
  { key: "hardwareConcurrency", label: "CPU Cores" },
  { key: "maxTouchPoints", label: "Max Touch Points" },
  { key: "online", label: "Online" },
  { key: "javaEnabled", label: "Java Enabled" },
  { key: "doNotTrack", label: "Do Not Track" },
  { key: "timezone", label: "Timezone" },
  { key: "timezoneOffset", label: "Timezone Offset (min)" },
];

export default function DeviceInfo() {
  const [data, setData] = useState<DeviceData>(collect);
  useEffect(() => {
    const onResize = () => setData(collect());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="rounded-sm border border-border bg-surface p-3">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="break-all font-mono text-xs text-foreground">
              {typeof data[key] === "boolean" ? (data[key] as boolean ? "Yes" : "No") : String(data[key])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
