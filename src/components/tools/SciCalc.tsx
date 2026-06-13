import { useState, useEffect, useCallback, useRef } from "react";
import { Delete, History, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MATH_CONSTANTS, formatScientific } from "@/lib/math-constants";
import { evaluate, pi, e as eulerE } from "mathjs";

const STORAGE_KEY = "sci-calc-state";

type AngleMode = "deg" | "rad";

interface HistoryItem {
  expression: string;
  result: string;
}

const MEMORY_BUTTONS = ["MC", "MR", "M+", "M-"];

const BUTTON_ROWS = [
  ["C", "(", ")", "%", "\u232B"],
  ["sin", "cos", "tan", "\u03C0", "\u00F7"],
  ["asin", "acos", "atan", "e", "\u00D7"],
  ["x\u00B2", "\u221A", "x\u02B8", "\u02B8\u221Ax", "\u2212"],
  ["log", "ln", "!", "1/x", "+"],
  ["7", "8", "9", "10\u02E3", "e\u02E3"],
  ["4", "5", "6", "Const", "Ans"],
];

const BOTTOM_LEFT = [
  ["1", "2", "3", "."],
  ["0", "\u00B1", "EE", "mod"],
];

function getNumberBases(n: number): { hex: string; bin: string; oct: string } | null {
  if (!Number.isInteger(n) || !Number.isFinite(n)) return null;
  if (Math.abs(n) > Number.MAX_SAFE_INTEGER) return null;
  const isNeg = n < 0;
  const abs = Math.abs(n);
  return {
    hex: (isNeg ? "-" : "") + abs.toString(16).toUpperCase(),
    bin: (isNeg ? "-" : "") + abs.toString(2),
    oct: (isNeg ? "-" : "") + abs.toString(8),
  };
}

