import { useState, useMemo } from "react";
import { Copy, Check, Eye, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const ogTypeOptions = [
  { value: "website", label: "Website" },
  { value: "article", label: "Article" },
  { value: "product", label: "Product" },
  { value: "blog", label: "Blog" },
  { value: "profile", label: "Profile" },
  { value: "book", label: "Book" },
  { value: "music.song", label: "Music: Song" },
  { value: "video.movie", label: "Video: Movie" },
  { value: "video.episode", label: "Video: Episode" },
];

const twitterCardOptions = [
  { value: "summary_large_image", label: "Summary (large image)" },
  { value: "summary", label: "Summary (small image)" },
  { value: "app", label: "Application" },
  { value: "player", label: "Player" },
];

const robotsOptions = [
  { value: "index,follow", label: "index, follow" },
  { value: "noindex,follow", label: "noindex, follow" },
  { value: "index,nofollow", label: "index, nofollow" },
  { value: "noindex,nofollow", label: "noindex, nofollow" },
  { value: "none", label: "none" },
];

function escAttr(s: string) {
  return s.replace(/"/g, "&quot;");
}

function CharBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value > max ? "bg-destructive" : value > max * 0.85 ? "bg-amber-500" : "bg-primary";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-primary/10 overflow-hidden">
        <div
          className={"h-full rounded-full transition-all duration-300 " + color}
          style={{ width: pct + "%" }}
        />
      </div>
      <span
        className={
          "text-xs tabular-nums w-12 text-right " +
          (value > max
            ? "text-destructive font-medium"
            : value > max * 0.85
              ? "text-amber-500"
              : "text-muted-foreground")
        }
      >
        {value}/{max}
      </span>
    </div>
  );
}

