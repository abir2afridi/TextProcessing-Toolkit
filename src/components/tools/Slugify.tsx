import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/text-utils";

export default function Slugify() {
  const [input, setInput] = useState("");
  const [sep, setSep] = useState("-");
  const output = useMemo(() => input.split(/\r?\n/).map((l) => slugify(l, sep)).join("\n"), [input, sep]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Slug copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">separator</Label>
          <Input value={sep} onChange={(e) => setSep(e.target.value || "-")} className="h-7 w-20 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Your string to slugify" value={input} onChange={setInput} placeholder="Put your string here (ex: My file path)" />
        <IOPanel label="Your slug" value={output} readOnly placeholder="You slug will be generated here (ex: my-file-path)" />
      </div>
      <div className="flex justify-center">
        <Button disabled={output.length === 0} onClick={handleCopy} size="sm">
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copy slug
        </Button>
      </div>
    </div>
  );
}
