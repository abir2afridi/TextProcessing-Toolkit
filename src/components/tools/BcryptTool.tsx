import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import { hashSync, compareSync } from "bcryptjs";

export default function BcryptTool() {
  const [text, setText] = useState("");
  const [saltRounds, setSaltRounds] = useState(10);
  const [compareString, setCompareString] = useState("");
  const [compareHash, setCompareHash] = useState("");

  const hashed = useMemo(() => {
    if (!text) return "";
    try { return hashSync(text, saltRounds); }
    catch { return "[error] hash failed"; }
  }, [text, saltRounds]);

  const compareMatch = useMemo(() => {
    if (!compareString || !compareHash) return null;
    try { return compareSync(compareString, compareHash); }
    catch { return null; }
  }, [compareString, compareHash]);

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hash</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="w-[120px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Your string:</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Your string to bcrypt..."
              className="h-8 flex-1 rounded-sm font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-[120px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Salt count:</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={saltRounds}
              onChange={(e) => setSaltRounds(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="h-8 w-24 rounded-sm font-mono text-xs"
            />
          </div>
          <IOPanel label="Bcrypt hash" value={hashed} readOnly rows={2} />
          <div className="flex justify-center">
            <Button
              size="sm"
              onClick={() => { navigator.clipboard.writeText(hashed); }}
              disabled={!hashed}
              className="h-8 rounded-sm font-mono text-[11px]"
            >
              Copy hash
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Compare string with hash</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="w-[120px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Your string:</Label>
            <Input
              value={compareString}
              onChange={(e) => setCompareString(e.target.value)}
              placeholder="Your string to compare..."
              className="h-8 flex-1 rounded-sm font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-[120px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Your hash:</Label>
            <Input
              value={compareHash}
              onChange={(e) => setCompareHash(e.target.value)}
              placeholder="Your hash to compare..."
              className="h-8 flex-1 rounded-sm font-mono text-xs"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 flex-shrink-0 rounded-sm"
              title="Paste from clipboard"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setCompareHash(text);
                  toast.success("Pasted");
                } catch { toast.error("Clipboard read blocked"); }
              }}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-[120px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Do they match?</Label>
            <span
              className={`font-mono text-xs font-semibold ${
                compareMatch === true
                  ? "text-green-500"
                  : compareMatch === false
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              {compareMatch === true ? "Yes" : compareMatch === false ? "No" : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
