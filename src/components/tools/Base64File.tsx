import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, Eye, Download, X, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const mimeExtensionMap: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/json": "json",
  "text/plain": "txt",
  "text/html": "html",
  "text/css": "css",
  "text/xml": "xml",
  "text/csv": "csv",
};

const magicSignatures: [string, string][] = [
  ["JVBERi0", "application/pdf"],
  ["R0lGODdh", "image/gif"],
  ["R0lGODlh", "image/gif"],
  ["iVBORw0KGgo", "image/png"],
  ["/9j/", "image/jpeg"],
];

function detectMimeType(base64: string): string | undefined {
  const match = base64.match(/^data:(.*?);base64,/i);
  if (match) return match[1];
  for (const [sig, mime] of magicSignatures) {
    if (base64.startsWith(sig)) return mime;
  }
  return undefined;
}

function getExtension(mimeType: string | undefined): string {
  if (mimeType && mimeExtensionMap[mimeType]) return mimeExtensionMap[mimeType];
  return "txt";
}

function removePrefix(s: string) {
  return s.replace(/^data:.*?;base64,/, "");
}

function isValidBase64(s: string) {
  try {
    const cleaned = removePrefix(s.trim());
    atob(cleaned);
    return true;
  } catch {
    return false;
  }
}

export default function Base64File() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("file");
  const [fileExtension, setFileExtension] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const [encFile, setEncFile] = useState<File | null>(null);
  const [encBase64, setEncBase64] = useState("");

  const b64Invalid = base64Input.trim() !== "" && !isValidBase64(base64Input.trim());

  useMemo(() => {
    if (!base64Input.trim()) return;
    const mime = detectMimeType(base64Input.trim());
    const ext = getExtension(mime);
    if (ext && !fileExtension) {
      setFileExtension(ext);
    }
  }, [base64Input]);

  function handleFileDrop(file: File | undefined) {
    if (!file) return;
    setEncFile(file);
    setEncBase64("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setEncBase64(result);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFileDrop(e.dataTransfer.files[0]);
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileDrop(e.target.files?.[0]);
  }

  function handleDecodeFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBase64Input(result);
      };
      reader.readAsDataURL(file);
    }
  }

  function previewImage() {
    if (b64Invalid || !base64Input.trim()) return;
    try {
      const dataUrl = base64Input.trim().startsWith("data:")
        ? base64Input.trim()
        : `data:image/png;base64,${base64Input.trim()}`;
      setPreviewHtml(`<img src="${dataUrl}" style="max-width:100%;max-height:400px" />`);
    } catch {
      toast.error("Cannot preview this file as image");
    }
  }

  function downloadFile() {
    if (b64Invalid || !base64Input.trim()) {
      toast.error("Invalid base64 string");
      return;
    }
    try {
      let dataUrl = base64Input.trim();
      if (!dataUrl.startsWith("data:")) {
        const mime = detectMimeType(dataUrl) || "application/octet-stream";
        dataUrl = `data:${mime};base64,${dataUrl}`;
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      const ext = fileExtension || getExtension(detectMimeType(base64Input.trim()));
      const fullName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;
      a.download = fullName;
      a.click();
      toast.success("File downloaded");
    } catch {
      toast.error("Failed to download file");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Base64 to file</div>

        <div className="mb-3 grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label className="mb-1 block font-mono text-[11px] text-muted-foreground">File Name</Label>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Download filename" className="h-8 rounded-sm font-mono text-xs" />
          </div>
          <div>
            <Label className="mb-1 block font-mono text-[11px] text-muted-foreground">Extension</Label>
            <Input value={fileExtension} onChange={(e) => setFileExtension(e.target.value)} placeholder="Extension" className="h-8 rounded-sm font-mono text-xs" />
          </div>
        </div>

        <div className="mb-2">
          <Label className="mb-1 block font-mono text-[11px] text-muted-foreground">Base64 string</Label>
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Put your base64 file string here..."
            rows={5}
            className={`w-full rounded-sm border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring ${b64Invalid ? "border-destructive" : "border-border"}`}
          />
        </div>

        {b64Invalid && (
          <div className="mb-2 flex items-center gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-1.5 font-mono text-[11px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            Invalid base 64 string
          </div>
        )}

        {previewHtml && (
          <div className="mb-2 flex justify-center" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        )}

        <div className="flex justify-center gap-3">
          <Button size="sm" disabled={!base64Input.trim() || b64Invalid} onClick={previewImage} className="h-8 rounded-sm font-mono text-xs">
            <Eye className="mr-1 h-3.5 w-3.5" />
            Preview image
          </Button>
          <Button size="sm" disabled={!base64Input.trim() || b64Invalid} onClick={downloadFile} className="h-8 rounded-sm font-mono text-xs">
            <Download className="mr-1 h-3.5 w-3.5" />
            Download file
          </Button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">File to base64</div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed px-4 py-8 transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border bg-background hover:border-muted-foreground"}`}
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <div className="text-center font-mono text-[11px] text-muted-foreground">
            Drag and drop a file here, or click to select a file
          </div>
          <input ref={fileInputRef} type="file" onChange={handleFilePick} className="hidden" />
        </div>

        {encFile && (
          <div className="mt-2 flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-foreground">{encFile.name}</span>
            <Button variant="ghost" size="sm" onClick={() => { setEncFile(null); setEncBase64(""); }} className="h-6 w-6 rounded-sm p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="mt-2">
          <Label className="mb-1 block font-mono text-[11px] text-muted-foreground">Base64 output</Label>
          <textarea
            value={encBase64}
            readOnly
            placeholder="File in base64 will be here"
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <div className="mt-3 flex justify-center">
          <Button size="sm" disabled={!encBase64} onClick={() => { navigator.clipboard.writeText(encBase64); toast.success("Base64 string copied to the clipboard"); }} className="h-8 rounded-sm font-mono text-xs">
            <Copy className="mr-1 h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
