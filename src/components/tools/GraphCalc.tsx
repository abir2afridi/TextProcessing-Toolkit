import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Plus, Trash2, Eye, EyeOff, RotateCcw, Palette, Grid3X3, Hash, Axis3D, Crosshair, X,
  ZoomIn, ZoomOut, Maximize2, FunctionSquare, Table2, Sigma,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Mafs, Coordinates, Plot, Line } from "mafs";
import { compile, derivative as mathDerivative } from "mathjs";
import "mafs/core.css";

const MIN_RANGE = 0.001;
const MAX_RANGE = 10000;

type Operator = "=" | "<" | ">" | "\u2264" | "\u2265";

interface FunctionEntry {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  operator: Operator;
  error?: string;
}

const OPERATORS: Operator[] = ["=", "<", ">", "\u2264", "\u2265"];

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

const MATH_SCOPE = { log: Math.log10, ln: Math.log };

function createEvaluator(expression: string): ((x: number) => number) | null {
  if (!expression.trim()) return null;
  try {
    const compiled = compile(expression);
    const testResult = compiled.evaluate({ x: 1, ...MATH_SCOPE });
    if (typeof testResult !== "number") return null;
    return (x: number) => {
      try {
        const result = compiled.evaluate({ x, ...MATH_SCOPE });
        return typeof result === "number" ? result : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

function getDerivative(expression: string): string | null {
  try {
    return mathDerivative(expression, "x").toString();
  } catch {
    return null;
  }
}

function DiscontinuousPlot({
  fn,
  color,
  xMin,
  xMax,
  weight = 2,
  opacity = 1,
}: {
  fn: (x: number) => number;
  color: string;
  xMin: number;
  xMax: number;
  weight?: number;
  opacity?: number;
}) {
  const segments = useMemo(() => {
    const padding = (xMax - xMin) * 0.5;
    const sampleMin = xMin - padding;
    const sampleMax = xMax + padding;
    const numSamples = 1500;
    const step = (sampleMax - sampleMin) / numSamples;
    const allSegments: Array<Array<[number, number]>> = [];
    let currentSegment: Array<[number, number]> = [];

    for (let i = 0; i <= numSamples; i++) {
      const x = sampleMin + i * step;
      const y = fn(x);
      if (Number.isFinite(y)) {
        currentSegment.push([x, y]);
      } else {
        if (currentSegment.length > 1) {
          allSegments.push(currentSegment);
        }
        currentSegment = [];
      }
    }

    if (currentSegment.length > 1) {
      allSegments.push(currentSegment);
    }

    return allSegments;
  }, [fn, xMin, xMax]);

  return (
    <>
      {segments.map((segment, segIdx) => (
        <Plot.Parametric
          key={`${color}-${segIdx}-${segment[0][0].toFixed(3)}-${segment[segment.length - 1][0].toFixed(3)}`}
          t={[0, segment.length - 1]}
          xy={(t: number) => {
            const index = Math.min(Math.floor(t), segment.length - 1);
            const nextIndex = Math.min(index + 1, segment.length - 1);
            const frac = t - index;
            const x = segment[index][0] + frac * (segment[nextIndex][0] - segment[index][0]);
            const y = segment[index][1] + frac * (segment[nextIndex][1] - segment[index][1]);
            return [x, y];
          }}
          color={color}
          weight={weight}
          opacity={opacity}
        />
      ))}
    </>
  );
}

function FunctionPlot({
  expression,
  color,
  xMin,
  xMax,
  operator,
  weight,
  opacity,
  onError,
}: {
  expression: string;
  color: string;
  xMin: number;
  xMax: number;
  operator: Operator;
  weight?: number;
  opacity?: number;
  onError: (hasError: boolean) => void;
}) {
  const evaluator = useMemo(() => createEvaluator(expression), [expression]);

  useEffect(() => {
    const hasError = evaluator === null && expression.trim() !== "";
    onError(hasError);
  }, [evaluator, expression, onError]);

  if (!evaluator) return null;

  if (operator === "=") {
    return <DiscontinuousPlot fn={evaluator} color={color} xMin={xMin} xMax={xMax} weight={weight} opacity={opacity} />;
  }

  const mafsOperator = operator === "\u2264" ? "<=" : operator === "\u2265" ? ">=" : operator;
  const yProp = { [mafsOperator]: evaluator } as {
    ">"?: (x: number) => number;
    "<"?: (x: number) => number;
    ">="?: (x: number) => number;
    "<="?: (x: number) => number;
  };

  return (
    <Plot.Inequality
      y={yProp}
      color={color}
      fillOpacity={0.2}
      strokeOpacity={operator === "<" || operator === ">" ? 0.5 : (opacity ?? 1)}
      weight={weight ?? 2}
      svgFillPathProps={{ strokeDasharray: operator === "<" || operator === ">" ? "4 2" : undefined }}
    />
  );
}

function niceStep(range: number): number {
  const roughStep = range / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  if (residual < 1.5) return magnitude;
  if (residual < 3) return 2 * magnitude;
  if (residual < 7) return 5 * magnitude;
  return 10 * magnitude;
}

function formatTickLabel(value: number, step: number): string {
  const decimals = step < 1 ? Math.ceil(-Math.log10(step)) : 0;
  const rounded = Math.round(value / step) * step;
  const str = rounded.toFixed(decimals);
  if (decimals > 0) {
    return str.replace(/\.?0+$/, "") || "0";
  }
  return str;
}

const formatNumber = (n: number) => {
  if (!Number.isFinite(n)) return "NaN";
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(3);
  return parseFloat(n.toFixed(6)).toString();
};

interface RootResult {
  fnId: string;
  expression: string;
  color: string;
  x: number;
  y: number;
  label: string;
}

function findRoots(
  evaluator: (x: number) => number,
  xMin: number,
  xMax: number
): number[] {
  const roots: number[] = [];
  const steps = 600;
  const step = (xMax - xMin) / steps;

  for (let i = 0; i < steps; i++) {
    const x1 = xMin + i * step;
    const x2 = x1 + step;
    const y1 = evaluator(x1);
    const y2 = evaluator(x2);

    if (!Number.isFinite(y1) || !Number.isFinite(y2)) continue;

    if (Math.abs(y1) < 1e-12) {
      if (roots.length === 0 || Math.abs(x1 - roots[roots.length - 1]) > step * 0.5) {
        roots.push(x1);
      }
      continue;
    }

    if (y1 * y2 < 0) {
      let a = x1, b = x2;
      let fa = y1, fb = y2;
      for (let j = 0; j < 60; j++) {
        const mid = (a + b) / 2;
        const fmid = evaluator(mid);
        if (!Number.isFinite(fmid)) break;
        if (Math.abs(fmid) < 1e-14) {
          roots.push(mid);
          break;
        }
        if (fa * fmid < 0) {
          b = mid;
          fb = fmid;
        } else {
          a = mid;
          fa = fmid;
        }
      }
    }
  }

  return roots.filter((r, idx, arr) => {
    if (idx === 0) return true;
    return Math.abs(r - arr[idx - 1]) > step * 0.3;
  });
}

export default function GraphCalc() {
  const [functions, setFunctions] = useState<FunctionEntry[]>([
    { id: "1", expression: "x^2", color: COLORS[0], visible: true, operator: "=" },
  ]);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  const [traceInput, setTraceInput] = useState("");
  const [traceResults, setTraceResults] = useState<Array<{ x: number; results: Array<{ id: string; expression: string; y: number; color: string }> }>>([]);

  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);

  const crosshairRef = useRef<HTMLDivElement>(null);
  const crosshairXRef = useRef<HTMLDivElement>(null);
  const crosshairYRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const evaluatorsRef = useRef<Map<string, ((x: number) => number)>>(new Map());

  const [showDerivative, setShowDerivative] = useState<Record<string, boolean>>({});
  const [derivativeErrors, setDerivativeErrors] = useState<Record<string, boolean>>({});

  const [showRoots, setShowRoots] = useState(false);
  const [roots, setRoots] = useState<RootResult[]>([]);

  const [showTable, setShowTable] = useState(false);
  const [tableXStart, setTableXStart] = useState(-10);
  const [tableXEnd, setTableXEnd] = useState(10);
  const [tableXStep, setTableXStep] = useState(1);
  const [tableData, setTableData] = useState<Array<{ x: number; values: Record<string, number> }>>([]);

  const graphWidth = 800;
  const graphHeight = 400;
  const minPixelsPerLine = 30;

  const xStep = useMemo(() => {
    const baseStep = niceStep(xMax - xMin);
    const minStep = ((xMax - xMin) / graphWidth) * minPixelsPerLine;
    let step = baseStep;
    while (step < minStep) {
      step *= 2;
    }
    return step;
  }, [xMin, xMax]);

  const yStep = useMemo(() => {
    const baseStep = niceStep(yMax - yMin);
    const minStep = ((yMax - yMin) / graphHeight) * minPixelsPerLine;
    let step = baseStep;
    while (step < minStep) {
      step *= 2;
    }
    return step;
  }, [yMin, yMax]);

  const xLabelCount = (xMax - xMin) / xStep;
  const yLabelCount = (yMax - yMin) / yStep;
  const showXLabels = graphWidth / xLabelCount > 50;
  const showYLabels = graphHeight / yLabelCount > 30;

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const svgElement = containerRef.current?.querySelector(".MafsView");
      if (!svgElement) return;
      const rect = svgElement.getBoundingClientRect();

      if (isPanning && panStart.current) {
        const dx = (e.clientX - panStart.current.x) / rect.width * (panStart.current.xMax - panStart.current.xMin);
        const dy = (e.clientY - panStart.current.y) / rect.height * (panStart.current.yMax - panStart.current.yMin);
        setXMin(panStart.current.xMin - dx);
        setXMax(panStart.current.xMax - dx);
        setYMin(panStart.current.yMin + dy);
        setYMax(panStart.current.yMax + dy);
        return;
      }

      const graphX = xMin + ((e.clientX - rect.left) / rect.width) * (xMax - xMin);
      const graphY = yMax - ((e.clientY - rect.top) / rect.height) * (yMax - yMin);

      const pctX = ((graphX - xMin) / (xMax - xMin)) * 100;
      const pctY = ((yMax - graphY) / (yMax - yMin)) * 100;

      if (crosshairXRef.current) {
        crosshairXRef.current.style.left = `${pctX}%`;
      }
      if (crosshairYRef.current) {
        crosshairYRef.current.style.top = `${pctY}%`;
      }

      const funcValues: Array<{ id: string; expression: string; y: number; color: string }> = [];
      for (const f of functions) {
        if (!f.visible || !f.expression.trim()) continue;
        const evalFn = evaluatorsRef.current.get(f.id);
        if (evalFn) {
          const fy = evalFn(graphX);
          if (Number.isFinite(fy)) {
            funcValues.push({ id: f.id, expression: f.expression, y: fy, color: f.color });
          }
        }
      }

      if (tooltipRef.current) {
        const tooltipText = `x = ${formatNumber(graphX)}, y = ${formatNumber(graphY)}`;
        let html = `<div class="font-semibold">${tooltipText}</div>`;
        if (funcValues.length > 0) {
          html += `<div class="border-t border-white/20 mt-1 pt-1 text-[10px]">`;
          for (const fv of funcValues) {
            const shortExpr = fv.expression.length > 18 ? fv.expression.slice(0, 18) + "\u2026" : fv.expression;
            html += `<div class="flex items-center gap-1"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${fv.color}"></span><span>${shortExpr} = ${formatNumber(fv.y)}</span></div>`;
          }
          html += `</div>`;
        }
        tooltipRef.current.innerHTML = html;
        tooltipRef.current.style.left = `${Math.min(pctX + 2, 75)}%`;
        tooltipRef.current.style.top = `${Math.min(pctY + 2, 85)}%`;
        tooltipRef.current.style.display = "block";
      }
    },
    [isPanning, xMin, xMax, yMin, yMax, functions]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === 0) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, xMin, xMax, yMin, yMax };
      }
    },
    [xMin, xMax, yMin, yMax]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      panStart.current = null;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
    if (crosshairXRef.current) crosshairXRef.current.style.left = "-10px";
    if (crosshairYRef.current) crosshairYRef.current.style.top = "-10px";
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  }, []);

  useEffect(() => {
    const map = new Map<string, (x: number) => number>();
    for (const f of functions) {
      if (!f.visible || !f.expression.trim()) continue;
      const evalFn = createEvaluator(f.expression);
      if (evalFn) {
        map.set(f.id, evalFn);
      }
    }
    evaluatorsRef.current = map;
  }, [functions]);

  const boundsRef = useRef({ xMin, xMax, yMin, yMax });
  boundsRef.current = { xMin, xMax, yMin, yMax };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const svgElement = el.querySelector(".MafsView");
      if (!svgElement) return;
      const { xMin, xMax, yMin, yMax } = boundsRef.current;
      const rect = svgElement.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;
      const clampedRelativeX = Math.max(0, Math.min(1, relativeX));
      const clampedRelativeY = Math.max(0, Math.min(1, relativeY));
      const cursorGraphX = xMin + clampedRelativeX * (xMax - xMin);
      const cursorGraphY = yMax - clampedRelativeY * (yMax - yMin);
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      const newXMin = cursorGraphX - (cursorGraphX - xMin) * zoomFactor;
      const newXMax = cursorGraphX + (xMax - cursorGraphX) * zoomFactor;
      const newYMin = cursorGraphY - (cursorGraphY - yMin) * zoomFactor;
      const newYMax = cursorGraphY + (yMax - cursorGraphY) * zoomFactor;
      const newXRange = newXMax - newXMin;
      const newYRange = newYMax - newYMin;
      if (newXRange < MIN_RANGE || newYRange < MIN_RANGE) return;
      if (newXRange > MAX_RANGE || newYRange > MAX_RANGE) return;
      setXMin(newXMin);
      setXMax(newXMax);
      setYMin(newYMin);
      setYMax(newYMax);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleTrace = useCallback(() => {
    const x = parseFloat(traceInput);
    if (!Number.isFinite(x)) return;
    const results: Array<{ id: string; expression: string; y: number; color: string }> = [];
    for (const f of functions) {
      if (!f.visible || !f.expression.trim()) continue;
      const fn = createEvaluator(f.expression);
      if (!fn) continue;
      const y = fn(x);
      if (Number.isFinite(y)) {
        results.push({ id: f.id, expression: f.expression, y, color: f.color });
      }
    }
    if (results.length > 0) {
      setTraceResults((prev) => [{ x, results }, ...prev].slice(0, 10));
    }
  }, [traceInput, functions]);

  const clearTraceResults = useCallback(() => {
    setTraceResults([]);
  }, []);

  const addFunction = () => {
    const newId = String(Date.now());
    const colorIndex = functions.length % COLORS.length;
    setFunctions((prev) => [
      ...prev,
      { id: newId, expression: "", color: COLORS[colorIndex], visible: true, operator: "=" },
    ]);
  };

  const updateFunction = (id: string, updates: Partial<FunctionEntry>) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  const cycleColor = (id: string) => {
    setFunctions((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const currentIndex = COLORS.indexOf(f.color);
        const nextIndex = (currentIndex + 1) % COLORS.length;
        return { ...f, color: COLORS[nextIndex] };
      })
    );
  };

  const cycleOperator = (id: string) => {
    setFunctions((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const currentIndex = OPERATORS.indexOf(f.operator);
        const nextIndex = (currentIndex + 1) % OPERATORS.length;
        return { ...f, operator: OPERATORS[nextIndex] };
      })
    );
  };

  const resetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  const zoomStandard = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  const zoomTrig = () => {
    setXMin(-2 * Math.PI);
    setXMax(2 * Math.PI);
    setYMin(-4);
    setYMax(4);
  };

  const zoomDecimal = () => {
    setXMin(-1);
    setXMax(1);
    setYMin(-1);
    setYMax(1);
  };

  const zoomSquare = () => {
    const xRange = xMax - xMin;
    const yRange = xRange / 2;
    const yCenter = (yMax + yMin) / 2;
    setYMin(yCenter - yRange / 2);
    setYMax(yCenter + yRange / 2);
  };

  const handleZoomIn = () => {
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const newRangeX = (xMax - xMin) * 0.5;
    const newRangeY = (yMax - yMin) * 0.5;
    if (newRangeX < MIN_RANGE || newRangeY < MIN_RANGE) return;
    setXMin(cx - newRangeX / 2);
    setXMax(cx + newRangeX / 2);
    setYMin(cy - newRangeY / 2);
    setYMax(cy + newRangeY / 2);
  };

  const handleZoomOut = () => {
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const newRangeX = (xMax - xMin) * 2;
    const newRangeY = (yMax - yMin) * 2;
    if (newRangeX > MAX_RANGE || newRangeY > MAX_RANGE) return;
    setXMin(cx - newRangeX / 2);
    setXMax(cx + newRangeX / 2);
    setYMin(cy - newRangeY / 2);
    setYMax(cy + newRangeY / 2);
  };

  const handleZoomToFit = useCallback(() => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    const steps = 300;
    const step = (xMax - xMin) / steps;

    for (const f of functions) {
      if (!f.visible || !f.expression.trim() || f.operator !== "=") continue;
      const fn = createEvaluator(f.expression);
      if (!fn) continue;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * step;
        const y = fn(x);
        if (Number.isFinite(y)) {
          if (y < globalMin) globalMin = y;
          if (y > globalMax) globalMax = y;
        }
      }
    }

    if (globalMin === Infinity) return;
    const padding = Math.max((globalMax - globalMin) * 0.1, 0.5);
    setYMin(globalMin - padding);
    setYMax(globalMax + padding);
  }, [functions, xMin, xMax]);

  const toggleDerivative = useCallback((id: string) => {
    setShowDerivative((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const handleFindRoots = useCallback(() => {
    const found: RootResult[] = [];
    for (const f of functions) {
      if (!f.visible || !f.expression.trim()) continue;
      const fn = createEvaluator(f.expression);
      if (!fn) continue;
      const rootXs = findRoots(fn, xMin, xMax);
      let rootIndex = 1;
      for (const rx of rootXs) {
        found.push({
          fnId: f.id,
          expression: f.expression,
          color: f.color,
          x: rx,
          y: fn(rx),
          label: `${rootIndex}`,
        });
        rootIndex++;
      }
    }
    setRoots(found);
    setShowRoots(found.length > 0);
  }, [functions, xMin, xMax]);

  const handleGenerateTable = useCallback(() => {
    const data: Array<{ x: number; values: Record<string, number> }> = [];
    const maxRows = 200;
    const step = tableXStep;
    if (step <= 0) return;

    const visibleFuncs = functions.filter((f) => f.visible && f.expression.trim());

    for (let x = tableXStart; x <= tableXEnd && data.length < maxRows; x += step) {
      const row: { x: number; values: Record<string, number> } = { x, values: {} };
      for (const f of visibleFuncs) {
        const fn = createEvaluator(f.expression);
        if (!fn) continue;
        const y = fn(x);
        if (Number.isFinite(y)) {
          row.values[f.id] = y;
        }
      }
      data.push(row);
    }
    setTableData(data);
  }, [functions, tableXStart, tableXEnd, tableXStep]);

  const handleError = useCallback(
    (id: string) => (hasError: boolean) => {
      setFunctions((prev) => {
        const fn = prev.find((f) => f.id === id);
        if (!fn) return prev;
        const newError = hasError ? "Invalid expression" : undefined;
        if (fn.error === newError) return prev;
        return prev.map((f) => (f.id === id ? { ...f, error: newError } : f));
      });
    },
    []
  );

  const handleDerivativeError = useCallback(
    (id: string) => (hasError: boolean) => {
      setDerivativeErrors((prev) => {
        if (prev[id] === hasError) return prev;
        return { ...prev, [id]: hasError };
      });
    },
    []
  );

  const mafsClasses = [
    "border rounded-lg overflow-hidden relative",
    "[&_.MafsView]:!bg-card",
    "[&_.mafs-shadow]:!stroke-none",
    "[&_.MafsView_text]:!fill-black/50",
    "[&_.MafsView_g_line]:stroke-black/10",
    !showNumbers && "[&_.MafsView_text]:!opacity-0",
  ].filter(Boolean).join(" ");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {functions.map((f, index) => {
          const derivExpr = showDerivative[f.id] ? getDerivative(f.expression) : null;
          const derivError = derivativeErrors[f.id];
          return (
            <div key={f.id} className="flex items-center gap-2 flex-wrap">
              <div className="border rounded-md p-1.5 shrink-0">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: f.color }} />
              </div>
              <div className="border rounded-md px-2 py-1.5 text-sm text-muted-foreground shrink-0 font-mono">
                y<sub>{index + 1}</sub>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cycleOperator(f.id)}
                className="shrink-0 font-mono text-base w-10"
                title="Click to change operator"
              >
                {f.operator}
              </Button>
              <div className="flex-1 relative min-w-[120px]">
                <Input
                  value={f.expression}
                  onChange={(e) => updateFunction(f.id, { expression: e.target.value })}
                  placeholder="x^2, sin(x), etc."
                  className={"font-mono " + (f.error ? "border-destructive" : "")}
                />
                {f.error && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive">
                    {f.error}
                  </span>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showDerivative[f.id] ? "secondary" : "outline"}
                    size="icon"
                    onClick={() => toggleDerivative(f.id)}
                    title="Toggle derivative"
                    disabled={!f.expression.trim()}
                  >
                    <FunctionSquare className="size-4" style={{ color: showDerivative[f.id] ? f.color : undefined }} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showDerivative[f.id] ? "Hide derivative" : "Show derivative"} f'(x)
                  {derivExpr && <div className="text-[10px] font-mono text-muted-foreground mt-0.5">f'(x) = {derivExpr}</div>}
                  {derivError && <div className="text-[10px] text-destructive">Not differentiable</div>}
                </TooltipContent>
              </Tooltip>
              <Button variant="outline" size="icon" onClick={() => cycleColor(f.id)} title="Change colour">
                <Palette className="size-4" style={{ color: f.color }} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => toggleVisibility(f.id)} title={f.visible ? "Hide" : "Show"}>
                {f.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
              </Button>
              {functions.length > 1 && (
                <Button variant="outline" size="icon" onClick={() => removeFunction(f.id)} title="Remove">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={addFunction}>
            <Plus className="size-4 mr-2" />
            Add function
          </Button>
          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showGrid ? "secondary" : "ghost"} size="icon" onClick={() => setShowGrid(!showGrid)} className="size-8">
                <Grid3X3 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle grid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showAxes ? "secondary" : "ghost"} size="icon" onClick={() => setShowAxes(!showAxes)} className="size-8">
                <Axis3D className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle axes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showNumbers ? "secondary" : "ghost"} size="icon" onClick={() => setShowNumbers(!showNumbers)} className="size-8">
                <Hash className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle numbers</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={"relative " + mafsClasses + " " + (isPanning ? "cursor-grabbing" : "cursor-grab")}
      >
        <Mafs
          height={400}
          viewBox={{ x: [xMin, xMax], y: [yMin, yMax] }}
          preserveAspectRatio={false}
          pan={false}
        >
          {showGrid && (
            <Coordinates.Cartesian
              xAxis={{
                lines: xStep,
                labels: showXLabels ? (n: number) => formatTickLabel(n, xStep) : () => "",
              }}
              yAxis={{
                lines: yStep,
                labels: showYLabels ? (n: number) => formatTickLabel(n, yStep) : () => "",
              }}
            />
          )}

          {showAxes && (
            <>
              <Line.Segment point1={[-1e9, 0]} point2={[1e9, 0]} color="rgba(0,0,0,0.6)" weight={1.5} />
              <Line.Segment point1={[0, -1e9]} point2={[0, 1e9]} color="rgba(0,0,0,0.6)" weight={1.5} />
            </>
          )}

          {functions
            .filter((f) => f.visible && f.expression.trim())
            .map((f) => (
              <FunctionPlot
                key={f.id}
                expression={f.expression}
                color={f.color}
                xMin={xMin}
                xMax={xMax}
                operator={f.operator}
                onError={handleError(f.id)}
              />
            ))}

          {functions
            .filter((f) => f.visible && f.expression.trim() && showDerivative[f.id])
            .map((f) => {
              const derivExpr = getDerivative(f.expression);
              if (!derivExpr) return null;
              return (
                <FunctionPlot
                  key={`deriv-${f.id}`}
                  expression={derivExpr}
                  color={f.color}
                  xMin={xMin}
                  xMax={xMax}
                  operator="="
                  weight={1.5}
                  opacity={0.55}
                  onError={handleDerivativeError(f.id)}
                />
              );
            })}

          {roots.map((root) => (
            <g key={`root-${root.fnId}-${root.x.toFixed(6)}`}>
              <Line.Segment
                point1={[root.x - 0.3, root.y - 0.3]}
                point2={[root.x + 0.3, root.y + 0.3]}
                color={root.color}
                weight={2.5}
              />
              <Line.Segment
                point1={[root.x - 0.3, root.y + 0.3]}
                point2={[root.x + 0.3, root.y - 0.3]}
                color={root.color}
                weight={2.5}
              />
            </g>
          ))}
        </Mafs>

        <div ref={crosshairXRef} className="absolute top-0 bottom-0 w-px bg-black/25 pointer-events-none" style={{ left: "-10px" }} />
        <div ref={crosshairYRef} className="absolute left-0 right-0 h-px bg-black/25 pointer-events-none" style={{ top: "-10px" }} />
        <div
          ref={tooltipRef}
          className="absolute bg-black/85 text-white text-xs font-mono px-2 py-1 rounded pointer-events-none z-10 leading-tight shadow-lg"
          style={{ display: "none", maxWidth: "220px" }}
        />

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded">
          X: {(xMax - xMin).toFixed(3)} | Y: {(yMax - yMin).toFixed(3)}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-xs">X Range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={Math.round(xMin * 10) / 10}
              onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
              className="w-20 text-center"
              step="0.1"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              value={Math.round(xMax * 10) / 10}
              onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
              className="w-20 text-center"
              step="0.1"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Y Range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={Math.round(yMin * 10) / 10}
              onChange={(e) => setYMin(parseFloat(e.target.value) || -10)}
              className="w-20 text-center"
              step="0.1"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              value={Math.round(yMax * 10) / 10}
              onChange={(e) => setYMax(parseFloat(e.target.value) || 10)}
              className="w-20 text-center"
              step="0.1"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Zoom</Label>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={zoomStandard} className="text-xs">ZStandard</Button>
              </TooltipTrigger>
              <TooltipContent>-10 to 10</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={zoomTrig} className="text-xs">ZTrig</Button>
              </TooltipTrigger>
              <TooltipContent>-2\u03C0 to 2\u03C0, -4 to 4</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={zoomDecimal} className="text-xs">ZDecimal</Button>
              </TooltipTrigger>
              <TooltipContent>-1 to 1</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={zoomSquare} className="text-xs">ZSquare</Button>
              </TooltipTrigger>
              <TooltipContent>1:1 aspect ratio</TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn} className="size-8">
                  <ZoomIn className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in (2x)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut} className="size-8">
                  <ZoomOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out (2x)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomToFit} className="size-8">
                  <Maximize2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom to fit Y to visible functions</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={resetView}>
          <RotateCcw className="size-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Trace</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">x =</span>
            <Input
              type="number"
              value={traceInput}
              onChange={(e) => setTraceInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrace()}
              placeholder="0"
              className="w-24 text-center font-mono"
            />
            <Button variant="secondary" size="sm" onClick={handleTrace}>
              <Crosshair className="size-4" />
            </Button>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={showRoots ? "secondary" : "outline"} size="sm" onClick={handleFindRoots}>
              <Sigma className="size-4 mr-1" />
              Find roots
            </Button>
          </TooltipTrigger>
          <TooltipContent>Find zero crossings in current view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={showTable ? "secondary" : "outline"} size="sm" onClick={() => setShowTable(!showTable)}>
              <Table2 className="size-4 mr-1" />
              Table
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate table of values</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <div className="text-xs text-muted-foreground">
          Hover graph for coordinates
        </div>
      </div>

      {traceResults.length > 0 && (
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Trace Results</Label>
            <Button variant="ghost" size="sm" onClick={clearTraceResults} className="h-6 px-2">
              <X className="size-3 mr-1" />
              Clear
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {traceResults.map((trace, traceIdx) => (
              <div key={trace.x + "-" + traceIdx} className="text-sm font-mono bg-muted/50 rounded px-2 py-1">
                <span className="text-muted-foreground">x = {formatNumber(trace.x)}</span>
                {trace.results.map((result) => (
                  <div key={result.id} className="flex items-center gap-2 ml-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: result.color }} />
                    <span className="text-muted-foreground truncate">{result.expression}</span>
                    <span>=</span>
                    <span>{formatNumber(result.y)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {showRoots && roots.length > 0 && (
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Roots (zero crossings)</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowRoots(false)} className="h-6 px-2">
              <X className="size-3 mr-1" />
              Close
            </Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {roots.map((root, ri) => (
              <div key={`${root.fnId}-${root.x.toFixed(6)}`} className="text-sm font-mono bg-muted/50 rounded px-2 py-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: root.color }} />
                <span className="text-muted-foreground truncate max-w-[200px]">{root.expression}</span>
                <span className="text-muted-foreground">x =</span>
                <span className="font-semibold">{formatNumber(root.x)}</span>
                <span className="text-muted-foreground">y =</span>
                <span>{formatNumber(root.y)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTable && (
        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Table of Values</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowTable(false)} className="h-6 px-2">
              <X className="size-3 mr-1" />
              Close
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">Start</Label>
              <Input
                type="number"
                value={tableXStart}
                onChange={(e) => setTableXStart(parseFloat(e.target.value) || 0)}
                className="w-20 text-center font-mono text-sm h-8"
              />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">End</Label>
              <Input
                type="number"
                value={tableXEnd}
                onChange={(e) => setTableXEnd(parseFloat(e.target.value) || 0)}
                className="w-20 text-center font-mono text-sm h-8"
              />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">Step</Label>
              <Input
                type="number"
                value={tableXStep}
                onChange={(e) => setTableXStep(parseFloat(e.target.value) || 1)}
                className="w-20 text-center font-mono text-sm h-8"
                step="0.1"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={handleGenerateTable}>
              <Table2 className="size-4 mr-1" />
              Generate
            </Button>
          </div>
          {tableData.length > 0 && (
            <div className="max-h-60 overflow-auto border rounded">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-muted/50 sticky top-0">
                    <th className="text-left px-3 py-1.5 border-b text-muted-foreground font-medium">x</th>
                    {functions.filter((f) => f.visible && f.expression.trim()).map((f) => (
                      <th key={f.id} className="text-right px-3 py-1.5 border-b" style={{ color: f.color }}>
                        y<sub>{functions.indexOf(f) + 1}</sub>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-muted/20" : ""}>
                      <td className="px-3 py-1 border-b text-muted-foreground">{formatNumber(row.x)}</td>
                      {functions.filter((f) => f.visible && f.expression.trim()).map((f) => (
                        <td key={f.id} className="px-3 py-1 border-b text-right" style={{ color: f.color }}>
                          {row.values[f.id] !== undefined ? formatNumber(row.values[f.id]) : "\u2014"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Syntax examples:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <code className="bg-muted px-2 py-1 rounded">x^2</code>
          <code className="bg-muted px-2 py-1 rounded">sin(x)</code>
          <code className="bg-muted px-2 py-1 rounded">sqrt(x)</code>
          <code className="bg-muted px-2 py-1 rounded">log(x)</code>
          <code className="bg-muted px-2 py-1 rounded">abs(x)</code>
          <code className="bg-muted px-2 py-1 rounded">2*x + 1</code>
          <code className="bg-muted px-2 py-1 rounded">exp(x)</code>
          <code className="bg-muted px-2 py-1 rounded">tan(x)</code>
        </div>
      </div>
    </div>
  );
}
