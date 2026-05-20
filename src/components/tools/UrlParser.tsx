import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

export default function UrlParser() {
  const [input, setInput] = useState("https://user:pass@example.com:8443/path/to/page?q=tpt&lang=en#section");
  const { data, error } = useMemo(() => {
    try {
      const u = new URL(input);
      const params: { key: string; value: string }[] = [];
      u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
      return { data: { protocol: u.protocol, host: u.host, hostname: u.hostname, port: u.port, pathname: u.pathname, search: u.search, hash: u.hash, origin: u.origin, username: u.username, password: u.password, params }, error: null as string | null };
    } catch (e) { return { data: null, error: (e as Error).message }; }
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-3">
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">URL</label>
        <Input value={input} onChange={(e) => setInput(e.target.value)} className="h-9 rounded-sm font-mono text-xs" />
      </div>
      {error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{error}</div>
      ) : data && (
        <div className="rounded-sm border border-border bg-surface">
          <table className="w-full font-mono text-xs">
            <tbody>
              {(["protocol","origin","hostname","port","pathname","search","hash","username","password"] as const).map((k) => (
                <tr key={k} className="border-b border-border last:border-0">
                  <td className="w-40 px-3 py-2 text-muted-foreground">{k}</td>
                  <td className="break-all px-3 py-2">{String(data[k]) || <span className="text-muted-foreground/40">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.params.length > 0 && (
            <div className="border-t border-border">
              <div className="border-b border-border bg-background/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">query params</div>
              <table className="w-full font-mono text-xs">
                <tbody>
                  {data.params.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="w-40 px-3 py-2 text-primary">{p.key}</td>
                      <td className="break-all px-3 py-2">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
