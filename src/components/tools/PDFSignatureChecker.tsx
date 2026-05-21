import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, X, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import type { SignatureInfo } from "@/lib/pdf-signature-types";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

type Status = "idle" | "parsed" | "error" | "loading";

function CertDetails({ cert, index }: { cert: SignatureInfo["meta"]["certs"][number]; index: number }) {
  const [showPem, setShowPem] = useState(false);

  const issuedByItems = [
    { label: "Common name", value: cert.issuedBy.commonName },
    { label: "Organization name", value: cert.issuedBy.organizationName },
    { label: "Country name", value: cert.issuedBy.countryName },
    { label: "Locality name", value: cert.issuedBy.localityName },
    { label: "Organizational unit name", value: cert.issuedBy.organizationalUnitName },
    { label: "State or province name", value: cert.issuedBy.stateOrProvinceName },
  ].filter((i) => i.value);

  const issuedToItems = [
    { label: "Common name", value: cert.issuedTo.commonName },
    { label: "Organization name", value: cert.issuedTo.organizationName },
    { label: "Country name", value: cert.issuedTo.countryName },
    { label: "Locality name", value: cert.issuedTo.localityName },
    { label: "Organizational unit name", value: cert.issuedTo.organizationalUnitName },
    { label: "State or province name", value: cert.issuedTo.stateOrProvinceName },
  ].filter((i) => i.value);

  return (
    <div className="rounded-sm border border-border bg-surface">
      <div className="border-b border-border px-3 py-2 font-mono text-xs font-semibold text-muted-foreground">
        Certificate {index + 1}
      </div>
      <div className="divide-y divide-border">
        <div className="px-3 py-2">
          <div className="mb-1 font-mono text-[11px] font-semibold text-muted-foreground">Validity period</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground">Not before</div>
              <div className="font-mono text-xs text-foreground">{new Date(cert.validityPeriod.notBefore).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted-foreground">Not after</div>
              <div className="font-mono text-xs text-foreground">{new Date(cert.validityPeriod.notAfter).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="mb-1 font-mono text-[11px] font-semibold text-muted-foreground">Issued by</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {issuedByItems.map((item) => (
              <div key={item.label} className="flex gap-2 font-mono text-xs">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="mb-1 font-mono text-[11px] font-semibold text-muted-foreground">Issued to</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {issuedToItems.map((item) => (
              <div key={item.label} className="flex gap-2 font-mono text-xs">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="mb-1 font-mono text-[11px] font-semibold text-muted-foreground">PEM certificate</div>
          {showPem ? (
            <div className="relative">
              <pre className="max-h-40 overflow-auto rounded-sm border border-border bg-background p-2 font-mono text-[10px] text-foreground break-all">{cert.pemCertificate}</pre>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(cert.pemCertificate); toast.success("PEM copied"); }} className="absolute right-1 top-1 h-6 rounded-sm px-1.5 font-mono text-[10px]">
                <Copy className="mr-0.5 h-3 w-3" />
                Copy
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowPem(true)} className="h-7 rounded-sm px-2 font-mono text-[11px]">
              <Eye className="mr-1 h-3.5 w-3.5" />
              View PEM cert
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PDFSignatureChecker() {
  const [signatures, setSignatures] = useState<SignatureInfo[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onVerifyClicked(uploadedFile: File) {
    setFileInfo({ name: uploadedFile.name, size: uploadedFile.size });
    const fileBuffer = await uploadedFile.arrayBuffer();
    setStatus("loading");
    try {
      const verifyPDF = (await import("pdf-signature-reader")).default;
      const { signatures: parsedSignatures } = verifyPDF(fileBuffer);
      setSignatures(parsedSignatures);
      setStatus("parsed");
    } catch {
      setSignatures([]);
      setStatus("error");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onVerifyClicked(file);
    } else {
      toast.error("Please drop a PDF file");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onVerifyClicked(file);
  }

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-[600px]">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed px-6 py-12 transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-muted-foreground"}`}
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <div className="font-mono text-sm text-muted-foreground">Drag and drop a PDF file here, or click to select a file</div>
          <input ref={inputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
        </div>

        {fileInfo && (
          <div className="mt-4 flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 font-mono text-xs">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{fileInfo.name}</span>
            <span className="text-muted-foreground">{formatBytes(fileInfo.size)}</span>
            <Button variant="ghost" size="sm" onClick={() => { setFileInfo(null); setStatus("idle"); setSignatures([]); }} className="ml-auto h-6 w-6 rounded-sm p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 flex items-center gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
            <AlertCircle className="h-4 w-4" />
            No signatures found in the provided file.
          </div>
        )}
      </div>

      {status === "parsed" && signatures.length > 0 && (
        <div className="space-y-4">
          {signatures.map((signature, index) => (
            <div key={index}>
              <div className="mb-2 font-mono text-xs font-bold text-foreground">Signature {index + 1} certificates :</div>
              <div className="space-y-2">
                {signature.meta.certs.map((cert, ci) => (
                  <CertDetails key={ci} cert={cert} index={ci} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
