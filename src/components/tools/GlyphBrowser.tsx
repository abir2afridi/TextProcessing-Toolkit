import { useState, useMemo, useCallback } from "react";
import { Copy, Check, Search, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFilePaste } from "@/hooks/use-file-paste";
import opentype from "opentype.js";

interface GlyphCategory {
  name: string;
  ranges: [number, number][];
}

const CATEGORIES: GlyphCategory[] = [
  { name: "Latin Basic", ranges: [[0x0020, 0x007f]] },
  { name: "Latin Extended", ranges: [[0x0080, 0x00ff], [0x0100, 0x017f]] },
  { name: "Greek", ranges: [[0x0370, 0x03ff]] },
  { name: "Cyrillic", ranges: [[0x0400, 0x04ff]] },
  { name: "Punctuation", ranges: [[0x2000, 0x206f]] },
  { name: "Currency", ranges: [[0x20a0, 0x20cf]] },
  { name: "Arrows", ranges: [[0x2190, 0x21ff]] },
  { name: "Math Operators", ranges: [[0x2200, 0x22ff]] },
  { name: "Box Drawing", ranges: [[0x2500, 0x257f]] },
  { name: "Geometric Shapes", ranges: [[0x25a0, 0x25ff]] },
  { name: "Symbols", ranges: [[0x2600, 0x26ff]] },
  { name: "Dingbats", ranges: [[0x2700, 0x27bf]] },
  { name: "Emoji", ranges: [[0x1f300, 0x1f5ff], [0x1f600, 0x1f64f], [0x1f680, 0x1f6ff]] },
  { name: "Arabic", ranges: [[0x0600, 0x06ff]] },
  { name: "Hebrew", ranges: [[0x0590, 0x05ff]] },
  { name: "Hangul", ranges: [[0xac00, 0xd7af]] },
];

