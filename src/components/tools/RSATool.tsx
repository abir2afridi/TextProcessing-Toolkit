import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pki } from "node-forge";
import type { pki as Pki } from "node-forge";
import { Copy, AlertCircle } from "lucide-react";

const emptyCerts = { publicKeyPem: "", privateKeyPem: "" };

function generateRawPairs(bits: number, signal?: AbortSignal) {
  return new Promise<Pki.rsa.KeyPair>((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    pki.rsa.generateKeyPair({ bits }, (err, keyPair) => {
      if (signal?.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
      if (err) { reject(err); return; }
      resolve(keyPair);
    });
  });
}

async function generateKeyPair(bits: number, signal?: AbortSignal) {
  const { privateKey, publicKey } = await generateRawPairs(bits, signal);
  return {
    publicKeyPem: pki.publicKeyToPem(publicKey),
    privateKeyPem: pki.privateKeyToPem(privateKey),
  };
}

export default function RSATool() {
  const [bits, setBits] = useState(2048);
  const [busy, setBusy] = useState(false);
  const [certs, setCerts] = useState(emptyCerts);
  const abortRef = useRef<AbortController | null>(null);

  const bitsError = useMemo(() => {
    if (bits < 256 || bits > 16384 || bits % 8 !== 0) return "Bits should be 256 <= bits <= 16384 and be a multiple of 8";
    return "";
  }, [bits]);

  const generate = useCallback(async (b: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    try {
      const result = await generateKeyPair(b, controller.signal);
      if (!controller.signal.aborted) setCerts(result);
    } catch {
      if (!controller.signal.aborted) setCerts(emptyCerts);
    }
    if (!controller.signal.aborted) setBusy(false);
  }, []);

  useEffect(() => {
    if (bitsError) return;
    const id = setTimeout(() => generate(bits), 300);
    return () => clearTimeout(id);
  }, [bits, bitsError, generate]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Bits :</Label>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setBits(Math.max(256, bits - 8))} className="h-7 w-7 rounded-sm p-0 font-mono text-xs">−</Button>
            <div className="relative">
              <Input
                type="number"
                value={bits}
                onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) setBits(n); }}
                min={256}
                max={16384}
                step={8}
                className={`h-7 w-24 rounded-sm font-mono text-xs [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden ${bitsError ? "border-destructive pr-7" : ""}`}
              />
              {bitsError && (
                <AlertCircle className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setBits(Math.min(16384, bits + 8))} className="h-7 w-7 rounded-sm p-0 font-mono text-xs">+</Button>
          </div>
          {bitsError && <p className="font-mono text-[10px] text-destructive">{bitsError}</p>}
        </div>
        <Button size="sm" onClick={() => generate(bits)} disabled={busy || !!bitsError} className="h-8 rounded-sm font-mono text-[11px]">
          {busy ? "Generating…" : "Refresh key-pair"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setBits(2048); generate(2048); }} className="h-8 rounded-sm font-mono text-[11px]">
          Reset
        </Button>
      </OptionRow>

      <div>
        <h3 className="mb-1 font-mono text-xs font-semibold text-muted-foreground">Public key</h3>
        <div className="relative rounded-sm border border-border bg-surface">
          <textarea
            value={certs.publicKeyPem}
            readOnly
            rows={8}
            className="w-full resize-none bg-transparent p-3 font-mono text-xs text-primary outline-none"
            placeholder="The public key will appear here..."
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { navigator.clipboard.writeText(certs.publicKeyPem); toast.success("Public key copied"); }}
            disabled={!certs.publicKeyPem}
            className="absolute right-1 top-1 h-7 rounded-sm px-2 font-mono text-[10px]"
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-mono text-xs font-semibold text-muted-foreground">Private key</h3>
        <div className="relative rounded-sm border border-border bg-surface">
          <textarea
            value={certs.privateKeyPem}
            readOnly
            rows={8}
            className="w-full resize-none bg-transparent p-3 font-mono text-xs text-primary outline-none"
            placeholder="The private key will appear here..."
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { navigator.clipboard.writeText(certs.privateKeyPem); toast.success("Private key copied"); }}
            disabled={!certs.privateKeyPem}
            className="absolute right-1 top-1 h-7 rounded-sm px-2 font-mono text-[10px]"
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
