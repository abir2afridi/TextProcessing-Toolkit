import { useState, useMemo, useCallback } from "react";
import { colord, extend } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import namesPlugin from "colord/plugins/names";
import lchPlugin from "colord/plugins/lch";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

interface ColorFormat {
  label: string;
  format: (color: ReturnType<typeof colord>) => string;
  parse: (value: string) => ReturnType<typeof colord> | undefined;
  placeholder: string;
  invalidMessage: string;
}

const formats: ColorFormat[] = [
  {
    label: "hex",
    format: (c) => c.toHex(),
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. #ff0000",
    invalidMessage: "Invalid hex format.",
  },
  {
    label: "rgb",
    format: (c) => c.toRgbString(),
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. rgb(255, 0, 0)",
    invalidMessage: "Invalid rgb format.",
  },
  {
    label: "hsl",
    format: (c) => c.toHslString(),
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. hsl(0, 100%, 50%)",
    invalidMessage: "Invalid hsl format.",
  },
  {
    label: "hwb",
    format: (c) => c.toHwbString(),
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. hwb(0, 0%, 0%)",
    invalidMessage: "Invalid hwb format.",
  },
  {
    label: "lch",
    format: (c) => c.toLchString(),
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. lch(53.24, 104.55, 40.85)",
    invalidMessage: "Invalid lch format.",
  },
  {
    label: "cmyk",
    format: (c) => c.toCmykString(),
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. cmyk(0, 100%, 100%, 0)",
    invalidMessage: "Invalid cmyk format.",
  },
  {
    label: "name",
    format: (c) => c.toName({ closest: true }) ?? "Unknown",
    parse: (v) => {
      const c = colord(v);
      return c.isValid() ? c : undefined;
    },
    placeholder: "e.g. red",
    invalidMessage: "Invalid name format.",
  },
];

function removeAlphaChannelWhenOpaque(hexColor: string) {
  return hexColor.replace(/^(#(?:[0-9a-f]{3}){1,2})ff$/i, "$1");
}

export default function ColorConverter() {
  const [picker, setPicker] = useState("#1ea54c");

  const currentColor = useMemo(() => colord(picker), [picker]);

  const [editing, setEditing] = useState<Record<string, string>>({});

  const getValue = useCallback(
    (fmt: ColorFormat) => {
      if (editing[fmt.label] !== undefined) return editing[fmt.label];
      return fmt.format(currentColor);
    },
    [editing, currentColor],
  );

  const getValidation = useCallback(
    (fmt: ColorFormat, raw: string) => {
      if (raw === "") return null;
      const c = fmt.parse(raw);
      if (!c) return fmt.invalidMessage;
      return null;
    },
    [],
  );

  function handleChange(fmt: ColorFormat, raw: string) {
    setEditing((prev) => ({ ...prev, [fmt.label]: raw }));

    if (raw === "") return;
    const c = fmt.parse(raw);
    if (c && c.isValid()) {
      setPicker(c.toHex());
      setEditing({});
    }
  }

  function handlePickerChange(hex: string) {
    setPicker(hex);
    setEditing({});
  }

  const pickerDisplay = removeAlphaChannelWhenOpaque(currentColor.toHex());

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-[100px] flex-shrink-0 text-right font-mono text-[11px] text-muted-foreground">
          color picker:
        </span>
        <input
          type="color"
          value={pickerDisplay}
          onChange={(e) => handlePickerChange(e.target.value)}
          className="h-9 w-20 cursor-pointer rounded-sm border border-border bg-transparent"
        />
        <div className="h-9 w-20 rounded-sm border border-border" style={{ background: currentColor.toHex() }} />
      </div>

      {formats.map((fmt) => {
        const raw = getValue(fmt);
        const validation = getValidation(fmt, raw);

        return (
          <div key={fmt.label} className="flex items-start gap-3">
            <span className="mt-1.5 w-[100px] flex-shrink-0 text-right font-mono text-[11px] text-muted-foreground">
              {fmt.label}:
            </span>
            <div className="relative flex-1">
              <Input
                value={raw}
                onChange={(e) => handleChange(fmt, e.target.value)}
                placeholder={fmt.placeholder}
                className={`h-8 w-full rounded-sm font-mono text-xs ${validation ? "border-destructive" : ""}`}
              />
              {validation && (
                <span className="mt-0.5 block font-mono text-[10px] text-destructive">
                  {validation}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(raw);
                toast.success(`Copied ${fmt.label}`);
              }}
              className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-muted-foreground hover:bg-background"
              title={`Copy ${fmt.label}`}
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
