import { useState, useCallback, useRef } from "react";
import { Upload, Trash2, Type, Info, Table, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilePaste } from "@/hooks/use-file-paste";
import opentype from "opentype.js";

interface FontMetadata {
  fontFamily: string;
  fullName: string;
  postScriptName: string;
  version: string;
  copyright: string;
  license: string;
  designer: string;
  manufacturer: string;
  description: string;
  glyphCount: number;
  unitsPerEm: number;
  fontWeight: number;
  fontStyle: string;
  panose: string;
  isVariable: boolean;
}

interface AxisRecord {
  tag: string;
  min: number;
  max: number;
  defaultValue: number;
}

type Tab = "preview" | "metadata" | "chars" | "axes";

const PREVIEW_SIZES = [12, 14, 16, 18, 24, 32, 48, 64, 72, 96];
const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "!@#$%^&*()_+-=[]{}|;':\",./<>?",
  "Sphinx of black quartz, judge my vow",
  "Pack my box with five dozen liquor jugs",
];

export default function FontExplorerTool() {
  const [fontUrl, setFontUrl] = useState<string | null>(null);
  const [fontBinary, setFontBinary] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [metadata, setMetadata] = useState<FontMetadata | null>(null);
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [previewSize, setPreviewSize] = useState(48);
  const [error, setError] = useState<string | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [axes, setAxes] = useState<AxisRecord[]>([]);
  const [axisValues, setAxisValues] = useState<Record<string, number>>({});
  const charGridRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".ttf") || file.name.endsWith(".otf") || file.name.endsWith(".woff") || file.name.endsWith(".woff2"))) {
      readFile(file);
    } else {
      setError("Please upload a font file (.ttf, .otf, .woff, .woff2)");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = async (file: File) => {
    setError(null);
    setFontLoaded(false);
    setFileName(file.name);

    const url = URL.createObjectURL(file);
    setFontUrl(url);

    const fontFamilyName = `preview-${Date.now()}`;

    try {
      const fontFace = new FontFace(fontFamilyName, `url(${url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      setFontLoaded(true);

      const buf = await file.arrayBuffer();
      setFontBinary(buf);

      const otFont = opentype.parse(buf);
      const nameTable = otFont.tables.name;
      const os2Table = otFont.tables.os2;
      const headTable = otFont.tables.head;

      const getRecord = (id: number) => {
        const rec = nameTable?.records?.find((r: { nameID: number }) => r.nameID === id);
        if (rec) {
          const decoder = new TextDecoder("utf-16be");
          return decoder.decode(rec.bytes).replace(/\u0000/g, "");
        }
        return "";
      };

      const extracted: FontMetadata = {
        fontFamily: fontFamilyName,
        fullName: getRecord(4) || file.name.replace(/\.(ttf|otf|woff2?)$/i, ""),
        postScriptName: getRecord(6) || file.name.replace(/\.(ttf|otf|woff2?)$/i, "").replace(/\s+/g, "-"),
        version: getRecord(5) || `Version ${otFont.version || "?"}`,
        copyright: getRecord(0) || "Not available",
        license: getRecord(13) || getRecord(10) || "Not available",
        designer: getRecord(9) || "Not available",
        manufacturer: getRecord(8) || "Not available",
        description: getRecord(10) || "Not available",
        glyphCount: otFont.glyphs.length,
        unitsPerEm: headTable?.unitsPerEm || 1000,
        fontWeight: os2Table?.usWeightClass || 400,
        fontStyle: os2Table?.fsSelection & 1 ? "Italic" : "Normal",
        panose: os2Table?.panose ? os2Table.panose.join("-") : "Unknown",
        isVariable: false,
      };
      setMetadata(extracted);

      const foundAxes: AxisRecord[] = [];
      if (otFont.tables.fvar) {
        extracted.isVariable = true;
        for (const axis of otFont.tables.fvar.axes) {
          foundAxes.push({
            tag: axis.tag,
            min: axis.minValue,
            max: axis.maxValue,
            defaultValue: axis.defaultValue,
          });
        }
        setAxes(foundAxes);
        const defaults: Record<string, number> = {};
        for (const a of foundAxes) {
          defaults[a.tag] = a.defaultValue;
        }
        setAxisValues(defaults);
      }
    } catch (err) {
      setError("Failed to load font. The file may be corrupted or invalid.");
      console.error(err);
    }
  };

  useFilePaste(readFile, ".ttf,.otf,.woff,.woff2");

  const clear = () => {
    if (fontUrl) {
      URL.revokeObjectURL(fontUrl);
    }
    setFontUrl(null);
    setFontBinary(null);
    setFileName("");
    setMetadata(null);
    setError(null);
    setFontLoaded(false);
    setAxes([]);
    setAxisValues({});
  };

  const charMapGlyphs = useCallback(() => {
    if (!fontBinary) return [];
    try {
      const otFont = opentype.parse(fontBinary);
      const codes: number[] = [];
      for (const glyph of otFont.glyphs.glyphs) {
        if (glyph?.unicode != null) {
          codes.push(glyph.unicode);
        }
      }
      return [...new Set(codes)].sort((a, b) => a - b);
    } catch {
      return [];
    }
  }, [fontBinary]);

  const tabs: { id: Tab; label: string; icon: typeof Type }[] = [
    { id: "preview", label: "Preview", icon: Type },
    { id: "metadata", label: "Metadata", icon: Info },
    { id: "chars", label: "Characters", icon: Table },
    { id: "axes", label: "Axes", icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {!fontUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("font-input")?.click()}
        >
          <input
            id="font-input"
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Drop font file here</p>
          <p className="text-sm text-muted-foreground mt-1">
            TTF, OTF, WOFF, or WOFF2, or paste
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {fontUrl && metadata && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{metadata.fullName}</h3>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="size-4 mr-2" /> Clear
            </Button>
          </div>

          <div className="flex gap-1 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "preview" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-bold">Preview</label>
                  <Select value={String(previewSize)} onValueChange={(v) => setPreviewSize(parseInt(v))}>
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREVIEW_SIZES.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Type to preview..."
                  className="h-12"
                />
                <div
                  className="p-6 rounded-lg border bg-card min-h-[120px] break-words"
                  style={{
                    fontFamily: fontLoaded ? metadata.fontFamily : "inherit",
                    fontSize: previewSize,
                    lineHeight: 1.4,
                  }}
                >
                  {previewText || "Type something to preview..."}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-bold">Sample Texts</label>
                <div className="grid gap-3">
                  {SAMPLE_TEXTS.map((text, i) => (
                    <div
                      key={text}
                      className="p-4 rounded-lg border bg-card"
                      style={{
                        fontFamily: fontLoaded ? metadata.fontFamily : "inherit",
                        fontSize: i < 2 ? 24 : 18,
                      }}
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-bold">Size Waterfall</label>
                <div className="space-y-2">
                  {[12, 14, 16, 18, 24, 32, 48, 64].map((size) => (
                    <div key={size} className="flex items-baseline gap-4">
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {size}px
                      </span>
                      <span
                        style={{
                          fontFamily: fontLoaded ? metadata.fontFamily : "inherit",
                          fontSize: size,
                        }}
                      >
                        Aa Bb Cc Dd Ee Ff Gg
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-bold">CSS Usage</label>
                <pre className="p-4 rounded-lg border bg-muted/50 text-sm font-mono overflow-x-auto">
{`@font-face {
  font-family: '${metadata.fullName}';
  src: url('${fileName}') format('${fileName.endsWith('.woff2') ? 'woff2' : fileName.endsWith('.woff') ? 'woff' : fileName.endsWith('.otf') ? 'opentype' : 'truetype'}');
  font-weight: ${metadata.fontWeight};
  font-style: ${metadata.fontStyle.toLowerCase()};
}

.my-text {
  font-family: '${metadata.fullName}', sans-serif;
}`}
                </pre>
              </div>
            </>
          )}

          {activeTab === "metadata" && (
            <div className="p-6 rounded-lg border bg-card">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">File Name</div>
                  <div className="font-mono mt-1">{fileName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</div>
                  <div className="font-mono mt-1">{metadata.fullName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">PostScript Name</div>
                  <div className="font-mono mt-1">{metadata.postScriptName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Version</div>
                  <div className="font-mono mt-1">{metadata.version}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Designer</div>
                  <div className="font-mono mt-1">{metadata.designer}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Manufacturer</div>
                  <div className="font-mono mt-1">{metadata.manufacturer}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Weight</div>
                  <div className="font-mono mt-1">{metadata.fontWeight}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Style</div>
                  <div className="font-mono mt-1">{metadata.fontStyle}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Glyph Count</div>
                  <div className="font-mono mt-1">{metadata.glyphCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Units Per Em</div>
                  <div className="font-mono mt-1">{metadata.unitsPerEm}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Copyright</div>
                  <div className="font-mono mt-1 text-sm">{metadata.copyright}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">License</div>
                  <div className="font-mono mt-1 text-sm">{metadata.license}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Description</div>
                  <div className="font-mono mt-1 text-sm">{metadata.description}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Panose</div>
                  <div className="font-mono mt-1">{metadata.panose}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chars" && fontBinary && (
            <div>
              <label className="font-bold block mb-3">Character Map ({charMapGlyphs().length} glyphs)</label>
              {charMapGlyphs().length === 0 ? (
                <p className="text-muted-foreground">No character map available.</p>
              ) : (
                <div ref={charGridRef} className="grid grid-cols-10 sm:grid-cols-16 md:grid-cols-20 gap-1 max-h-96 overflow-y-auto">
                  {charMapGlyphs().slice(0, 1500).map((code) => {
                    const char = String.fromCodePoint(code);
                    return (
                      <div
                        key={code}
                        className="aspect-square flex items-center justify-center text-sm rounded border bg-card hover:bg-muted"
                        title={`U+${code.toString(16).toUpperCase().padStart(4, "0")}`}
                        style={{ fontFamily: metadata.fontFamily }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              )}
              {charMapGlyphs().length > 1500 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Showing 1500 of {charMapGlyphs().length} glyphs.
                </p>
              )}
            </div>
          )}

          {activeTab === "axes" && (
            <div className="space-y-6">
              {!metadata.isVariable ? (
                <p className="text-muted-foreground">This font does not have variable font axes.</p>
              ) : (
                axes.map((axis) => {
                  const axisLabels: Record<string, string> = {
                    wght: "Weight",
                    wdth: "Width",
                    opsz: "Optical Size",
                    ital: "Italic",
                    slnt: "Slant",
                    GRAD: "Grade",
                    XTRA: "X Transparency",
                    YTRA: "Y Transparency",
                    YTLC: "Y Transparent Lower Case",
                    YTUC: "Y Transparent Upper Case",
                    YOPQ: "Y Opq",
                    YTDE: "Y Transparent Descender",
                    YTAS: "Y Transparent Ascender",
                  };
                  const label = axisLabels[axis.tag] || axis.tag;
                  const val = axisValues[axis.tag] ?? axis.defaultValue;

                  return (
                    <div key={axis.tag} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-medium">{label} ({axis.tag})</label>
                        <span className="font-mono text-sm">{val.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={axis.min}
                        max={axis.max}
                        step={(axis.max - axis.min) / 100}
                        value={val}
                        onChange={(e) => {
                          const newVal = parseFloat(e.target.value);
                          setAxisValues((prev) => ({ ...prev, [axis.tag]: newVal }));
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{axis.min}</span>
                        <span>{axis.max}</span>
                      </div>
                    </div>
                  );
                })
              )}
              {axes.length > 0 && (
                <div className="space-y-3">
                  <label className="font-bold">Variable Font Preview</label>
                  <Input
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="h-12"
                  />
                  <div
                    className="p-6 rounded-lg border bg-card min-h-[100px] break-words text-2xl"
                    style={{
                      fontFamily: metadata.fontFamily,
                      fontVariationSettings: Object.entries(axisValues)
                        .map(([k, v]) => `"${k}" ${v}`)
                        .join(", "),
                    }}
                  >
                    {previewText || "Type something..."}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
