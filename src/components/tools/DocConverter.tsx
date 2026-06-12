import { useState, useCallback, useRef, useEffect } from "react"
import { FileUp, FileDown, Loader2, Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptionRow } from "@/components/ToolShell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  loadEngine,
  getEngineState,
  convert,
  disposeEngine,
  type EngineState,
  type LoadProgress,
} from "@/lib/pandoc/client"
import {
  FORMATS,
  getFormat,
  inputFormats,
  outputFormats,
  guessFormatFromFilename,
  guessFormatFromContent,
  unreadableInputLabel,
  isBinaryFormat,
  AUTO_DETECT,
  type PandocFormat,
} from "@/lib/pandoc/formats"
import { downloadBlob, downloadText } from "@/lib/pandoc/download"
import { injectPrintStyles, printHtmlInIframe } from "@/lib/pandoc/print-pdf"

export default function DocConverter() {
  const [engineState, setEngineState] = useState<EngineState>("idle")
  const [loadProgress, setLoadProgress] = useState<LoadProgress | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [inputFile, setInputFile] = useState<File | null>(null)
  const [inputText, setInputText] = useState<string>("")
  const [inFormat, setInFormat] = useState<string>(AUTO_DETECT)
  const [outFormat, setOutFormat] = useState("html")
  const [standalone, setStandalone] = useState(true)
  const [toc, setToc] = useState(false)

  const [processing, setProcessing] = useState(false)
  const [outputText, setOutputText] = useState<string | null>(null)
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [outputExt, setOutputExt] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  const doLoadEngine = useCallback(async () => {
    setLoadError(null)
    try {
      await loadEngine((p) => setLoadProgress(p))
      setEngineState("ready")
      toast.success("Converter engine loaded")
    } catch (err) {
      const msg = (err as Error).message
      setLoadError(msg)
      setEngineState("error")
      toast.error(`Engine load failed: ${msg}`)
    }
  }, [])

  useEffect(() => {
    if (getEngineState() === "ready") {
      setEngineState("ready")
    }
  }, [])

  const handleFilePick = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const unreadable = unreadableInputLabel(file.name)
    if (unreadable) {
      toast.error(`${unreadable} files cannot be used as input`)
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File exceeds 50 MB limit")
      return
    }
    setOutputText(null)
    setOutputBlob(null)
    setInputFile(file)
    const guessed = guessFormatFromFilename(file.name)
    if (guessed) {
      setInFormat(guessed)
    }
    if (isBinaryFormat(guessed ?? "")) {
      setInputText("")
    } else {
      file.text().then((t) => {
        setInputText(t)
        if (inFormat === AUTO_DETECT) {
          setInFormat(guessFormatFromContent(t))
        }
      }).catch(() => toast.error("Could not read file"))
    }
  }, [inFormat])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFilePick(f)
  }, [handleFilePick])

  const doConvert = useCallback(async () => {
    if (!inputFile && !inputText) {
      toast.error("Please select an input file or paste text")
      return
    }
    setProcessing(true)
    setOutputText(null)
    setOutputBlob(null)
    try {
      const fmt = getFormat(outFormat)
      const from = inFormat === AUTO_DETECT
        ? guessFormatFromContent(inputText)
        : inFormat
      const opts: Record<string, unknown> = {
        from,
        to: outFormat,
      }
      if (fmt?.kind !== "pdf") {
        opts["output-file"] = `output.${fmt?.ext ?? "txt"}`
      }
      if (standalone && outFormat !== "pdf") {
        opts.standalone = true
      }
      if (toc) {
        opts["table-of-contents"] = true
      }
      const files: Record<string, Blob | string> = {}
      let stdin: string | null = null
      if (inputFile && isBinaryFormat(inFormat === AUTO_DETECT ? "" : inFormat)) {
        files["input." + (getFormat(inFormat)?.ext ?? "bin")] = inputFile
      } else {
        stdin = inputText
      }
      const data = await convert(opts, stdin, files)
      if (data.stderr) {
        console.warn("Pandoc stderr:", data.stderr)
      }
      if (fmt?.kind === "pdf") {
        const styled = injectPrintStyles(data.stdout)
        printHtmlInIframe(styled)
        toast.success("PDF print dialog opened")
      } else {
        const outFile = data.files[`output.${fmt?.ext ?? "txt"}`]
        if (outFile instanceof Blob) {
          setOutputBlob(outFile)
          setOutputExt(fmt?.ext ?? "bin")
          setOutputText(null)
        } else {
          setOutputText(data.stdout)
          setOutputBlob(null)
        }
      }
      toast.success("Conversion complete")
    } catch (err) {
      toast.error(`Conversion failed: ${(err as Error).message}`)
    } finally {
      setProcessing(false)
    }
  }, [inputFile, inputText, inFormat, outFormat, standalone, toc])

  const handleDownload = useCallback(() => {
    if (outputBlob) {
      downloadBlob(outputBlob, `output.${outputExt}`)
    } else if (outputText !== null) {
      const fmt = getFormat(outFormat)
      downloadText(outputText, `output.${fmt?.ext ?? "txt"}`)
    }
  }, [outputBlob, outputText, outFormat, outputExt])

  useEffect(() => {
    return () => {
      if (getEngineState() !== "idle") {
        disposeEngine()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-4">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Output
          </Label>
          <Select value={outFormat} onValueChange={setOutFormat}>
            <SelectTrigger className="h-7 w-32 rounded-sm font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outputFormats.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Standalone
          </Label>
          <Switch checked={standalone} onCheckedChange={setStandalone} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            TOC
          </Label>
          <Switch checked={toc} onCheckedChange={setToc} />
        </div>
      </OptionRow>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {inputFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="truncate font-mono">{inputFile.name}</span>
              <span className="text-[11px]">
                ({(inputFile.size / 1024).toFixed(1)} KB)
              </span>
              <div className="flex items-center gap-1">
                <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Input
                </Label>
                <Select value={inFormat} onValueChange={setInFormat}>
                  <SelectTrigger className="h-6 w-28 rounded-sm font-mono text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUTO_DETECT}>Auto</SelectItem>
                    {inputFormats.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">
              Drop a file here or click to browse
            </p>
            <p className="text-[11px]">
              Supports documents, markdown, HTML, and more
            </p>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFilePick(f)
              }}
            />
          </div>

          {!inputFile && inputText && (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or paste your text content here…"
              className="w-full resize-y rounded-lg border bg-background p-3 font-mono text-xs"
            />
          )}

          <div className="flex items-center gap-2">
            {engineState === "idle" || engineState === "loading" ? (
              <Button
                size="sm"
                onClick={doLoadEngine}
                disabled={engineState === "loading"}
              >
                {engineState === "loading" ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Loading engine…
                  </>
                ) : (
                  <>
                    <FileDown className="mr-1.5 h-4 w-4" />
                    Load Converter
                  </>
                )}
              </Button>
            ) : engineState === "ready" ? (
              <Button
                size="sm"
                onClick={doConvert}
                disabled={processing || (!inputFile && !inputText)}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Converting…
                  </>
                ) : (
                  <>
                    <FileUp className="mr-1.5 h-4 w-4" />
                    Convert to {getFormat(outFormat)?.label ?? outFormat}
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{loadError}</p>
                <Button size="sm" onClick={doLoadEngine}>
                  Retry
                </Button>
              </div>
            )}
            {(outputText !== null || outputBlob) && (
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <FileDown className="mr-1.5 h-4 w-4" />
                Download
              </Button>
            )}
          </div>

          {engineState === "loading" && loadProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Downloading converter engine…</span>
                <span>
                  {loadProgress.ratio !== null
                    ? `${Math.round(loadProgress.ratio * 100)}%`
                    : `${(loadProgress.receivedBytes / 1024 / 1024).toFixed(1)} MB`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width:
                      loadProgress.ratio !== null
                        ? `${loadProgress.ratio * 100}%`
                        : "auto",
                    animation:
                      loadProgress.ratio !== null
                        ? "none"
                        : "progress-indeterminate 2s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          {outputText !== null ? (
            <textarea
              readOnly
              value={outputText}
              className="h-full min-h-[200px] w-full resize-y rounded-lg border bg-background p-3 font-mono text-xs"
            />
          ) : outputBlob ? (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm font-medium">
                  Binary output ready ({outputExt.toUpperCase()})
                </p>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <FileDown className="mr-1.5 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
              <div className="text-center">
                <FileDown className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm font-medium">Converted output</p>
                <p className="text-[11px]">Select a file and convert to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
