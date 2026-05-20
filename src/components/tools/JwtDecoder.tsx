import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { decodeJWT } from "@/lib/text-utils";

export default function JwtDecoder() {
  const [input, setInput] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const { header, payload, signature, error } = useMemo(() => {
    try {
      const { header, payload, signature } = decodeJWT(input);
      return { header: JSON.stringify(header, null, 2), payload: JSON.stringify(payload, null, 2), signature, error: null as string | null };
    } catch (e) { return { header: "", payload: "", signature: "", error: (e as Error).message }; }
  }, [input]);

  return (
    <div className="space-y-4">
      <IOPanel label="JWT" value={input} onChange={setInput} rows={6} />
      {error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{error}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <IOPanel label="Header" value={header} readOnly rows={10} />
          <IOPanel label="Payload" value={payload} readOnly rows={10} />
          <IOPanel label="Signature" value={signature} readOnly rows={10} />
        </div>
      )}
    </div>
  );
}
