import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { encoders } from "@/lib/text-utils";
import { toast } from "sonner";

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex justify-center">
      <Button
        size="sm"
        disabled={!value}
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success(`Copied ${label}`);
        }}
        className="h-8 rounded-sm font-mono text-xs"
      >
        Copy
      </Button>
    </div>
  );
}

export default function HtmlEntities() {
  const [inputEnc, setInputEnc] = useState("<title>IT Tool</title>");
  const [inputDec, setInputDec] = useState("&lt;title&gt;IT Tool&lt;/title&gt;");

  const outputEnc = useMemo(() => encoders.htmlEncode(inputEnc), [inputEnc]);
  const outputDec = useMemo(() => encoders.htmlDecode(inputDec), [inputDec]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Escape html entities</div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Your string :</div>
          <textarea
            value={inputEnc}
            onChange={(e) => setInputEnc(e.target.value)}
            placeholder="The string to escape"
            rows={3}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Your string escaped :</div>
          <textarea
            value={outputEnc}
            readOnly
            placeholder="Your string escaped"
            rows={3}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <CopyButton value={outputEnc} label="escaped string" />
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Unescape html entities</div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Your escaped string :</div>
          <textarea
            value={inputDec}
            onChange={(e) => setInputDec(e.target.value)}
            placeholder="The string to unescape"
            rows={3}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Your string unescaped :</div>
          <textarea
            value={outputDec}
            readOnly
            placeholder="Your string unescaped"
            rows={3}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-primary outline-none"
          />
        </div>

        <CopyButton value={outputDec} label="unescaped string" />
      </div>
    </div>
  );
}