export default function SciCalc() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [constantsOpen, setConstantsOpen] = useState(false);
  const [hypMode, setHypMode] = useState(false);
  const [memory, setMemory] = useState(0);
  const [memorySet, setMemorySet] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed.history ?? []);
        setMemory(parsed.memory ?? 0);
        setMemorySet(parsed.memorySet ?? false);
        setLastAnswer(parsed.lastAnswer ?? 0);
        setAngleMode(parsed.angleMode ?? "deg");
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        history,
        memory,
        memorySet,
        lastAnswer,
        angleMode,
      }));
    } catch {}
  }, [history, memory, memorySet, lastAnswer, angleMode]);

  const prepareExpression = useCallback(
    (expr: string): string => {
      return expr
        .replace(/\u00D7/g, "*")
        .replace(/\u00F7/g, "/")
        .replace(/\u2212/g, "-")
        .replace(/\u03C0/g, `(${pi})`)
        .replace(/(\d\.?\d*)[eE]([+-]?\d)/g, "$1e$2")
        .replace(/(^|[^0-9])e(?!x|[0-9])/g, `$1(${eulerE})`)
        .replace(/Ans/g, `(${lastAnswer})`)
        .replace(/(\d+)!/g, "factorial($1)")
        .replace(/\|([^|]+)\|/g, "abs($1)");
    },
    [lastAnswer]
  );

  const calculate = useCallback(() => {
    if (!expression.trim()) return;

    try {
      const prepared = prepareExpression(expression);
      const scope =
        angleMode === "deg"
          ? {
              sin: (x: number) => Math.sin((x * Math.PI) / 180),
              cos: (x: number) => Math.cos((x * Math.PI) / 180),
              tan: (x: number) => Math.tan((x * Math.PI) / 180),
              asin: (x: number) => (Math.asin(x) * 180) / Math.PI,
              acos: (x: number) => (Math.acos(x) * 180) / Math.PI,
              atan: (x: number) => (Math.atan(x) * 180) / Math.PI,
            }
          : {};
      const evalResult = evaluate(prepared, scope);
      const resultStr =
        typeof evalResult === "number"
          ? formatScientific(evalResult)
          : String(evalResult);

      setResult(resultStr);
      setError(null);
      setLastAnswer(typeof evalResult === "number" ? evalResult : 0);

      setHistory((prev) => [
        { expression, result: resultStr },
        ...prev.slice(0, 19),
      ]);
    } catch {
      setError("Error");
      setResult(null);
    }
  }, [expression, prepareExpression, angleMode]);

  const handleButton = useCallback(
    (btn: string) => {
      setError(null);

      switch (btn) {
        case "C":
          setExpression("");
          setResult(null);
          break;
        case "\u232B":
          setExpression((prev) => prev.slice(0, -1));
          break;
        case "=":
          calculate();
          break;
        case "\u00B1":
          if (result !== null) {
            const num = parseFloat(result.replace(/[^\d.-]/g, ""));
            if (!isNaN(num)) {
              setExpression(String(-num));
              setResult(null);
            }
          } else if (expression) {
            setExpression((prev) => {
              if (prev.startsWith("-")) return prev.slice(1);
              return "-" + prev;
            });
          }
          break;
        case "x\u00B2":
          setExpression((prev) => `(${prev || "0"})^2`);
          break;
        case "\u221A":
          setExpression((prev) => `sqrt(${prev || ""})`);
          break;
        case "x\u02B8":
          setExpression((prev) => prev + "^");
          break;
        case "\u02B8\u221Ax":
          setExpression((prev) => prev + "nthRoot(");
          break;
        case "10\u02E3":
          setExpression((prev) => `10^(${prev || ""})`);
          break;
        case "e\u02E3":
          setExpression((prev) => `exp(${prev || ""})`);
          break;
        case "log":
          setExpression((prev) => prev + "log10(");
          break;
        case "ln":
          setExpression((prev) => prev + "log(");
          break;
        case "!":
          setExpression((prev) => prev + "!");
          break;
        case "1/x":
          setExpression((prev) => `1/(${prev || "0"})`);
          break;
        case "|x|":
          setExpression((prev) => `|${prev || ""}|`);
          break;
        case "EE":
          setExpression((prev) => prev + "e");
          break;
        case "mod":
          setExpression((prev) => prev + " mod ");
          break;
        case "Ans":
          setExpression((prev) => prev + "Ans");
          break;
        case "MC":
          setMemory(0);
          setMemorySet(false);
          break;
        case "MR":
          setExpression((prev) => prev + String(memory));
          break;
        case "M+": {
          const val = result !== null ? parseFloat(result.replace(/[^\d.-]/g, "")) : NaN;
          if (!isNaN(val)) {
            setMemory((prev) => prev + val);
            setMemorySet(true);
          }
          break;
        }
        case "M-": {
          const val = result !== null ? parseFloat(result.replace(/[^\d.-]/g, "")) : NaN;
          if (!isNaN(val)) {
            setMemory((prev) => prev - val);
            setMemorySet(true);
          }
          break;
        }
        case "sin":
        case "cos":
        case "tan":
        case "asin":
        case "acos":
        case "atan":
          setExpression((prev) => prev + btn + (hypMode ? "h(" : "("));
          break;
        default:
          if (result !== null && /^[0-9.]$/.test(btn)) {
            setExpression(btn);
            setResult(null);
          } else {
            setExpression((prev) => prev + btn);
          }
      }
    },
    [calculate, result, expression, hypMode, memory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      const key = e.key;
      if (/^[0-9.+\-*/()%^]$/.test(key)) {
        e.preventDefault();
        let mapped = key;
        if (key === "*") mapped = "\u00D7";
        if (key === "/") mapped = "\u00F7";
        if (key === "-") mapped = "\u2212";
        handleButton(mapped);
      } else if (key === "Enter") {
        e.preventDefault();
        calculate();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleButton("\u232B");
      } else if (key === "Escape") {
        e.preventDefault();
        handleButton("C");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleButton, calculate]);

  const insertConstant = (value: number) => {
    setExpression((prev) => prev + formatScientific(value));
    setConstantsOpen(false);
  };

  const copyResult = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
    setHistoryOpen(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getButtonStyle = (btn: string) => {
    if (btn === "=") return "bg-primary text-primary-foreground hover:bg-primary/90 text-xl";
    if (["C", "\u232B"].includes(btn)) return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    if (["+", "\u2212", "\u00D7", "\u00F7", "%"].includes(btn)) return "bg-accent hover:bg-accent/80";
    if (/^[0-9.]$/.test(btn) || btn === "00") return "bg-muted hover:bg-muted/80 font-bold text-lg";
    if ([ "Const", "MC", "MR", "M+", "M-"].includes(btn)) return "bg-accent hover:bg-accent/80 font-medium";
    if (btn === "Hyp") return hypMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-accent hover:bg-accent/80 font-medium";
    if (btn === "1/x") return "bg-card hover:bg-accent/50";
    return "bg-card hover:bg-accent/50";
  };

  const renderButton = (btn: string, extraClass = "") => {
    if (btn === "\u232B") {
      return (
        <Button
          key={btn}
          variant="outline"
          className={`h-12 ${getButtonStyle(btn)} ${extraClass}`}
          onClick={() => handleButton(btn)}
        >
          <Delete className="size-5" />
        </Button>
      );
    }

    if (btn === "Const") {
      return (
        <Popover key={btn} open={constantsOpen} onOpenChange={setConstantsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-12 text-sm ${getButtonStyle(btn)} ${extraClass}`}
            >
              Const
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search constants..." />
              <CommandList>
                <CommandEmpty>No constant found.</CommandEmpty>
                <CommandGroup heading="Mathematical">
                  {MATH_CONSTANTS.filter(c => c.category === "mathematical").map((c) => (
                    <CommandItem
                      key={c.name}
                      value={`${c.name} ${c.symbol}`}
                      onSelect={() => insertConstant(c.value)}
                    >
                      <span className="font-bold w-14 shrink-0 font-mono text-xs">{c.symbol}</span>
                      <span className="text-muted-foreground truncate">{c.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Physical">
                  {MATH_CONSTANTS.filter(c => c.category === "physical").map((c) => (
                    <CommandItem
                      key={c.name}
                      value={`${c.name} ${c.symbol}`}
                      onSelect={() => insertConstant(c.value)}
                    >
                      <span className="font-bold w-14 shrink-0 font-mono text-xs">{c.symbol}</span>
                      <span className="flex-1 text-muted-foreground truncate">{c.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Chemical">
                  {MATH_CONSTANTS.filter(c => c.category === "chemical").map((c) => (
                    <CommandItem
                      key={c.name}
                      value={`${c.name} ${c.symbol}`}
                      onSelect={() => insertConstant(c.value)}
                    >
                      <span className="font-bold w-14 shrink-0 font-mono text-xs">{c.symbol}</span>
                      <span className="flex-1 text-muted-foreground truncate">{c.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Button
        key={btn}
        variant="outline"
        className={`h-12 text-sm ${getButtonStyle(btn)} ${extraClass}`}
        onClick={() => handleButton(btn)}
      >
        {btn}
      </Button>
    );
  };

  const parsedResult = result ? parseFloat(result.replace(/[^\d.-]/g, "")) : NaN;
  const bases = Number.isFinite(parsedResult) ? getNumberBases(parsedResult) : null;

  const displayResultStr = error || result || "0";
  const hasError = error !== null;

  return (
    <div className="max-w-md mx-auto space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border p-1">
            <button
              onClick={() => setAngleMode("deg")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                angleMode === "deg"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              DEG
            </button>
            <button
              onClick={() => setAngleMode("rad")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                angleMode === "rad"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              RAD
            </button>
          </div>
          {memorySet && (
            <span className="text-[10px] font-mono text-muted-foreground border rounded px-1.5 py-0.5 leading-none">
              M
            </span>
          )}
        </div>

        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="size-4 mr-2" />
              History
              <ChevronDown
                className={`size-4 ml-2 transition-transform ${
                  historyOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      <div className="bg-card border rounded-lg p-4 min-h-[100px]">
        <div className="text-right space-y-1">
          <div className="text-muted-foreground text-lg font-mono min-h-[28px] break-all">
            {expression || "0"}
          </div>
          <div className="flex items-center justify-end gap-2">
            <div
              className={`text-3xl font-bold font-mono transition-colors ${
                hasError ? "text-destructive" : ""
              }`}
            >
              {displayResultStr}
            </div>
            {result && !error && (
              <Button variant="ghost" size="icon" onClick={copyResult}>
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            )}
          </div>
          {bases && !hasError && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-muted-foreground justify-end pt-1">
              <span>HEX: <span className="text-foreground/70">{bases.hex}</span></span>
              <span>BIN: <span className="text-foreground/70">{bases.bin}</span></span>
              <span>OCT: <span className="text-foreground/70">{bases.oct}</span></span>
            </div>
          )}
        </div>
      </div>

      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
        <CollapsibleContent>
          <div className="bg-card border rounded-lg p-3 max-h-48 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-2">
                No history yet
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <button
                    key={`${item.expression}=${item.result}-${idx}`}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-right p-2 rounded hover:bg-accent transition-colors"
                  >
                    <div className="text-sm text-muted-foreground font-mono">
                      {item.expression}
                    </div>
                    <div className="font-bold font-mono">{item.result}</div>
                  </button>
                ))}
              </div>
            )}
            {history.length > 0 && (
              <div className="mt-2 pt-2 border-t flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearHistory} className="h-7 text-xs">
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid gap-1.5">
        <div className="grid grid-cols-5 gap-1.5">
          {MEMORY_BUTTONS.map((btn) => (
            <Button
              key={btn}
              variant="outline"
              className={`h-9 text-xs font-medium ${getButtonStyle(btn)}`}
              onClick={() => handleButton(btn)}
            >
              {btn}
            </Button>
          ))}
          <Button
            variant="outline"
            className={`h-9 text-xs font-medium ${getButtonStyle("Hyp")}`}
            onClick={() => setHypMode((prev) => !prev)}
            title={hypMode ? "Hyperbolic mode on (sin\u2192sinh, etc.)" : "Toggle hyperbolic mode"}
          >
            {hypMode ? "HYP" : "Hyp"}
          </Button>
        </div>

        {BUTTON_ROWS.map((row) => (
          <div key={row.join("-")} className="grid grid-cols-5 gap-1.5">
            {row.map((btn) => renderButton(btn))}
          </div>
        ))}

        <div className="grid grid-cols-5 gap-1.5" style={{ gridTemplateRows: "3rem 3rem" }}>
          {BOTTOM_LEFT[0].map((btn) => renderButton(btn))}
          <Button
            key="="
            variant="outline"
            className={`row-span-2 h-auto ${getButtonStyle("=")}`}
            onClick={() => handleButton("=")}
          >
            =
          </Button>
          {BOTTOM_LEFT[1].map((btn) => renderButton(btn))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Keyboard supported: numbers, operators, Enter to calculate, Escape to clear
      </p>
    </div>
  );
}
