import { useState, useCallback } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Base64File() {
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const [encInput, setEncInput] = useState("");
  const [encOutput, setEncOutput] = useState("");
  const [decInput, setDecInput] = useState("");
  const [decOutput, setDecOutput] = useState("");

  const onFileDrop = useCallback(async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      setEncInput(file.name);
      setEncOutput(btoa(bin));
      toast.success(`Encoded ${file.name}`);
    } catch { toast.error("Failed to read file"); }
  }, []);

  const decodeBase64 = () => {
    try {
      const bin = atob(decInput);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decoded-file";
      a.click();
      URL.revokeObjectURL(url);
      setDecOutput(`Decoded ${blob.size} bytes — download started`);
      toast.success("File downloaded");
    } catch { setDecOutput("[error] Invalid base64 input"); }
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <Button size="sm" variant={mode === "enc" ? "default" : "ghost"} onClick={() => setMode("enc")} className="h-7 rounded-sm font-mono text-[11px]">Encode File → Base64</Button>
        <Button size="sm" variant={mode === "dec" ? "default" : "ghost"} onClick={() => setMode("dec")} className="h-7 rounded-sm font-mono text-[11px]">Decode Base64 → File</Button>
      </OptionRow>
      {mode === "enc" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <IOPanel
            label="File"
            value={encInput || ""}
            onChange={(v) => { setEncInput(v); }}
            placeholder="Drop a file here or click upload..."
            fileAccept="*/*"
          />
          <IOPanel label="Base64" value={encOutput} readOnly />
        </div>
      ) : (
        <div className="space-y-4">
          <IOPanel label="Base64 Input" value={decInput} onChange={setDecInput} placeholder="Paste base64 string..." />
          <OptionRow>
            <Button size="sm" onClick={decodeBase64} className="h-7 rounded-sm font-mono text-[11px]">Decode & Download</Button>
          </OptionRow>
          {decOutput && <IOPanel label="Result" value={decOutput} readOnly />}
        </div>
      )}
    </div>
  );
}
