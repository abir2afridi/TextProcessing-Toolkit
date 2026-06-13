import { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  Copy,
  Check,
  Loader2,
  Info,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  Package,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface BatchItem {
  id: string;
  content: string;
  status: "pending" | "generating" | "done" | "error";
  dataUrl?: string;
}

type BarcodeType =
  | "qrcode"
  | "microqr"
  | "datamatrix"
  | "azteccode"
  | "pdf417"
  | "code128"
  | "code39"
  | "ean13"
  | "upca";

type CharSet = "alphanumeric" | "alphanumeric-limited" | "numeric";

const BARCODE_TYPES: Record<
  BarcodeType,
  {
    name: string;
    category: "2d" | "1d";
    charSet: CharSet;
    charHint: string;
    allowedPattern: RegExp;
    inventor: string;
    year: string;
    description: string;
    placeholder: string;
    validation?: (value: string) => string | null;
  }
> = {
  qrcode: {
    name: "QR Code",
    category: "2d",
    charSet: "alphanumeric",
    charHint: "Letters, numbers, URLs, and symbols (up to 4,296 chars)",
    allowedPattern: /^[\x00-\x7F]*$/,
    inventor: "Denso Wave",
    year: "1994",
    description:
      "Quick Response code. Widely used in advertising, payments, and product tracking. Can encode up to 4,296 alphanumeric characters.",
    placeholder: "https://example.com or text",
  },
  microqr: {
    name: "Micro QR",
    category: "2d",
    charSet: "alphanumeric",
    charHint: "Letters, numbers, and symbols",
    allowedPattern: /^[\x00-\x7F]*$/,
    inventor: "Denso Wave",
    year: "2004",
    description:
      "Smaller version of QR code for space-constrained applications. Uses only one position detection pattern.",
    placeholder: "Short text or URL",
  },
  datamatrix: {
    name: "Data Matrix",
    category: "2d",
    charSet: "alphanumeric",
    charHint: "Letters, numbers, and symbols",
    allowedPattern: /^[\x00-\x7F]*$/,
    inventor: "International Data Matrix Inc. (RVSI Acuity CiMatrix)",
    year: "1987",
    description:
      "Used extensively in electronics, healthcare, and logistics. Can encode up to 2,335 alphanumeric characters.",
    placeholder: "Product ID or serial number",
  },
  azteccode: {
    name: "Aztec Code",
    category: "2d",
    charSet: "alphanumeric",
    charHint: "Letters, numbers, and symbols",
    allowedPattern: /^[\x00-\x7F]*$/,
    inventor: "Andrew Longacre Jr. (Welch Allyn)",
    year: "1995",
    description:
      "Named for resemblance to Aztec pyramids. Used on airline boarding passes and by Deutsche Bahn.",
    placeholder: "Boarding pass or ticket data",
  },
  pdf417: {
    name: "PDF417",
    category: "2d",
    charSet: "alphanumeric",
    charHint: "Letters, numbers, and symbols",
    allowedPattern: /^[\x00-\x7F]*$/,
    inventor: "Ynjiun Paul Wang (Symbol Technologies)",
    year: "1991",
    description:
      "Portable Data File with 4 bars and spaces in 17 modules. Used on IDs, shipping labels, and boarding passes.",
    placeholder: "ID or license data",
  },
  code128: {
    name: "Code 128",
    category: "1d",
    charSet: "alphanumeric",
    charHint: "Letters, numbers, and symbols",
    allowedPattern: /^[\x00-\x7F]*$/,
    inventor: "Computer Identics Corporation",
    year: "1981",
    description:
      "High-density barcode for alphanumeric data. Widely used in shipping and packaging industries.",
    placeholder: "ABC-12345",
  },
  code39: {
    name: "Code 39",
    category: "1d",
    charSet: "alphanumeric-limited",
    charHint: "A-Z (uppercase), 0-9, and - . $ / + % space",
    allowedPattern: /^[A-Z0-9\-. $/+%]*$/,
    inventor: "David Allais & Ray Stevens (Intermec)",
    year: "1974",
    description:
      "One of the first alphanumeric barcodes. Still used in automotive, defense, and healthcare.",
    placeholder: "CODE39TEST",
    validation: (value: string) => {
      const valid = /^[A-Z0-9\-. $/+%]*$/.test(value);
      return valid
        ? null
        : "Code 39 only supports: A-Z (uppercase), 0-9, - . $ / + % and space";
    },
  },
  ean13: {
    name: "EAN-13",
    category: "1d",
    charSet: "numeric",
    charHint: "Numbers only (12-13 digits)",
    allowedPattern: /^\d*$/,
    inventor: "George Laurer (IBM), adapted from UPC",
    year: "1976",
    description:
      "European Article Number. Standard barcode for retail products worldwide.",
    placeholder: "5901234123457",
    validation: (value: string) => {
      if (value.length > 0 && !/^\d{12,13}$/.test(value)) {
        return "EAN-13 requires exactly 12 or 13 digits";
      }
      return null;
    },
  },
  upca: {
    name: "UPC-A",
    category: "1d",
    charSet: "numeric",
    charHint: "Numbers only (11-12 digits)",
    allowedPattern: /^\d*$/,
    inventor: "George Laurer (IBM)",
    year: "1973",
    description:
      "Universal Product Code. The original retail barcode, still dominant in North America.",
    placeholder: "012345678905",
    validation: (value: string) => {
      if (value.length > 0 && !/^\d{11,12}$/.test(value)) {
        return "UPC-A requires exactly 11 or 12 digits";
      }
      return null;
    },
  },
};

const isContentCompatible = (content: string, type: BarcodeType): boolean => {
  if (!content) return true;
  return BARCODE_TYPES[type].allowedPattern.test(content);
};

const filterContent = (content: string, type: BarcodeType): string => {
  if (type === "code39") {
    content = content.toUpperCase();
  }
  const pattern = BARCODE_TYPES[type].allowedPattern;
  return content
    .split("")
    .filter((char) => pattern.test(char))
    .join("");
};

interface CodeOptions {
  padding: number;
  foregroundColor: string;
  backgroundColor: string;
}

const defaultOptions: CodeOptions = {
  padding: 2,
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function BarcodeGenny() {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [codeType, setCodeType] = useState<BarcodeType>("datamatrix");
  const [content, setContent] = useState("");
  const [size, setSize] = useState(300);
  const [options, setOptions] = useState<CodeOptions>(defaultOptions);
  const [codeDataUrl, setCodeDataUrl] = useState<string | null>(null);
  const [codeSvg, setCodeSvg] = useState<string | null>(null);
  const [copied, setCopied] = useState<"png" | "svg" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"png" | "svg">("png");

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchGenerating, setBatchGenerating] = useState(false);

  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const handleCodeTypeChange = (newType: BarcodeType) => {
    if (!isContentCompatible(content, newType)) {
      setContent("");
    }
    setCodeType(newType);
  };

  const handleContentChange = (value: string) => {
    const filtered = filterContent(value, codeType);
    setContent(filtered);
  };

  const generateCode = useCallback(async () => {
    if (!content.trim()) {
      setCodeDataUrl(null);
      setCodeSvg(null);
      setError(null);
      return;
    }

    const typeInfo = BARCODE_TYPES[codeType];
    if (typeInfo.validation) {
      const validationError = typeInfo.validation(content);
      if (validationError) {
        setError(validationError);
        setCodeDataUrl(null);
        setCodeSvg(null);
        return;
      }
    }

    setGenerating(true);
    setError(null);

    try {
      const bwipjs = await import("bwip-js");

      const bwipTypeMap: Record<BarcodeType, string> = {
        qrcode: "qrcode",
        microqr: "microqrcode",
        datamatrix: "datamatrix",
        azteccode: "azteccode",
        pdf417: "pdf417",
        code128: "code128",
        code39: "code39",
        ean13: "ean13",
        upca: "upca",
      };

      const is1D = typeInfo.category === "1d";
      const bwipId = bwipTypeMap[codeType];

      const commonOpts = {
        bcid: bwipId,
        text: content,
        scale: is1D ? 3 : Math.max(2, Math.floor(size / 100)),
        includetext: is1D,
        textxalign: "center" as const,
        paddingwidth: options.padding * 2,
        paddingheight: options.padding * 2,
        barcolor: options.foregroundColor.replace("#", ""),
        ...(codeType === "pdf417"
          ? { height: 10 }
          : is1D
            ? { height: 15 }
            : {}),
      };

      try {
        const svgStr = await bwipjs.toSVG({
          ...commonOpts,
          backgroundcolor: "ffffff",
        });
        setCodeSvg(svgStr);
      } catch {
        setCodeSvg(null);
      }

      const canvas = document.createElement("canvas");
      await bwipjs.toCanvas(canvas, {
        ...commonOpts,
        backgroundcolor: options.backgroundColor.replace("#", ""),
      });

      const dataUrl = canvas.toDataURL("image/png");
      setCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Code generation failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate barcode"
      );
      setCodeDataUrl(null);
      setCodeSvg(null);
    } finally {
      setGenerating(false);
    }
  }, [content, codeType, size, options]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      generateCode();
    }, 300);
    return () => clearTimeout(debounce);
  }, [generateCode]);

  const downloadCode = (format: "png" | "svg" = exportFormat) => {
    if (format === "svg" && codeSvg) {
      const filename = `${BARCODE_TYPES[codeType].name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      const blob = new Blob([codeSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${filename}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (!codeDataUrl) return;
    const filename = `${BARCODE_TYPES[codeType].name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = codeDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (exportFormat === "svg" && codeSvg) {
      try {
        await navigator.clipboard.writeText(codeSvg);
        setCopied("svg");
        setTimeout(() => setCopied(null), 1500);
      } catch (err) {
        console.error("Copy SVG failed:", err);
      }
      return;
    }
    if (!codeDataUrl) return;

    try {
      const response = await fetch(codeDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied("png");
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const addBatchItem = () => {
    setBatchItems((prev) => [
      ...prev,
      { id: generateId(), content: "", status: "pending" },
    ]);
  };

  const removeBatchItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBatchItem = (id: string, value: string) => {
    const filtered = filterContent(value, codeType);
    setBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: filtered } : item))
    );
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((line) => filterContent(line.trim(), codeType))
        .filter((line) => line.length > 0);

      const newItems: BatchItem[] = lines.map((line) => ({
        id: generateId(),
        content: line,
        status: "pending",
      }));

      setBatchItems((prev) => [...prev, ...newItems]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearAllBatch = () => setBatchItems([]);

  const generateBatch = async () => {
    if (batchItems.length === 0) return;

    setBatchGenerating(true);
    const bwipjs = await import("bwip-js");
    const JSZip = (await import("jszip")).default;

    const zip = new JSZip();
    const typeInfo = BARCODE_TYPES[codeType];
    const is1D = typeInfo.category === "1d";

    const bwipTypeMap: Record<BarcodeType, string> = {
      microqr: "microqrcode",
      datamatrix: "datamatrix",
      azteccode: "azteccode",
      pdf417: "pdf417",
      code128: "code128",
      code39: "code39",
      ean13: "ean13",
      upca: "upca",
    };

    for (const item of batchItems) {
      if (!item.content.trim()) continue;

      if (typeInfo.validation) {
        const validationError = typeInfo.validation(item.content);
        if (validationError) {
          setBatchItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "error" } : i
            )
          );
          continue;
        }
      }

      setBatchItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "generating" } : i
        )
      );

      try {
        const canvas = document.createElement("canvas");

        const bwipOptions = {
          bcid: bwipTypeMap[codeType],
          text: item.content,
          scale: is1D ? 3 : Math.max(2, Math.floor(size / 100)),
          includetext: is1D,
          textxalign: "center" as const,
          paddingwidth: options.padding * 2,
          paddingheight: options.padding * 2,
          backgroundcolor: options.backgroundColor.replace("#", ""),
          barcolor: options.foregroundColor.replace("#", ""),
          ...(codeType === "pdf417"
            ? { height: 10 }
            : is1D
              ? { height: 15 }
              : {}),
        };

        await bwipjs.toCanvas(canvas, bwipOptions);

        const dataUrl = canvas.toDataURL("image/png");

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const safeName = item.content
          .slice(0, 30)
          .replace(/[^a-zA-Z0-9]/g, "_");
        zip.file(`${typeInfo.name.toLowerCase().replace(/\s+/g, "-")}-${safeName}.png`, blob);

        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "done", dataUrl } : i
          )
        );
      } catch {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "error" } : i
          )
        );
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${typeInfo.name.toLowerCase().replace(/\s+/g, "-")}-batch-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);

    setBatchGenerating(false);
  };

  const currentType = BARCODE_TYPES[codeType];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-lg font-bold">Code Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(BARCODE_TYPES).map(([key, info]) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button
                    variant={codeType === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCodeTypeChange(key as BarcodeType)}
                    className="text-xs"
                  >
                    {info.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-bold">{info.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {info.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single</TabsTrigger>
            <TabsTrigger value="batch">Batch Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="font-bold">Content</Label>
              <Input
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") generateCode(); }}
                placeholder={currentType.placeholder}
                className="text-base h-12"
              />
              <p className="text-xs text-muted-foreground">
                {currentType.charHint}
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="font-bold text-lg">Preview</Label>
                <div
                  className="border-4 border-card rounded-xl p-4 flex items-center justify-center min-h-[280px]"
                  style={{ backgroundColor: options.backgroundColor }}
                >
                  {generating ? (
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  ) : content.trim() && !error && codeDataUrl ? (
                    <img src={codeDataUrl} alt={currentType.name} className="max-w-full h-auto" style={{ maxWidth: `${size}px` }} />
                  ) : !content.trim() ? (
                    <div className="text-center text-muted-foreground">
                      <p>Enter content to generate {currentType.name}</p>
                    </div>
                  ) : null}
                </div>

                {codeDataUrl && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground border rounded-lg px-3 py-2">
                    <span className="font-medium text-foreground">Info:</span>
                    <span>{currentType.name}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{content.length} chars</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{exportFormat === "png" ? "PNG" : "SVG"}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{size}px</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="flex rounded-md border border-input overflow-hidden shrink-0">
                    <button type="button"
                      onClick={() => setExportFormat("png")}
                      className={"px-3 py-2 text-xs font-medium transition-colors" + (exportFormat === "png" ? " bg-primary text-primary-foreground" : " hover:bg-muted")}
                    >
                      PNG
                    </button>
                    <button type="button"
                      onClick={() => setExportFormat("svg")}
                      className={"px-3 py-2 text-xs font-medium transition-colors border-l border-input" + (exportFormat === "svg" ? " bg-primary text-primary-foreground" : " hover:bg-muted")}
                    >
                      SVG
                    </button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadCode(exportFormat)}
                    disabled={!codeDataUrl && !(exportFormat === "svg" && codeSvg)}
                    className="h-8 flex-1"
                  >
                    <Download className="size-4 mr-1.5" />
                    {exportFormat === "png" ? "PNG" : "SVG"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!codeDataUrl && !(exportFormat === "svg" && codeSvg)}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 mr-1.5" />
                        {exportFormat === "svg" ? "SVG" : "Image"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-bold text-lg">Options</Label>
                <Accordion
                  type="multiple"
                  defaultValue={["basic", "colors"]}
                  className="space-y-2"
                >
                  <AccordionItem value="basic" className="border rounded-lg px-4">
                    <AccordionTrigger className="font-bold">
                      Basic Settings
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Size</Label>
                          <span className="text-sm text-muted-foreground">
                            {size}px
                          </span>
                        </div>
                        <Slider
                          value={[size]}
                          onValueChange={([v]) => setSize(v)}
                          min={100}
                          max={600}
                          step={10}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Padding</Label>
                          <span className="text-sm text-muted-foreground">
                            {options.padding}
                          </span>
                        </div>
                        <Slider
                          value={[options.padding]}
                          onValueChange={([v]) =>
                            setOptions((prev) => ({ ...prev, padding: v }))
                          }
                          min={0}
                          max={10}
                          step={1}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="colors" className="border rounded-lg px-4">
                    <AccordionTrigger className="font-bold">Colors</AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Foreground</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={options.foregroundColor}
                              onChange={(e) =>
                                setOptions((prev) => ({
                                  ...prev,
                                  foregroundColor: e.target.value,
                                }))
                              }
                              className="w-12 h-10 rounded border cursor-pointer"
                            />
                            <Input
                              value={options.foregroundColor}
                              onChange={(e) =>
                                setOptions((prev) => ({
                                  ...prev,
                                  foregroundColor: e.target.value,
                                }))
                              }
                              className="font-mono flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Background</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={options.backgroundColor}
                              onChange={(e) =>
                                setOptions((prev) => ({
                                  ...prev,
                                  backgroundColor: e.target.value,
                                }))
                              }
                              className="w-12 h-10 rounded border cursor-pointer"
                            />
                            <Input
                              value={options.backgroundColor}
                              onChange={(e) =>
                                setOptions((prev) => ({
                                  ...prev,
                                  backgroundColor: e.target.value,
                                }))
                              }
                              className="font-mono flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {batchItems.filter((i) => i.content.trim()).length} item{batchItems.length !== 1 ? "s" : ""}
              </span>
              {batchItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllBatch} className="h-7 gap-1 text-xs">
                  <Eraser className="size-3" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {batchItems.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <Input
                    value={item.content}
                    onChange={(e) => updateBatchItem(item.id, e.target.value)}
                    placeholder={currentType.placeholder}
                    className="flex-1"
                  />
                  {item.status === "done" && item.dataUrl && (
                    <img src={item.dataUrl} alt="" className="h-8 rounded" />
                  )}
                  {item.status === "generating" && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="size-4 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBatchItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <input
                ref={batchFileInputRef}
                type="file"
                accept=".txt,text/plain"
                onChange={handleBatchFileUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={addBatchItem}
                  className="flex-1"
                >
                  <Plus className="size-4 mr-2" />
                  Add Item
                </Button>
                <Button
                  variant="outline"
                  onClick={() => batchFileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="size-4 mr-2" />
                  Upload List
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentType.charHint}. Upload a text file with one item per line.
              </p>
              <Button
                onClick={generateBatch}
                disabled={batchItems.length === 0 || batchGenerating}
                className="w-full"
              >
                {batchGenerating ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Package className="size-4 mr-2" />
                )}
                Generate &amp; Download ZIP
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Info className="size-5" />
            <h3 className="font-bold">About {currentType.name}</h3>
          </div>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Invented by:</span>{" "}
              {currentType.inventor}
            </p>
            <p>
              <span className="text-muted-foreground">Year:</span>{" "}
              {currentType.year}
            </p>
            <p className="text-muted-foreground mt-2">
              {currentType.description}
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
