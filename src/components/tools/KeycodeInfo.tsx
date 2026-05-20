import { useState, useEffect } from "react";

interface KeyData {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  charCode: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  location: number;
}

const fields: { key: keyof KeyData; label: string }[] = [
  { key: "key", label: "key" },
  { key: "code", label: "code" },
  { key: "keyCode", label: "keyCode" },
  { key: "which", label: "which" },
  { key: "charCode", label: "charCode" },
  { key: "altKey", label: "altKey" },
  { key: "ctrlKey", label: "ctrlKey" },
  { key: "shiftKey", label: "shiftKey" },
  { key: "metaKey", label: "metaKey" },
  { key: "location", label: "location" },
];

export default function KeycodeInfo() {
  const [keyData, setKeyData] = useState<KeyData | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      setKeyData({
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        charCode: e.charCode,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        location: e.location,
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      {keyData ? (
        <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ key, label }) => (
            <div key={key} className="rounded-sm border border-border bg-surface p-4 text-center">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="font-mono text-lg font-bold text-primary">
                {typeof keyData[key] === "boolean" ? (keyData[key] ? "true" : "false") : String(keyData[key])}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center font-mono text-sm text-muted-foreground">
          <div className="mb-2 text-4xl">⌨</div>
          Press any key
        </div>
      )}
    </div>
  );
}
