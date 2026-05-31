import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Mode = "mask" | "base64enc" | "base64dec" | "rot13" | "reverse" | "xor" | "hexenc" | "hexdec";

function obfuscateString(str: string, replacementChar: string, keepFirst: number, keepLast: number, keepSpace: boolean) {
  return str
    .split("")
    .map((char, index, array) => {
      if (keepSpace && char === " ") return char;
      return index < keepFirst || index >= array.length - keepLast ? char : replacementChar;
    })
    .join("");
}

export default function StringObfuscator() {
  const [input, setInput] = useState("Lorem ipsum dolor sit amet");
  const [mode, setMode] = useState<Mode>("mask");
  const [xorKey, setXorKey] = useState("key");
  const [keepFirst, setKeepFirst] = useState(4);
  const [keepLast, setKeepLast] = useState(4);
  const [keepSpace, setKeepSpace] = useState(true);
  const [replacementChar, setReplacementChar] = useState("*");

  const output = useMemo(() => {
    try {
      switch (mode) {
        case "mask": return obfuscateString(input, replacementChar, keepFirst, keepLast, keepSpace);
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
  }, [input, mode, xorKey, keepFirst, keepLast, keepSpace, replacementChar]);

  const modes: { value: Mode; label: string }[] = [
    { value: "mask", label: "Mask" },
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
      <OptionRow className="flex-wrap">
        {modes.map((m) => (
          <Button key={m.value} size="sm" variant={mode === m.value ? "default" : "ghost"} onClick={() => setMode(m.value)} className="h-7 rounded-sm font-mono text-[11px]">{m.label}</Button>
        ))}
      </OptionRow>

      {mode === "mask" && (
        <OptionRow>
          <div className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Keep first:</Label>
            <Input type="number" min={0} value={keepFirst} onChange={(e) => setKeepFirst(Math.max(0, Number(e.target.value) || 0))} className="h-7 w-20 rounded-sm font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Keep last:</Label>
            <Input type="number" min={0} value={keepLast} onChange={(e) => setKeepLast(Math.max(0, Number(e.target.value) || 0))} className="h-7 w-20 rounded-sm font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Char:</Label>
            <Input value={replacementChar} onChange={(e) => setReplacementChar(e.target.value || "*")} className="h-7 w-10 rounded-sm font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={keepSpace} onCheckedChange={setKeepSpace} />
            <Label className="font-mono text-[11px] text-muted-foreground">Keep spaces</Label>
          </div>
        </OptionRow>
      )}

      {mode === "xor" && (
        <OptionRow>
          <div className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">key</Label>
            <Input value={xorKey} onChange={(e) => setXorKey(e.target.value)} className="h-7 w-28 rounded-sm font-mono text-xs" />
          </div>
        </OptionRow>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
