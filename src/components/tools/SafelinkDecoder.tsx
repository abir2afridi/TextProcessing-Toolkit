import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

function decodeSafeLinksURL(safeLinksUrl: string): string {
  if (!safeLinksUrl.match(/\.safelinks\.protection\.outlook\.com/)) {
    throw new Error("Invalid SafeLinks URL provided");
  }
  const url = new URL(safeLinksUrl);
  const decoded = url.searchParams.get("url");
  if (!decoded) throw new Error("No url parameter found in SafeLink URL");
  return decoded;
}

export default function SafelinkDecoder() {
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return decodeSafeLinksURL(input.trim());
    } catch (e: unknown) {
      return (e as Error).toString();
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 font-mono text-xs font-bold text-foreground">Your input Outlook SafeLink Url:</div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your input Outlook SafeLink Url..."
          autoFocus
          className="w-full resize-y rounded-sm border border-border bg-background p-3 font-mono text-xs text-foreground outline-none transition-colors focus:border-primary"
          rows={4}
        />
      </div>

      <div className="h-px bg-border" />

      <div>
        <div className="mb-1 font-mono text-xs font-bold text-foreground">Output decoded URL:</div>
        <div className="relative">
          <textarea
            readOnly
            value={output}
            className="w-full resize-y rounded-sm border border-border bg-background p-3 font-mono text-xs text-foreground outline-none"
            rows={4}
            style={{ wordWrap: "break-word" }}
          />
          <Button
            size="sm"
            disabled={!output || output.startsWith("Error") || output.startsWith("Invalid")}
            onClick={() => { navigator.clipboard.writeText(output); toast.success("Decoded URL copied"); }}
            className="absolute right-2 top-2 h-7 rounded-sm font-mono text-[11px]"
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
