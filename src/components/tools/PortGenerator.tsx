import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";

interface PortInfo { port: number; name: string; }

const commonPorts: PortInfo[] = [
  { port: 20, name: "FTP data" },
  { port: 21, name: "FTP control" },
  { port: 22, name: "SSH" },
  { port: 23, name: "Telnet" },
  { port: 25, name: "SMTP" },
  { port: 53, name: "DNS" },
  { port: 67, name: "DHCP server" },
  { port: 68, name: "DHCP client" },
  { port: 80, name: "HTTP" },
  { port: 110, name: "POP3" },
  { port: 123, name: "NTP" },
  { port: 143, name: "IMAP" },
  { port: 194, name: "IRC" },
  { port: 443, name: "HTTPS" },
  { port: 465, name: "SMTPS" },
  { port: 514, name: "Syslog" },
  { port: 587, name: "SMTP submission" },
  { port: 636, name: "LDAPS" },
  { port: 993, name: "IMAPS" },
  { port: 995, name: "POP3S" },
  { port: 1433, name: "MSSQL" },
  { port: 1521, name: "Oracle DB" },
  { port: 1701, name: "L2TP" },
  { port: 1723, name: "PPTP" },
  { port: 2049, name: "NFS" },
  { port: 2375, name: "Docker REST" },
  { port: 2376, name: "Docker TLS" },
  { port: 3000, name: "Dev server" },
  { port: 3306, name: "MySQL" },
  { port: 3389, name: "RDP" },
  { port: 4000, name: "Dev server" },
  { port: 4222, name: "NATS" },
  { port: 5000, name: "Dev server" },
  { port: 5222, name: "XMPP" },
  { port: 5432, name: "PostgreSQL" },
  { port: 5900, name: "VNC" },
  { port: 6379, name: "Redis" },
  { port: 6443, name: "K8s API" },
  { port: 6660, name: "IRC" },
  { port: 7001, name: "WebLogic" },
  { port: 8000, name: "Dev server" },
  { port: 8080, name: "HTTP alt" },
  { port: 8443, name: "HTTPS alt" },
  { port: 9000, name: "Dev server" },
  { port: 9090, name: "Prometheus" },
  { port: 9200, name: "Elasticsearch" },
  { port: 9418, name: "Git" },
  { port: 11211, name: "Memcached" },
  { port: 27017, name: "MongoDB" },
  { port: 32400, name: "Plex" },
  { port: 50070, name: "HDFS" },
  { port: 60000, name: "DynamoDB" },
  { port: 65535, name: "Reserved" },
];

function randPort() { return Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024; }

export default function PortGenerator() {
  const [count, setCount] = useState(5);
  const [sort, setSort] = useState(true);
  const [ports, setPorts] = useState<number[]>(() => Array.from({ length: 5 }, randPort));

  const generate = () => {
    setPorts(Array.from({ length: count }, randPort));
  };

  const display = useMemo(() => {
    let list = [...ports];
    if (sort) list.sort((a, b) => a - b);
    return list;
  }, [ports, sort]);

  const checkPort = (p: number): PortInfo | undefined =>
    commonPorts.find((cp) => cp.port === p);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">count</Label>
          <Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="h-7 w-16 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={sort} onCheckedChange={setSort} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">sort</Label>
        </div>
        <Button size="sm" onClick={generate} className="h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-sm border border-border bg-surface p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">generated ports</div>
          <div className="space-y-1">
            {display.map((p, i) => {
              const known = checkPort(p);
              return (
                <div key={i} className="flex items-center justify-between rounded-sm bg-background/60 px-3 py-1.5">
                  <span className="font-mono text-xs text-primary">{p}</span>
                  {known && <span className="font-mono text-[10px] text-muted-foreground">({known.name})</span>}
                  {!known && <span className="font-mono text-[10px] text-muted-foreground/50">ephemeral</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            common ports reference
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-mono text-[10px] uppercase">port</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase">service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {commonPorts.map((cp) => (
                  <tr key={cp.port} className="hover:bg-background/40">
                    <td className="px-3 py-1.5 font-mono text-xs text-primary">{cp.port}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{cp.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
