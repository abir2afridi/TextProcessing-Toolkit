import { useState } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";

function arrayBufferToPem(buf: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const b64 = btoa(bin).match(/.{1,64}/g)?.join("\n") ?? "";
  return `-----BEGIN ${label}-----\n${b64}\n-----END ${label}-----`;
}

export default function RSATool() {
  const [keySize, setKeySize] = useState<1024 | 2048 | 4096>(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const { publicKey: pub, privateKey: priv } = await crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"],
      );
      const [pubSpki, privPkcs8] = await Promise.all([
        crypto.subtle.exportKey("spki", pub).then((b) => arrayBufferToPem(b, "PUBLIC KEY")),
        crypto.subtle.exportKey("pkcs8", priv).then((b) => arrayBufferToPem(b, "PRIVATE KEY")),
      ]);
      setPublicKey(pubSpki);
      setPrivateKey(privPkcs8);
    } catch {
      setPublicKey("[error] key generation failed");
      setPrivateKey("[error] key generation failed");
    }
    setBusy(false);
  };

  const sizes: (1024 | 2048 | 4096)[] = [1024, 2048, 4096];

  return (
    <div className="space-y-4">
      <OptionRow>
        {sizes.map((s) => (
          <Button key={s} size="sm" variant={keySize === s ? "default" : "ghost"} onClick={() => setKeySize(s)} className="h-7 rounded-sm font-mono text-[11px]">
            {s}
          </Button>
        ))}
        <Button size="sm" onClick={generate} disabled={busy} className="ml-auto h-7 rounded-sm font-mono text-[11px]">{busy ? "Generating…" : "Generate"}</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Public key" value={publicKey} readOnly rows={14} />
        <IOPanel label="Private key" value={privateKey} readOnly rows={14} />
      </div>
    </div>
  );
}
