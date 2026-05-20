import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Mode = "base64enc" | "base64dec" | "rot13" | "reverse" | "xor" | "hexenc" | "hexdec";

export default function StringObfuscator() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("base64enc");
  const [xorKey, setXorKey] = useState("key");
  const output = useMemo(() => {
    try {
      switch (mode) {
        case "base64enc": return btoa(input);
        case "base64dec": return atob(input);
        case "rot13": return input.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        case "reverse": return input.split("").reverse().join("");
        case "xor": {
          if (!xorKey) return input;
          return input.split("").map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) ^ xorKey.charCodeAt(i % xorKey.length))
          ).join("");
        }
        case "hexenc": return Array.from(input).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
        case "hexdec": return input.trim().split(/\s+/).map((h) => String.fromCharCode(parseInt(h, 16))).join("");
      }
    } catch (e) {
      return `[error] ${(e as Error).message}`;
    }
  }, [input, mode, xorKey]);

  const modes: { value: Mode; label: string }[] = [
    { value: "base64enc", label: "Base64 Encode" },
    { value: "base64dec", label: "Base64 Decode" },
    { value: "rot13", label: "ROT13" },
    { value: "reverse", label: "Reverse" },
    { value: "xor", label: "XOR" },
    { value: "hexenc", label: "Hex Encode" },
    { value: "hexdec", label: "Hex Decode" },
  ];

  return (
    <div className="space-y-4">
      <OptionRow>
        {modes.map((m) => (
          <Button key={m.value} size="sm" variant={mode === m.value ? "default" : "ghost"} onClick={() => setMode(m.value)} className="h-7 rounded-sm font-mono text-[11px]">{m.label}</Button>
        ))}
        {mode === "xor" && (
          <div className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">key</Label>
            <Input value={xorKey} onChange={(e) => setXorKey(e.target.value)} className="h-7 w-28 rounded-sm font-mono text-xs" />
          </div>
        )}
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
