import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionRow } from "@/components/ToolShell";

const MATH_CONST = { pi: Math.PI, e: Math.E } as Record<string, number>;

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: string }
  | { type: "func"; value: string }
  | { type: "paren"; value: string }
  | { type: "comma"; value: string };

function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === " ") { i++; continue; }
    if (/[0-9.]/.test(s[i])) {
      let num = "";
      while (i < s.length && /[0-9.eE]/.test(s[i])) { num += s[i]; i++; }
      if (num.endsWith("e") || num.endsWith("E")) { num += s[i] || ""; i++; }
      tokens.push({ type: "num", value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z]/.test(s[i])) {
      let name = "";
      while (i < s.length && /[a-zA-Z]/.test(s[i])) { name += s[i]; i++; }
      if (name in MATH_CONST) {
        tokens.push({ type: "num", value: MATH_CONST[name] });
      } else {
        tokens.push({ type: "func", value: name });
      }
      continue;
    }
    if ("+-*/^()".includes(s[i])) {
      if (s[i] === "-" && (tokens.length === 0 || (tokens[tokens.length - 1].type === "op") || (tokens[tokens.length - 1].type === "paren" && tokens[tokens.length - 1].value === "("))) {
        tokens.push({ type: "num", value: -1 });
        tokens.push({ type: "op", value: "*" });
      } else {
        tokens.push({ type: "op", value: s[i] });
      }
      i++;
      continue;
    }
    if (s[i] === ",") { tokens.push({ type: "comma", value: "," }); i++; continue; }
    throw new Error("Unexpected character: " + s[i]);
  }
  return tokens;
}

function parse(tokens: Token[], i = 0): { expr: number; i: number } {
  return parseAddSub(tokens, i);
}

function parseAddSub(tokens: Token[], i: number): { expr: number; i: number } {
  let left = parseMulDiv(tokens, i);
  i = left.i;
  while (i < tokens.length && tokens[i].type === "op" && (tokens[i].value === "+" || tokens[i].value === "-")) {
    const op = tokens[i].value;
    i++;
    const right = parseMulDiv(tokens, i);
    i = right.i;
    left.expr = op === "+" ? left.expr + right.expr : left.expr - right.expr;
  }
  return left;
}

function parseMulDiv(tokens: Token[], i: number): { expr: number; i: number } {
  let left = parsePower(tokens, i);
  i = left.i;
  while (i < tokens.length && tokens[i].type === "op" && (tokens[i].value === "*" || tokens[i].value === "/")) {
    const op = tokens[i].value;
    i++;
    const right = parsePower(tokens, i);
    i = right.i;
    if (op === "/" && right.expr === 0) throw new Error("Division by zero");
    left.expr = op === "*" ? left.expr * right.expr : left.expr / right.expr;
  }
  return left;
}

function parsePower(tokens: Token[], i: number): { expr: number; i: number } {
  let left = parseUnary(tokens, i);
  i = left.i;
  while (i < tokens.length && tokens[i].type === "op" && tokens[i].value === "^") {
    i++;
    const right = parseUnary(tokens, i);
    i = right.i;
    if (left.expr < 0 && !Number.isInteger(right.expr)) throw new Error("Negative base with fractional exponent");
    left.expr = Math.pow(left.expr, right.expr);
  }
  return left;
}

function parseUnary(tokens: Token[], i: number): { expr: number; i: number } {
  if (i >= tokens.length) throw new Error("Unexpected end of expression");
  const t = tokens[i];
  if (t.type === "num") {
    return { expr: t.value, i: i + 1 };
  }
  if (t.type === "op" && t.value === "+") {
    return parseUnary(tokens, i + 1);
  }
  if (t.type === "op" && t.value === "-") {
    const inner = parseUnary(tokens, i + 1);
    return { expr: -inner.expr, i: inner.i };
  }
  if (t.type === "paren" && t.value === "(") {
    const inner = parse(tokens, i + 1);
    const ct = tokens[inner.i];
    if (!ct || ct.type !== "paren" || ct.value !== ")") throw new Error("Missing closing parenthesis");
    return { expr: inner.expr, i: inner.i + 1 };
  }
  if (t.type === "func") {
    const name = t.value;
    let j = i + 1;
    if (j >= tokens.length || tokens[j].type !== "paren" || tokens[j].value !== "(") throw new Error("Expected ( after " + name);
    j++;
    const args: number[] = [];
    while (true) {
      if (j >= tokens.length) throw new Error("Unexpected end in function call");
      if (tokens[j].type === "paren" && tokens[j].value === ")") { j++; break; }
      const arg = parse(tokens, j);
      args.push(arg.expr);
      j = arg.i;
      if (j < tokens.length && tokens[j].type === "comma") { j++; continue; }
      if (j < tokens.length && tokens[j].type === "paren" && tokens[j].value === ")") { j++; break; }
      throw new Error("Expected ) or , in function call");
    }
    const val = applyFunc(name, args);
    return { expr: val, i: j };
  }
  throw new Error("Unexpected token at position " + i);
}

const FUNCS: Record<string, (args: number[]) => number> = {
  sin: ([x]) => Math.sin(x),
  cos: ([x]) => Math.cos(x),
  tan: ([x]) => Math.tan(x),
  sqrt: ([x]) => { if (x < 0) throw new Error("sqrt of negative number"); return Math.sqrt(x); },
  log: ([x]) => { if (x <= 0) throw new Error("log of non-positive number"); return Math.log10(x); },
  ln: ([x]) => { if (x <= 0) throw new Error("ln of non-positive number"); return Math.log(x); },
  abs: ([x]) => Math.abs(x),
  floor: ([x]) => Math.floor(x),
  ceil: ([x]) => Math.ceil(x),
  round: ([x]) => Math.round(x),
};

function applyFunc(name: string, args: number[]) {
  if (name in FUNCS) return FUNCS[name](args);
  throw new Error("Unknown function: " + name);
}

function evaluate(expr: string) {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return null;
  const result = parse(tokens);
  if (result.i < tokens.length) throw new Error("Unexpected tokens after expression");
  return result.expr;
}

export default function MathEvaluator() {
  const [input, setInput] = useState("sin(pi/4)^2 + cos(pi/4)^2");
  const [history, setHistory] = useState<string[]>([]);
  const result = useMemo(() => {
    try {
      const val = evaluate(input);
      return { value: val, error: null as string | null };
    } catch (e) { return { value: null, error: (e as Error).message }; }
  }, [input]);
  const addToHistory = useCallback(() => {
    if (result.value !== null) {
      setHistory((h) => [input + " = " + result.value, ...h].slice(0, 50));
    }
  }, [input, result.value]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Expression</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToHistory()} placeholder="sin(pi/4)^2 + cos(pi/4)^2" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
        <Button size="sm" onClick={addToHistory} className="h-7 rounded-sm font-mono text-[11px]">Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setHistory([])} className="h-7 rounded-sm font-mono text-[11px]">Clear History</Button>
      </OptionRow>
      {result.error ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{result.error}</div>
      ) : (
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Result</div>
          <div className="mt-1 font-mono text-2xl text-primary">{result.value === null ? "—" : result.value}</div>
        </div>
      )}
      {history.length > 0 && (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">History</div>
          <div className="max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="border-b border-border last:border-0 px-3 py-1.5 font-mono text-[11px] text-muted-foreground cursor-pointer hover:text-primary" onClick={() => setInput(h.split(" = ")[0])}>{h}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
