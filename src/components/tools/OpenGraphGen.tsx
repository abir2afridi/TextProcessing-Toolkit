import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const types = ["website", "article", "product"];

export default function OpenGraphGen() {
  const [title, setTitle] = useState("My Page Title");
  const [desc, setDesc] = useState("A brief description of the page");
  const [url, setUrl] = useState("https://example.com");
  const [image, setImage] = useState("https://example.com/image.png");
  const [siteName, setSiteName] = useState("Example Site");
  const [type, setType] = useState("website");

  const output = useMemo(() => {
    const tags = [
      `<meta property="og:title" content="${title.replace(/"/g, "&quot;")}" />`,
      `<meta property="og:description" content="${desc.replace(/"/g, "&quot;")}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:image" content="${image}" />`,
      `<meta property="og:type" content="${type}" />`,
    ];
    if (siteName) tags.push(`<meta property="og:site_name" content="${siteName.replace(/"/g, "&quot;")}" />`);
    return tags.join("\n");
  }, [title, desc, url, image, siteName, type]);

  return (
    <div className="space-y-4">
      <OptionRow>
        {[
          { l: "Title", v: title, s: setTitle },
          { l: "Description", v: desc, s: setDesc },
          { l: "URL", v: url, s: setUrl },
          { l: "Image URL", v: image, s: setImage },
          { l: "Site Name", v: siteName, s: setSiteName },
        ].map(({ l, v, s }) => (
          <div key={l} className="flex items-center gap-2">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{l}</Label>
            <Input value={v} onChange={(e) => s(e.target.value)} className="h-7 w-40 rounded-sm font-mono text-xs" />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-7 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none"
          >
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </OptionRow>
      <IOPanel label="OG Meta Tags" value={output} readOnly rows={12} />
    </div>
  );
}