export default function GlyphBrowserTool() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);
  const [search, setSearch] = useState("");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [copiedChar, setCopiedChar] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<number | null>(null);

  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontUrl, setFontUrl] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontCoverage, setFontCoverage] = useState<Set<number>>(new Set());
  const [glyphNames, setGlyphNames] = useState<Map<number, string>>(new Map());

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".ttf") || file.name.endsWith(".otf") || file.name.endsWith(".woff") || file.name.endsWith(".woff2"))) {
      loadFontFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFontFile(file);
    }
  };

  const loadFontFile = async (file: File) => {
    setFontFile(file);
    if (fontUrl) URL.revokeObjectURL(fontUrl);

    const url = URL.createObjectURL(file);
    setFontUrl(url);

    const family = `glyph-font-${Date.now()}`;
    setFontFamily(family);

    try {
      const fontFace = new FontFace(family, `url(${url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      setFontLoaded(true);

      const buf = await file.arrayBuffer();
      const otFont = opentype.parse(buf);

      const coverage = new Set<number>();
      const names = new Map<number, string>();
      for (const glyph of otFont.glyphs.glyphs) {
        if (glyph?.unicode != null) {
          coverage.add(glyph.unicode);
        }
      }
      for (const glyph of otFont.glyphs.glyphs) {
        if (glyph?.name && glyph.unicode != null) {
          names.set(glyph.unicode, glyph.name);
        } else if (glyph?.name && glyph.unicodes) {
          for (const u of glyph.unicodes) {
            names.set(u, glyph.name);
          }
        }
      }
      setFontCoverage(coverage);
      setGlyphNames(names);
    } catch {
      setFontLoaded(false);
    }
  };

  useFilePaste(loadFontFile, ".ttf,.otf,.woff,.woff2");

  const clearFont = () => {
    if (fontUrl) URL.revokeObjectURL(fontUrl);
    setFontFile(null);
    setFontUrl(null);
    setFontFamily(null);
    setFontLoaded(false);
    setFontCoverage(new Set());
    setGlyphNames(new Map());
  };

  const allRanges = useMemo(() => {
    const ranges: [number, number][] = [];
    for (const cat of CATEGORIES) {
      for (const r of cat.ranges) {
        ranges.push(r);
      }
    }
    return ranges;
  }, []);

  const glyphs = useMemo(() => {
    if (selectedCategory === "__all__") {
      const chars: number[] = [];
      for (const [start, end] of allRanges) {
        for (let i = start; i <= end; i++) {
          chars.push(i);
        }
      }
      return chars;
    }
    if (selectedCategory === "__custom__") {
      const start = parseInt(customStart, 16);
      const end = parseInt(customEnd, 16);
      if (isNaN(start) || isNaN(end) || start > end || start < 0) return [];
      const chars: number[] = [];
      for (let i = start; i <= end && i <= 0x10ffff; i++) {
        chars.push(i);
      }
      return chars;
    }
    const category = CATEGORIES.find((c) => c.name === selectedCategory);
    if (!category) return [];
    const chars: number[] = [];
    for (const [start, end] of category.ranges) {
      for (let i = start; i <= end; i++) {
        chars.push(i);
      }
    }
    return chars;
  }, [selectedCategory, customStart, customEnd, allRanges]);

  const filteredGlyphs = useMemo(() => {
    if (!search) return glyphs;
    const lower = search.toLowerCase();
    return glyphs.filter((code) => {
      const char = String.fromCodePoint(code);
      const hex = code.toString(16).toLowerCase();
      const name = glyphNames.get(code) || "";
      return (
        char === search ||
        hex.includes(lower) ||
        `u+${hex}`.includes(lower) ||
        name.toLowerCase().includes(lower)
      );
    });
  }, [glyphs, search, glyphNames]);

  const copyGlyph = async (code: number) => {
    const char = String.fromCodePoint(code);
    await navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setCopiedFormat("grid");
    setTimeout(() => {
      setCopiedChar(null);
      setCopiedFormat(null);
    }, 1500);
  };

  const copyCode = async (code: number, format: "char" | "html" | "css" | "js") => {
    let text = "";
    switch (format) {
      case "char":
        text = String.fromCodePoint(code);
        break;
      case "html":
        text = `&#x${code.toString(16)};`;
        break;
      case "css":
        text = `\\${code.toString(16)}`;
        break;
      case "js":
        text = code <= 0xffff
          ? `\\u${code.toString(16).padStart(4, "0")}`
          : `\\u{${code.toString(16)}}`;
        break;
    }
    await navigator.clipboard.writeText(text);
    setCopiedChar(String.fromCodePoint(code));
    setCopiedFormat(format);
    setTimeout(() => {
      setCopiedChar(null);
      setCopiedFormat(null);
    }, 1500);
  };

  const coveragePercent = useMemo(() => {
    if (!fontLoaded || glyphs.length === 0) return 0;
    let covered = 0;
    for (const code of glyphs) {
      if (fontCoverage.has(code)) covered++;
    }
    return Math.round((covered / glyphs.length) * 100);
  }, [fontLoaded, glyphs, fontCoverage]);

  const categoryOptions = [
    { value: "__all__", label: "All Categories" },
    { value: "__custom__", label: "Custom Range..." },
    ...CATEGORIES.map((c) => ({ value: c.name, label: c.name })),
  ];

  return (
    <div className="space-y-6">
      {/* Font upload bar */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Upload className="size-5 text-muted-foreground shrink-0" />
            {fontFile ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{fontFile.name}</span>
                {fontLoaded && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded shrink-0">
                    Loaded
                  </span>
                )}
                {!fontLoaded && fontFile && (
                  <span className="text-xs text-muted-foreground">Failed to load</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Upload a font file to render glyphs in its actual typeface
              </span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {fontFile && (
              <Button variant="ghost" size="sm" onClick={clearFont}>
                <Trash2 className="size-4" />
              </Button>
            )}
            <label>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>Browse</span>
              </Button>
            </label>
          </div>
        </div>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mt-2 border-2 border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".ttf,.otf,.woff,.woff2";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) loadFontFile(file);
            };
            input.click();
          }}
        >
          Drop font file here or paste from clipboard
        </div>
      </div>

      {/* Search & Category */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by character, hex, or glyph name..."
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(v) => {
            setSelectedCategory(v);
            setSearch("");
            setOpenPopover(null);
          }}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Range Input */}
      {selectedCategory === "__custom__" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">U+</label>
            <Input
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
              placeholder="0000"
              className="w-24 font-mono"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">U+</label>
            <Input
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
              placeholder="00ff"
              className="w-24 font-mono"
            />
          </div>
        </div>
      )}

      {/* Glyph Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold">
            {selectedCategory === "__all__"
              ? "All Categories"
              : selectedCategory === "__custom__"
              ? `U+${customStart || "—"}–U+${customEnd || "—"}`
              : selectedCategory}
          </label>
          <div className="flex items-center gap-3">
            {fontLoaded && (
              <span className="text-xs text-muted-foreground">
                Coverage: {coveragePercent}%
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {filteredGlyphs.length} glyphs
            </span>
          </div>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1">
          {filteredGlyphs.slice(0, 400).map((code) => {
            const char = String.fromCodePoint(code);
            const isOpen = openPopover === code;
            const isCopied = copiedFormat === "grid" && copiedChar === char;
            const isCovered = fontLoaded && fontCoverage.has(code);
            const name = glyphNames.get(code);

            return (
              <Popover
                key={code}
                open={isOpen}
                onOpenChange={(open) => setOpenPopover(open ? code : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      copyGlyph(code);
                    }}
                    title={name ? `${name} (U+${code.toString(16).toUpperCase().padStart(4, "0")})` : `U+${code.toString(16).toUpperCase().padStart(4, "0")}`}
                    className={`aspect-square flex items-center justify-center text-xl rounded border transition-colors ${
                      isOpen
                        ? "bg-primary text-primary-foreground border-primary"
                        : isCopied
                        ? "bg-primary/20 border-primary"
                        : fontLoaded && !isCovered
                        ? "bg-muted/30 border-dashed text-muted-foreground/40"
                        : "bg-card hover:border-primary/50"
                    }`}
                    style={fontFamily && isCovered ? { fontFamily } : undefined}
                  >
                    {isCovered || !fontLoaded ? char : "?"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" side="top" align="center">
                  <div className="p-3 border-b flex items-center gap-3">
                    <span
                      className="text-4xl"
                      style={fontFamily && isCovered ? { fontFamily } : undefined}
                    >
                      {char}
                    </span>
                    <div>
                      <div className="font-mono font-medium">
                        U+{code.toString(16).toUpperCase().padStart(4, "0")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Decimal: {code}
                      </div>
                      {name && (
                        <div className="text-xs text-muted-foreground">
                          Name: <span className="font-mono">{name}</span>
                        </div>
                      )}
                      {fontLoaded && (
                        <div className="text-xs mt-1">
                          {isCovered ? (
                            <span className="text-green-600 dark:text-green-400">Present in font</span>
                          ) : (
                            <span className="text-muted-foreground">Missing from font</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-2 grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(code, "char")}
                      className={`justify-start ${copiedFormat === "char" ? "text-primary" : ""}`}
                    >
                      {copiedFormat === "char" ? (
                        <Check className="size-3 mr-2" />
                      ) : (
                        <Copy className="size-3 mr-2" />
                      )}
                      Char
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(code, "html")}
                      className={`justify-start ${copiedFormat === "html" ? "text-primary" : ""}`}
                    >
                      {copiedFormat === "html" ? (
                        <Check className="size-3 mr-2" />
                      ) : (
                        <Copy className="size-3 mr-2" />
                      )}
                      HTML
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(code, "css")}
                      className={`justify-start ${copiedFormat === "css" ? "text-primary" : ""}`}
                    >
                      {copiedFormat === "css" ? (
                        <Check className="size-3 mr-2" />
                      ) : (
                        <Copy className="size-3 mr-2" />
                      )}
                      CSS
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(code, "js")}
                      className={`justify-start ${copiedFormat === "js" ? "text-primary" : ""}`}
                    >
                      {copiedFormat === "js" ? (
                        <Check className="size-3 mr-2" />
                      ) : (
                        <Copy className="size-3 mr-2" />
                      )}
                      JS
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
        {filteredGlyphs.length > 400 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing 400 of {filteredGlyphs.length} glyphs. Use search to narrow results.
          </p>
        )}
      </div>

      <div className="p-4 rounded-lg border bg-muted/30 text-sm text-muted-foreground space-y-1">
        <p><strong className="text-foreground">Tip:</strong> Double-click any glyph to quickly copy the character.</p>
        {fontLoaded && (
          <p><strong className="text-foreground">Font mode active:</strong> Glyphs present in the loaded font are rendered in its typeface. Missing glyphs show <span className="text-muted-foreground">?</span> with a dashed border.</p>
        )}
      </div>
    </div>
  );
}
