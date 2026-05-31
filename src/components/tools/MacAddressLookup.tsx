import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import db from "oui-data";
import { toast } from "sonner";

export default function MacAddressLookup() {
  const [mac, setMac] = useState("20:37:06:12:34:56");

  const oui = useMemo(() => {
    const clean = mac.replace(/[.:-]/g, "").toUpperCase().slice(0, 6);
    if (clean.length < 6 || !/^[0-9A-F]{6}$/.test(clean)) return null;
    return clean;
  }, [mac]);

  const vendor = oui ? (db as Record<string, string>)[oui] : undefined;
  const unknown = oui && !vendor;

  const handleCopy = () => {
    if (vendor) {
      navigator.clipboard.writeText(vendor);
      toast("Vendor info copied to the clipboard");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">MAC address:</Label>
        <Input
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          placeholder="Type a MAC address"
          className="h-8 rounded-sm font-mono text-xs"
        />
      </div>

      <div>
        <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Vendor info:</p>
        <div className="rounded-sm border border-border bg-surface p-3">
          {vendor ? (
            <div className="whitespace-pre-wrap font-mono text-xs text-foreground">{vendor}</div>
          ) : unknown ? (
            <p className="font-mono text-[11px] italic text-muted-foreground/60">Unknown vendor for this address</p>
          ) : (
            <p className="font-mono text-[11px] italic text-muted-foreground/60">—</p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button size="sm" className="h-8 rounded-sm font-mono text-xs" disabled={!vendor} onClick={handleCopy}>
          Copy vendor info
        </Button>
      </div>
    </div>
  );
}
