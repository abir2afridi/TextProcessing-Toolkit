import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { encodeBasicAuth } from "@/lib/text-utils";

export default function BasicAuthGen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const header = useMemo(() => {
    if (!username && !password) return "";
    try {
      return encodeBasicAuth(username, password);
    } catch { return "[error] encoding failed"; }
  }, [username, password]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Username</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-7 w-48 rounded-sm font-mono text-xs" placeholder="Enter username…" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-7 w-48 rounded-sm font-mono text-xs" placeholder="Enter password…" />
        </div>
      </OptionRow>
      <IOPanel label="Authorization header" value={header} readOnly rows={4} />
    </div>
  );
}
