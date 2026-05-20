import { useState, useMemo, useCallback } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const OUIS = [
  "00:1A:11", "00:1B:21", "00:1C:42", "00:1D:60", "00:1E:68",
  "00:1F:29", "00:21:5A", "00:23:14", "00:25:22", "00:26:55",
  "08:00:27", "08:00:46", "0C:9D:92", "10:08:B1", "10:2A:E6",
  "10:62:E5", "14:10:9F", "14:58:D0", "18:31:BF", "1C:1B:68",
  "20:47:47", "24:4B:FE", "28:16:AD", "2C:30:33", "30:46:9A",
  "34:08:04", "34:23:87", "38:0A:94", "3C:07:54", "40:8D:5C",
  "44:38:39", "44:6E:E5", "48:45:20", "4C:5E:0C", "50:2F:9B",
  "50:6A:03", "54:53:ED", "58:38:79", "5C:51:88", "60:30:D4",
  "64:16:66", "64:64:4A", "68:05:CA", "6C:88:14", "6C:9B:02",
  "70:18:8B", "70:4C:A5", "70:5A:B6", "70:85:C2", "74:DA:38",
  "78:24:AF", "78:45:61", "7C:10:C9", "7C:E9:D3", "80:2A:A8",
  "80:32:53", "84:16:F9", "84:8F:69", "88:36:6C", "88:53:2E",
  "8C:04:BA", "8C:8E:76", "8C:B8:4A", "90:09:D0", "90:2B:34",
  "90:9A:4A", "94:57:A5", "94:9F:3E", "98:01:A7", "98:90:96",
  "9C:28:BF", "9C:EB:E8", "A0:04:60", "A0:14:3D", "A0:36:9F",
  "A0:8C:FD", "A4:45:19", "A4:5E:60", "A4:77:33", "A8:1B:18",
  "A8:5E:45", "A8:6B:AD", "AC:12:2F", "AC:22:0B", "AC:84:C6",
  "B0:4E:26", "B0:48:7A", "B0:6A:9A", "B4:45:06", "B4:82:C5",
  "B8:27:EB", "B8:9B:C9", "BC:76:70", "BC:EE:7B", "C0:25:06",
  "C0:98:79", "C0:B6:F9", "C4:12:FE", "C4:6A:2D", "C4:93:00",
  "C8:3A:35", "C8:4C:75", "C8:94:02", "CC:5D:4E", "CC:96:A0",
  "D0:17:C2", "D0:73:D5", "D0:94:66", "D0:DF:9A", "D4:38:9C",
  "D4:6A:91", "D4:85:64", "D8:47:32", "D8:96:E0", "DC:2B:2A",
  "DC:7F:A4", "DC:85:DE", "E0:2A:14", "E0:37:BF", "E0:70:E4",
  "E0:9D:31", "E4:54:E8", "E4:5F:01", "E4:6F:13", "E8:AB:FA",
  "E8:D0:1A", "E8:FC:AF", "EC:14:78", "EC:1A:59", "EC:43:F6",
  "F0:18:98", "F0:25:B7", "F0:2F:74", "F0:4D:A2", "F0:5E:CD",
  "F0:7B:CB", "F0:9F:C2", "F4:0F:24", "F4:1E:57", "F4:6D:04",
  "F8:1E:DF", "F8:27:93", "F8:42:1E", "FC:3F:7C", "FC:64:BA",
  "FC:C2:DE", "FC:FB:FB", "FE:1A:5B", "FE:2F:5B",
];

type Format = "colon" | "hyphen" | "plain";

function randByte() { return Math.floor(Math.random() * 256); }

function makeMAC(format: Format, upper: boolean, oui?: string) {
  const bytes = oui
    ? oui.split(":").map(Number).concat([randByte(), randByte(), randByte()])
    : [randByte(), randByte(), randByte(), randByte(), randByte(), randByte()];
  const hex = bytes.map((b) => {
    const h = b.toString(16).padStart(2, "0");
    return upper ? h.toUpperCase() : h;
  });
  switch (format) {
    case "colon": return hex.join(":");
    case "hyphen": return hex.join("-");
    case "plain": return hex.join("");
  }
}

export default function MACGenerator() {
  const [format, setFormat] = useState<Format>("colon");
  const [upper, setUpper] = useState(false);
  const [count, setCount] = useState(10);
  const [oui, setOui] = useState("");
  const [text, setText] = useState(() => Array.from({ length: 10 }, () => makeMAC("colon", false)).join("\n"));
  const generate = useCallback(() => {
    setText(Array.from({ length: count }, () => makeMAC(format, upper, oui || undefined)).join("\n"));
  }, [count, format, upper, oui]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
            <SelectTrigger className="h-7 w-28 rounded-sm font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colon" className="font-mono text-xs">XX:XX:XX</SelectItem>
              <SelectItem value="hyphen" className="font-mono text-xs">XX-XX-XX</SelectItem>
              <SelectItem value="plain" className="font-mono text-xs">XXXXXXXXXXXX</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={upper} onCheckedChange={setUpper} />
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">UPPER</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">count</Label>
          <Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">OUI</Label>
          <Select value={oui} onValueChange={setOui}>
            <SelectTrigger className="h-7 w-28 rounded-sm font-mono text-xs">
              <SelectValue placeholder="Random" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {OUIS.map((o) => (
                <SelectItem key={o} value={o} className="font-mono text-xs">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {oui && <Button size="sm" variant="ghost" onClick={() => setOui("")} className="h-7 rounded-sm font-mono text-[11px]">Clear</Button>}
        </div>
        <Button size="sm" onClick={generate} className="h-7 rounded-sm font-mono text-[11px]">Generate</Button>
      </OptionRow>
      <IOPanel label="MAC Addresses" value={text} readOnly rows={20} />
    </div>
  );
}
