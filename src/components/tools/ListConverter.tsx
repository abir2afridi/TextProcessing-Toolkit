import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConvertOptions {
  lowerCase: boolean;
  trimItems: boolean;
  removeDuplicates: boolean;
  keepLineBreaks: boolean;
  reverseList: boolean;
  sortList: "asc" | "desc" | null;
  separator: string;
  itemPrefix: string;
  itemSuffix: string;
  listPrefix: string;
  listSuffix: string;
}

function convert(list: string, options: ConvertOptions): string {
  const lineBreak = options.keepLineBreaks ? "\n" : "";
  let parts = list.toLowerCase();
  if (!options.lowerCase) parts = list;
  let items = parts.split("\n");

  if (options.removeDuplicates) items = Array.from(new Set(items));
  if (options.reverseList) items = items.reverse();
  if (options.sortList) {
    items.sort(options.sortList === "asc" ? undefined : (a, b) => b.localeCompare(a));
  }
  if (options.trimItems) items = items.map((s) => s.trim());
  items = items.filter(Boolean);
  items = items.map((p) => options.itemPrefix + p + options.itemSuffix);
  const text = items.join(options.separator + lineBreak);
  return [options.listPrefix, text, options.listSuffix].join(lineBreak);
}

export default function ListConverter() {
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState<ConvertOptions>({
    lowerCase: false,
    trimItems: true,
    removeDuplicates: true,
    keepLineBreaks: false,
    reverseList: false,
    sortList: null,
    separator: ", ",
    itemPrefix: "",
    itemSuffix: "",
    listPrefix: "",
    listSuffix: "",
  });

  const output = useMemo(() => convert(input, opts), [input, opts]);

  const toggle = (key: keyof ConvertOptions) =>
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-[600px]">
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="flex gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="w-[150px] font-mono text-[11px] text-muted-foreground">Trim list items</Label>
                <Switch checked={opts.trimItems} onCheckedChange={() => toggle("trimItems")} />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-[150px] font-mono text-[11px] text-muted-foreground">Remove duplicates</Label>
                <Switch checked={opts.removeDuplicates} onCheckedChange={() => toggle("removeDuplicates")} />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-[150px] font-mono text-[11px] text-muted-foreground">Convert to lowercase</Label>
                <Switch checked={opts.lowerCase} onCheckedChange={() => toggle("lowerCase")} />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-[150px] font-mono text-[11px] text-muted-foreground">Keep line breaks</Label>
                <Switch checked={opts.keepLineBreaks} onCheckedChange={() => toggle("keepLineBreaks")} />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Label className="w-[70px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Sort list</Label>
                <select
                  value={opts.sortList ?? ""}
                  onChange={(e) => setOpts((prev) => ({ ...prev, sortList: (e.target.value || null) as "asc" | "desc" | null, reverseList: false }))}
                  className="h-8 flex-1 rounded-sm border border-border bg-background px-2 font-mono text-[11px] text-foreground outline-none"
                >
                  <option value="">None</option>
                  <option value="asc">Sort ascending</option>
                  <option value="desc">Sort descending</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-[70px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Separator</Label>
                <Input
                  value={opts.separator}
                  onChange={(e) => setOpts((prev) => ({ ...prev, separator: e.target.value }))}
                  placeholder=","
                  className="h-8 flex-1 rounded-sm font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-[70px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Wrap item</Label>
                <Input
                  value={opts.itemPrefix}
                  onChange={(e) => setOpts((prev) => ({ ...prev, itemPrefix: e.target.value }))}
                  placeholder="Item prefix"
                  className="h-8 flex-1 rounded-sm font-mono text-xs"
                />
                <Input
                  value={opts.itemSuffix}
                  onChange={(e) => setOpts((prev) => ({ ...prev, itemSuffix: e.target.value }))}
                  placeholder="Item suffix"
                  className="h-8 flex-1 rounded-sm font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-[70px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Wrap list</Label>
                <Input
                  value={opts.listPrefix}
                  onChange={(e) => setOpts((prev) => ({ ...prev, listPrefix: e.target.value }))}
                  placeholder="List prefix"
                  className="h-8 flex-1 rounded-sm font-mono text-xs"
                />
                <Input
                  value={opts.listSuffix}
                  onChange={(e) => setOpts((prev) => ({ ...prev, listSuffix: e.target.value }))}
                  placeholder="List suffix"
                  className="h-8 flex-1 rounded-sm font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Your input data" value={input} onChange={setInput} placeholder="Paste your input data here..." />
        <IOPanel label="Your transformed data" value={output} readOnly />
      </div>
    </div>
  );
}
