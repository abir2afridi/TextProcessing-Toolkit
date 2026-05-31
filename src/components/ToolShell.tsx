import { type ReactNode, useEffect, useRef, useState, useCallback } from "react";
import {
  Star, Copy, Download, Trash2, ArrowLeft, Upload, ClipboardPaste,
  WrapText, Maximize2, Minimize2, Share2, Check, FileText, Printer,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/lib/storage";
import { type ToolMeta } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  tool: ToolMeta;
  children: ReactNode;
}

export function ToolShell({ tool, children }: Props) {
  const { t } = useTranslation();
  const { isFavorite, toggle } = useFavorites();
  const Icon = tool.icon;
  const fav = isFavorite(tool.slug);
  const [fullscreen, setFullscreen] = useState(false);
  const [shared, setShared] = useState(false);

  // ESC exits fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      toast.success("Link copied");
      setTimeout(() => setShared(false), 1200);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        fullscreen ? "fixed inset-0 z-50 h-screen w-screen bg-background" : "h-full",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface/50 px-4 py-3 sm:gap-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-sm border border-border bg-background">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-sm border-border bg-transparent font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {t(`categories.${tool.category}`)}
              </Badge>
              <code className="font-mono text-[10px] text-muted-foreground/70">/{tool.slug}</code>
            </div>
            <h1 className="mt-1 font-mono text-xl font-bold tracking-tight">{t(`tools.${tool.slug}.name`)}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{t(`tools.${tool.slug}.tagline`)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="font-mono text-xs">
            <Link to="/"><ArrowLeft className="mr-1 h-3.5 w-3.5" />all tools</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={share} className="font-mono text-xs" title="Copy share link">
            {shared ? <Check className="h-3.5 w-3.5 text-primary" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="max-sm:hidden">share</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="font-mono text-xs" title="Print">
            <Printer className="h-3.5 w-3.5" /><span className="max-sm:hidden">print</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFullscreen((f) => !f)} className="font-mono text-xs" title="Toggle fullscreen (Esc)">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="max-sm:hidden">{fullscreen ? "exit" : "focus"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggle(tool.slug)}
            className={cn("rounded-sm font-mono text-xs", fav && "border-primary/40 text-primary")}
          >
            <Star className={cn("mr-1.5 h-3.5 w-3.5", fav && "fill-primary text-primary")} />
            {fav ? "favorited" : "favorite"}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-background">
        <div className="mx-auto w-full max-w-[1400px] p-6">{children}</div>
      </div>
    </div>
  );
}

interface IOPanelProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  monospace?: boolean;
  showActions?: boolean;
  rightSlot?: ReactNode;
  /** Optional loader for an example/sample. Renders a quick-load button. */
  onLoadSample?: () => void;
  /** Accept attribute for file upload. Defaults to text-ish files. */
  fileAccept?: string;
  /** Max file size in MB (default 5). */
  maxFileMB?: number;
}

function fmt(n: number) {
  return n.toLocaleString();
}

function countWords(s: string) {
  if (!s) return 0;
  return (s.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu) || []).length;
}

export function IOPanel({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  rows = 18,
  monospace = true,
  showActions = true,
  rightSlot,
  onLoadSample,
  fileAccept = ".txt,.md,.json,.csv,.xml,.html,.yml,.yaml,.log,.js,.ts,.tsx,.jsx,.py,.css,text/*,application/json,application/xml",
  maxFileMB = 5,
}: IOPanelProps) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editable = !readOnly && !!onChange;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const onPaste = async () => {
    if (!editable) return;
    try {
      const text = await navigator.clipboard.readText();
      onChange!(text);
      toast.success(`Pasted ${fmt(text.length)} chars`);
    } catch {
      toast.error("Clipboard read blocked");
    }
  };

  const onDownload = () => {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readFile = useCallback(
    async (file: File) => {
      if (!editable) return;
      if (file.size > maxFileMB * 1024 * 1024) {
        toast.error(`File exceeds ${maxFileMB} MB limit`);
        return;
      }
      try {
        const text = await file.text();
        onChange!(text);
        toast.success(`Loaded ${file.name} (${fmt(text.length)} chars)`);
      } catch {
        toast.error("Could not read file");
      }
    },
    [editable, maxFileMB, onChange],
  );

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) readFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!editable) return;
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  };

  const bytes = new Blob([value]).size;
  const charCount = value.length;
  const lineCount = value === "" ? 0 : value.split(/\r?\n/).length;
  const wordCount = countWords(value);

  return (
    <div
      className={cn(
        "flex flex-col rounded-sm border border-border bg-surface transition-colors",
        dragOver && "border-primary ring-1 ring-primary/40",
      )}
      onDragOver={(e) => { if (editable) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/60 max-sm:hidden">
            {fmt(lineCount)} ln · {fmt(wordCount)} w · {fmt(charCount)} ch · {fmt(bytes)} B
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/60 sm:hidden">
            {fmt(lineCount)} ln · {fmt(charCount)} ch
          </span>
        </div>
        <div className="flex items-center gap-1">
          {rightSlot}
          {showActions && (
            <>
              {editable && onLoadSample && (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onLoadSample} title="Load sample">
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              )}
              {editable && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={fileAccept}
                    onChange={onFilePick}
                    className="hidden"
                  />
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => fileRef.current?.click()} title="Upload file">
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onPaste} title="Paste from clipboard">
                    <ClipboardPaste className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 px-2", wrap && "text-primary")}
                onClick={() => setWrap((w) => !w)}
                title={wrap ? "Disable line wrap" : "Enable line wrap"}
              >
                <WrapText className="h-3.5 w-3.5" />
              </Button>
              {editable && (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onChange!("")} title="Clear" disabled={!value}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onCopy} disabled={!value} title="Copy">
                <Copy className="h-3.5 w-3.5" />
                {copied && <span className="ml-1 font-mono text-[10px]">ok</span>}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onDownload} disabled={!value} title="Download as .txt">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder ?? (editable ? "Type, paste, or drop a file here…" : undefined)}
          spellCheck={false}
          rows={rows}
          wrap={wrap ? "soft" : "off"}
          className={cn(
            "w-full resize-y bg-transparent p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40",
            monospace ? "font-mono" : "font-sans",
            !wrap && "whitespace-pre overflow-x-auto",
          )}
        />
        {dragOver && editable && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-sm border border-dashed border-primary px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary">
              drop file to load
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function OptionRow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-sm border border-border bg-surface px-3 py-3">
      {children}
    </div>
  );
}
