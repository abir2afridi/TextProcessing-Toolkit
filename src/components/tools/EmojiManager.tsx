import { useState, useMemo } from "react";
import { IOPanel, OptionRow } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  detectEmojis,
  removeEmojis,
  extractEmojis,
  replaceEmojis,
  replaceEmojiSpecific,
} from "@/lib/text-utils";

type Mode = "detect" | "remove" | "extract" | "replace";

export default function EmojiManager() {
  const [input, setInput] = useState("Hello 👋 world 🌍! Coding ⌨️ is fun 🚀🔥 — pizza 🍕 time 😄");
  const [mode, setMode] = useState<Mode>("detect");
  const [replacements, setReplacements] = useState<Map<string, string>>(new Map());
  const [bulkReplacement, setBulkReplacement] = useState("");

  const detected = useMemo(() => detectEmojis(input), [input]);

  const output = useMemo(() => {
    if (mode === "remove") return removeEmojis(input);
    if (mode === "extract") return extractEmojis(input, true).join(" ");
    if (mode === "replace") {
      let result = input;
      for (const [emoji, rep] of replacements.entries()) {
        result = replaceEmojiSpecific(result, emoji, rep);
      }
      return result;
    }
    return detected.map((d) => `${d.emoji}  ×${d.count}`).join("\n");
  }, [input, mode, detected, replacements]);

  function updateReplacement(emoji: string, value: string) {
    setReplacements((prev) => {
      const next = new Map(prev);
      if (value === "") {
        next.delete(emoji);
      } else {
        next.set(emoji, value);
      }
      return next;
    });
  }

  function applyBulkToAll() {
    setReplacements((prev) => {
      const next = new Map(prev);
      const val = bulkReplacement === "" ? " " : bulkReplacement;
      for (const { emoji } of detectEmojis(input)) {
        next.set(emoji, val);
      }
      return next;
    });
  }

  function clearAll() {
    setReplacements(new Map());
  }

  return (
    <div className="space-y-4">
      <OptionRow>
        {(["detect", "remove", "extract", "replace"] as Mode[]).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "ghost"} onClick={() => setMode(m)} className="h-7 rounded-sm font-mono text-[11px] capitalize">{m}</Button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">unique emoji: <span className="text-primary">{detected.length}</span></span>
      </OptionRow>

      {mode === "replace" && detected.length > 0 && (
        <div className="space-y-3 rounded-md border p-4">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Per-emoji replacement (leave empty to keep original)
          </Label>
          <div className="grid gap-2">
            {detected.map(({ emoji, count }) => (
              <div key={emoji} className="flex items-center gap-3">
                <span className="w-8 text-center text-lg leading-none">{emoji}</span>
                <span className="w-12 font-mono text-[11px] text-muted-foreground">×{count}</span>
                <Input
                  value={replacements.get(emoji) ?? ""}
                  onChange={(e) => updateReplacement(emoji, e.target.value)}
                  placeholder="keep original"
                  className="h-8 flex-1 rounded-sm font-mono text-xs"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 border-t pt-3">
            <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Bulk replace all
            </Label>
            <Input
              value={bulkReplacement}
              onChange={(e) => setBulkReplacement(e.target.value)}
              placeholder="replace text"
              className="h-8 w-40 rounded-sm font-mono text-xs"
            />
            <Button size="sm" variant="secondary" className="h-7 rounded-sm font-mono text-[11px]" onClick={applyBulkToAll}>
              Fill all
            </Button>
            <Button size="sm" variant="ghost" className="h-7 rounded-sm font-mono text-[11px]" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IOPanel label="Input" value={input} onChange={setInput} />
        <IOPanel label={mode === "detect" ? "Emoji frequency" : "Output"} value={output} readOnly />
      </div>
    </div>
  );
}