export default function MetaTagGenny() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [siteName, setSiteName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");

  const [ogType, setOgType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");

  const [metaKeywords, setMetaKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robots, setRobots] = useState("index,follow");
  const [themeColor, setThemeColor] = useState("");
  const [fbAppId, setFbAppId] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  const [generateJsonLd, setGenerateJsonLd] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tags = useMemo(() => {
    const t: string[] = [];

    if (title) {
      t.push("<title>" + escAttr(title) + "</title>");
      t.push('<meta name="title" content="' + escAttr(title) + '" />');
    }
    if (description) {
      t.push('<meta name="description" content="' + escAttr(description) + '" />');
    }
    if (metaKeywords) {
      t.push('<meta name="keywords" content="' + escAttr(metaKeywords) + '" />');
    }
    if (robots) {
      t.push('<meta name="robots" content="' + escAttr(robots) + '" />');
    }
    if (themeColor) {
      t.push('<meta name="theme-color" content="' + escAttr(themeColor) + '" />');
    }
    if (faviconUrl) {
      t.push('<link rel="icon" href="' + escAttr(faviconUrl) + '" />');
      t.push('<link rel="apple-touch-icon" href="' + escAttr(faviconUrl) + '" />');
    }
    if (canonicalUrl) {
      t.push('<link rel="canonical" href="' + escAttr(canonicalUrl) + '" />');
    }

    t.push("");
    t.push("<!-- Open Graph / Facebook -->");
    t.push('<meta property="og:type" content="' + escAttr(ogType) + '" />');
    if (url) t.push('<meta property="og:url" content="' + escAttr(url) + '" />');
    if (title) t.push('<meta property="og:title" content="' + escAttr(title) + '" />');
    if (description) t.push('<meta property="og:description" content="' + escAttr(description) + '" />');
    if (image) t.push('<meta property="og:image" content="' + escAttr(image) + '" />');
    if (siteName) t.push('<meta property="og:site_name" content="' + escAttr(siteName) + '" />');
    if (fbAppId) t.push('<meta property="fb:app_id" content="' + escAttr(fbAppId) + '" />');

    t.push("");
    t.push("<!-- Twitter -->");
    t.push('<meta name="twitter:card" content="' + escAttr(twitterCard) + '" />');
    if (url) t.push('<meta name="twitter:url" content="' + escAttr(url) + '" />');
    if (title) t.push('<meta name="twitter:title" content="' + escAttr(title) + '" />');
    if (description) t.push('<meta name="twitter:description" content="' + escAttr(description) + '" />');
    if (image) t.push('<meta name="twitter:image" content="' + escAttr(image) + '" />');
    if (twitterHandle) t.push('<meta name="twitter:creator" content="' + escAttr(twitterHandle) + '" />');
    if (siteName) t.push('<meta name="twitter:site" content="' + escAttr(siteName) + '" />');

    if (generateJsonLd && title) {
      t.push("");
      t.push("<!-- JSON-LD Structured Data -->");
      const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: title,
      };
      if (url) schema.url = url;
      if (description) schema.description = description;
      if (siteName) schema.alternateName = siteName;
      t.push('<script type="application/ld+json">');
      t.push(JSON.stringify(schema, null, 2));
      t.push("</script>");
    }

    return t.join("\n");
  }, [
    title, description, url, image, siteName, twitterHandle,
    ogType, twitterCard,
    metaKeywords, canonicalUrl, robots, themeColor, fbAppId, faviconUrl,
    generateJsonLd,
  ]);

  const copyTags = async () => {
    await navigator.clipboard.writeText(tags);
    setCopied(true);
    toast.success("Meta tags copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setImage("");
    setSiteName("");
    setTwitterHandle("");
    setOgType("website");
    setTwitterCard("summary_large_image");
    setMetaKeywords("");
    setCanonicalUrl("");
    setRobots("index,follow");
    setThemeColor("");
    setFbAppId("");
    setFaviconUrl("");
    setGenerateJsonLd(false);
  };

  const hasContent = !!(title || description || url || image || siteName || twitterHandle);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label>Page Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Awesome Website"
          className="text-lg h-12"
        />
        <CharBar value={title.length} max={60} label="Title" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your page..."
          className="min-h-[100px]"
        />
        <CharBar value={description.length} max={160} label="Description" />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="font-mono"
        />
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/og-image.jpg"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Recommended size: 1200 x 630 px
        </p>
      </div>

      {/* Site name & Twitter handle */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Site Name</Label>
          <Input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="My Website"
          />
        </div>
        <div className="space-y-2">
          <Label>Twitter Handle</Label>
          <Input
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="@username"
          />
        </div>
      </div>

      {/* Type & Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>OG Type</Label>
          <Select value={ogType} onValueChange={setOgType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ogTypeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Twitter Card</Label>
          <Select value={twitterCard} onValueChange={setTwitterCard}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {twitterCardOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced" className="border rounded-lg px-4">
          <AccordionTrigger className="font-medium text-sm">
            Advanced
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label>Meta Keywords</Label>
              <Input
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of keywords
              </p>
            </div>

            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="font-mono"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Robots Meta</Label>
                <Select value={robots} onValueChange={setRobots}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {robotsOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex gap-2">
                  <Input
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    placeholder="#ffffff"
                    className="font-mono flex-1"
                  />
                  <input
                    type="color"
                    value={themeColor || "#ffffff"}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-10 w-10 rounded-md border border-border bg-background cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Facebook App ID</Label>
                <Input
                  value={fbAppId}
                  onChange={(e) => setFbAppId(e.target.value)}
                  placeholder="123456789012345"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="font-mono"
                />
              </div>
            </div>

            <Label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={generateJsonLd}
                onChange={(e) => setGenerateJsonLd(e.target.checked)}
                className="size-4 rounded border-border accent-foreground"
              />
              <span className="text-sm">Generate JSON-LD structured data</span>
            </Label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Generated tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Generated Meta Tags</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-3.5 mr-1.5" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={!hasContent}
              className="h-7 px-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Clear
            </Button>
          </div>
        </div>
        <pre className="p-4 rounded-lg border bg-muted/50 overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-[400px]">
          {tags || "<!-- Fill in the fields above to generate meta tags -->"}
        </pre>
        <Button
          size="lg"
          className="w-full h-14"
          onClick={copyTags}
          disabled={!tags}
        >
          {copied ? (
            <><Check className="size-5 mr-2" /> Copied!</>
          ) : (
            <><Copy className="size-5 mr-2" /> Copy Meta Tags</>
          )}
        </Button>
      </div>

      {/* Previews */}
      {showPreview && (
        <div className="space-y-4">
          <h3 className="font-medium">Social Preview</h3>

          {/* Google snippet */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Google snippet</div>
            <div className="space-y-0.5 max-w-xl">
              <div className="text-blue-700 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
                {title || "Page Title"}
              </div>
              <div className="text-green-700 dark:text-green-500 text-sm truncate">
                {url || "https://example.com"}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {description || "Page description will appear here..."}
              </div>
            </div>
          </div>

          {/* Social card (Twitter / Facebook) */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Social card</div>
            <div className="border rounded-lg overflow-hidden max-w-md">
              <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <div className="p-3 bg-card space-y-0.5">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
                  {siteName || (url ? new URL(url).hostname : "example.com")}
                  {twitterHandle ? "  ·  " + twitterHandle : ""}
                </div>
                <div className="font-semibold truncate">{title || "Page Title"}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {description || "Description"}
                </div>
              </div>
            </div>
          </div>

          {/* Preview by type (article / product / profile conditional) */}
          {url && title && (() => {
            switch (ogType) {
              case "article":
                return (
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Article preview</div>
                    <div className="border rounded-lg overflow-hidden max-w-md">
                      {image && (
                        <div className="aspect-[1.91/1] bg-muted">
                          <img src={image} alt="Article" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3 bg-card space-y-1">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                          {siteName || new URL(url).hostname}
                        </div>
                        <div className="font-bold text-base leading-tight">{title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {description || "Read the full article..."}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new URL(url).hostname}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              case "product":
                return (
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Product preview</div>
                    <div className="border rounded-lg overflow-hidden max-w-xs">
                      {image && (
                        <div className="aspect-square bg-muted">
                          <img src={image} alt="Product" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3 bg-card space-y-1">
                        <div className="font-bold">{title}</div>
                        {description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">{description}</div>
                        )}
                        <div className="text-[11px] text-muted-foreground">{new URL(url).hostname}</div>
                      </div>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}

          {/* Character stats */}
          <div className="p-4 rounded-lg border bg-card space-y-2">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Character stats</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Title</div>
                <div className="text-lg font-semibold tabular-nums">{title.length}</div>
                <div className="text-[10px] text-muted-foreground">{title.length > 60 ? "Too long" : title.length > 50 ? "Getting long" : "Optimal"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Description</div>
                <div className="text-lg font-semibold tabular-nums">{description.length}</div>
                <div className="text-[10px] text-muted-foreground">{description.length > 160 ? "Too long" : description.length > 130 ? "Getting long" : "Optimal"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Keywords</div>
                <div className="text-lg font-semibold tabular-nums">{metaKeywords ? metaKeywords.split(",").length : 0}</div>
                <div className="text-[10px] text-muted-foreground">Keywords count</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tags generated</div>
                <div className="text-lg font-semibold tabular-nums">{(tags.match(/<meta /g) || []).length + (tags.match(/<link /g) || []).length}</div>
                <div className="text-[10px] text-muted-foreground">Meta + link tags</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
