import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Copy,
  Check,
  Trash2,
  Settings2,
  ChevronsUpDown,
  Minus,
  Plus,
} from "lucide-react";
import type { Config } from "svgo";
import { optimize } from "svgo/browser";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFilePaste } from "@/hooks/use-file-paste";

interface PluginToggle {
  id: string;
  label: string;
  enabled: boolean;
}

export default function SvgOptimiserTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [copiedOptimized, setCopiedOptimized] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [multipass, setMultipass] = useState(true);
  const [floatPrecision, setFloatPrecision] = useState(3);
  const [customAttrs, setCustomAttrs] = useState("(data-.*)");
  const [stats, setStats] = useState<{
    original: number;
    optimized: number;
    saved: number;
    percent: number;
  } | null>(null);

  const [plugins, setPlugins] = useState<PluginToggle[]>([
    { id: "removeDimensions", label: "Remove dimensions", enabled: true },
    { id: "removeComments", label: "Remove comments", enabled: true },
    { id: "removeMetadata", label: "Remove metadata", enabled: true },
    { id: "removeTitle", label: "Remove title", enabled: false },
    { id: "removeDesc", label: "Remove desc", enabled: false },
    { id: "removeScriptElement", label: "Remove scripts", enabled: true },
    { id: "removeStyleElement", label: "Remove styles", enabled: false },
    { id: "sortAttrs", label: "Sort attributes", enabled: false },
  ]);

  const togglePlugin = (id: string) => {
    setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const buildConfig = useCallback(() => {
    const svgoPlugins: { name: string; params?: Record<string, unknown> }[] = [
      { name: "preset-default" },
    ];

    if (floatPrecision > 0) {
      svgoPlugins.push({
        name: "convertPathData",
        params: { floatPrecision },
      });
      svgoPlugins.push({
        name: "convertTransform",
        params: { floatPrecision },
      });
      svgoPlugins.push({
        name: "cleanupNumericValues",
        params: { floatPrecision },
      });
    }

    for (const p of plugins) {
      if (p.id === "removeDimensions") {
        if (p.enabled) svgoPlugins.push({ name: "removeDimensions" });
      } else if (p.id === "removeComments") {
        svgoPlugins.push({ name: "removeComments", params: { enabled: p.enabled } });
      } else if (p.id === "removeMetadata") {
        svgoPlugins.push({ name: "removeMetadata", params: { enabled: p.enabled } });
      } else if (p.id === "removeTitle") {
        svgoPlugins.push({ name: "removeTitle", params: { enabled: p.enabled } });
      } else if (p.id === "removeDesc") {
        svgoPlugins.push({ name: "removeDesc", params: { enabled: p.enabled } });
      } else if (p.id === "removeScriptElement") {
        svgoPlugins.push({ name: "removeScriptElement", params: { enabled: p.enabled } });
      } else if (p.id === "removeStyleElement") {
        svgoPlugins.push({ name: "removeStyleElement", params: { enabled: p.enabled } });
      } else if (p.id === "sortAttrs") {
        svgoPlugins.push({ name: "sortAttrs", params: { enabled: p.enabled } });
      }
    }

    if (customAttrs.trim()) {
      svgoPlugins.push({
        name: "removeAttrs",
        params: { attrs: customAttrs.trim() },
      });
    }

    return { multipass, plugins: svgoPlugins } as Config;
  }, [multipass, floatPrecision, plugins, customAttrs]);

  useEffect(() => {
    if (!output) {
      setPreviewUrl("");
      return;
    }
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [output]);

  const optimizeSvg = useCallback(
    (svg: string) => {
      if (!svg.trim().startsWith("<svg") && !svg.trim().startsWith("<?xml")) {
        setOutput("");
        setStats(null);
        return;
      }
      try {
        const result = optimize(svg, buildConfig());
        const optimized = result.data;
        setOutput(optimized);

        const originalSize = new Blob([svg]).size;
        const optimizedSize = new Blob([optimized]).size;
        const saved = originalSize - optimizedSize;
        const percent = Math.round((saved / originalSize) * 100);

        setStats({
          original: originalSize,
          optimized: optimizedSize,
          saved,
          percent,
        });
      } catch (err) {
        toast.error(
          `SVG optimisation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        setOutput("");
        setStats(null);
      }
    },
    [buildConfig],
  );

  useEffect(() => {
    if (input) {
      optimizeSvg(input);
    }
  }, [optimizeSvg, input]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "image/svg+xml") {
      readFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
  };

  useFilePaste(readFile, ".svg,image/svg+xml");

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setFileName("");
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopiedOptimized(true);
    setTimeout(() => setCopiedOptimized(false), 1500);
    toast.success("Optimized SVG copied");
  };

  const copyInput = async () => {
    await navigator.clipboard.writeText(input);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 1500);
    toast.success("Original SVG copied");
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName ? fileName.replace(".svg", "-optimized.svg") : "optimized.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setFileName("");
    setStats(null);
    setPreviewUrl("");
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("svg-input")?.click()}
      >
        <input
          id="svg-input"
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Drop SVG file here</p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to select, or paste SVG code below
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold">Input SVG</label>
          <div className="flex gap-1">
            {input && (
              <>
                <Button variant="ghost" size="sm" onClick={copyInput}>
                  {copiedOriginal ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={clear}>
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={handlePaste}
          placeholder="Paste your SVG code here..."
          className="w-full h-40 p-4 rounded-lg border bg-background font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {input && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="w-full"
          >
            <Settings2 className="size-4 mr-2" />
            {showOptions ? "Hide" : "Show"} Advanced Options
            <ChevronsUpDown className="size-4 ml-2" />
          </Button>

          {showOptions && (
            <div className="grid gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="multipass"
                  checked={multipass}
                  onChange={() => setMultipass(!multipass)}
                  className="rounded"
                />
                <Label htmlFor="multipass">Multipass (apply plugins multiple times)</Label>
              </div>

              <div className="space-y-1.5">
                <Label>Float precision</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setFloatPrecision(Math.max(0, floatPrecision - 1))}
                    disabled={floatPrecision <= 0}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Input
                    type="number"
                    value={floatPrecision}
                    onChange={(e) => setFloatPrecision(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-center h-8"
                    min="0"
                    max="10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setFloatPrecision(Math.min(10, floatPrecision + 1))}
                    disabled={floatPrecision >= 10}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>SVGO Plugins</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {plugins.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`plugin-${p.id}`}
                        checked={p.enabled}
                        onChange={() => togglePlugin(p.id)}
                        className="rounded"
                      />
                      <Label htmlFor={`plugin-${p.id}`} className="text-sm">
                        {p.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="custom-attrs">Remove attributes (regex pattern)</Label>
                <Input
                  id="custom-attrs"
                  value={customAttrs}
                  onChange={(e) => setCustomAttrs(e.target.value)}
                  placeholder="(data-.*)"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card text-center">
            <div className="text-sm text-muted-foreground">Original</div>
            <div className="text-2xl font-bold">{formatBytes(stats.original)}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <div className="text-sm text-muted-foreground">Optimized</div>
            <div className="text-2xl font-bold">{formatBytes(stats.optimized)}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <div className="text-sm text-muted-foreground">Saved</div>
            <div className="text-2xl font-bold text-primary">{formatBytes(stats.saved)}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <div className="text-sm text-muted-foreground">Reduction</div>
            <div className="text-2xl font-bold text-primary">{stats.percent}%</div>
          </div>
        </div>
      )}

      {output && (
        <div className="space-y-3">
          <label className="font-bold">Optimized SVG</label>
          <textarea
            value={output}
            readOnly
            className="w-full h-40 p-4 rounded-lg border bg-muted/50 font-mono text-sm resize-y"
          />

          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="text-sm text-muted-foreground mb-2">Preview</div>
            <div className="flex items-center justify-center p-4 bg-white rounded overflow-hidden">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Optimised SVG preview"
                  className="max-w-full max-h-50 w-auto h-auto"
                />
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Button size="lg" className="h-14" onClick={downloadOutput}>
              <Download className="size-5 mr-2" />
              Download
            </Button>
            <Button size="lg" variant="outline" className="h-14" onClick={copyOutput}>
              {copiedOptimized ? (
                <>
                  <Check className="size-5 mr-2" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="size-5 mr-2" /> Copy Optimized
                </>
              )}
            </Button>
            <Button size="lg" variant="secondary" className="h-14" onClick={copyInput}>
              {copiedOriginal ? (
                <>
                  <Check className="size-5 mr-2" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="size-5 mr-2" /> Copy Original
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
