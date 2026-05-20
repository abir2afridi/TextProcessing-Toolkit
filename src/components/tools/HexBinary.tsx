import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { encoders } from "@/lib/text-utils";

export default function HexBinary() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"hex-enc" | "hex-dec" | "bin-enc" | "bin-dec">("hex-enc");
  const output = useMemo(() => {
    try {
      switch (mode) {
        case "hex-enc": return encoders.hexEncode(input);
        case "hex-dec": return encoders.hexDecode(input);
        case "bin-enc": return encoders.binaryEncode(input);
        case "bin-dec": return encoders.binaryDecode(input);
      }
    } catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input, mode]);

  const opts: { id: typeof mode; label: string }[] = [
    { id: "hex-enc", label: "Text → Hex" },
    { id: "hex-dec", label: "Hex → Text" },
    { id: "bin-enc", label: "Text → Binary" },
    { id: "bin-dec", label: "Binary → Text" },
  ];

  return (
    <div className="space-y-4">
      <OptionRow>
        {opts.map((o) => (
          <Button key={o.id} size="sm" variant={mode === o.id ? "default" : "ghost"} onClick={() => setMode(o.id)} className="h-7 rounded-sm font-mono text-[11px]">
            {o.label}
          </Button>
        ))}
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
