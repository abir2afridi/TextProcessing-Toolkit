import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Scale = "kelvin" | "celsius" | "fahrenheit" | "rankine" | "delisle" | "newton" | "reaumur" | "romer";

const scales: { key: Scale; title: string; unit: string }[] = [
  { key: "kelvin", title: "Kelvin", unit: "K" },
  { key: "celsius", title: "Celsius", unit: "°C" },
  { key: "fahrenheit", title: "Fahrenheit", unit: "°F" },
  { key: "rankine", title: "Rankine", unit: "°R" },
  { key: "delisle", title: "Delisle", unit: "°De" },
  { key: "newton", title: "Newton", unit: "°N" },
  { key: "reaumur", title: "Réaumur", unit: "°Ré" },
  { key: "romer", title: "Rømer", unit: "°Rø" },
];

const toKelvin: Record<Scale, (v: number) => number> = {
  kelvin: (v) => v,
  celsius: (v) => v + 273.15,
  fahrenheit: (v) => (v + 459.67) * (5 / 9),
  rankine: (v) => v * (5 / 9),
  delisle: (v) => 373.15 - (2 / 3) * v,
  newton: (v) => v * (100 / 33) + 273.15,
  reaumur: (v) => v * (5 / 4) + 273.15,
  romer: (v) => (v - 7.5) * (40 / 21) + 273.15,
};

const fromKelvin: Record<Scale, (v: number) => number> = {
  kelvin: (v) => v,
  celsius: (v) => v - 273.15,
  fahrenheit: (v) => v * (9 / 5) - 459.67,
  rankine: (v) => v * (9 / 5),
  delisle: (v) => (3 / 2) * (373.15 - v),
  newton: (v) => (v - 273.15) * (33 / 100),
  reaumur: (v) => (v - 273.15) * (4 / 5),
  romer: (v) => (v - 273.15) * (21 / 40) + 7.5,
};

function round(v: number) { return Math.floor(v * 100 + 0.00001) / 100; }

export default function TempConverter() {
  const [values, setValues] = useState<Record<Scale, string>>(() => {
    const init: Record<string, string> = {};
    for (const { key } of scales) init[key] = "";
    init.kelvin = "300";
    return init as Record<Scale, string>;
  });

  const update = useCallback((changedKey: Scale, raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n)) {
      setValues((prev) => ({ ...prev, [changedKey]: raw }));
      return;
    }
    const kelvins = toKelvin[changedKey](n);
    setValues((prev) => {
      const next = { ...prev, [changedKey]: raw };
      for (const { key } of scales) {
        if (key !== changedKey) {
          next[key] = round(fromKelvin[key](kelvins)).toString();
        }
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      {scales.map(({ key, title, unit }) => (
        <div key={key} className="flex items-center gap-0">
          <div className="flex h-8 w-[100px] items-center rounded-sm rounded-r-none border border-border bg-muted/40 px-3 font-mono text-[11px] text-muted-foreground">
            {title}
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-6 rounded-none border border-border border-r-0 font-mono text-xs" onClick={() => update(key, String((parseFloat(values[key]) || 0) - 1))}>−</Button>
          <Input
            type="number"
            value={values[key]}
            onChange={(e) => update(key, e.target.value)}
            className="h-8 flex-1 rounded-none font-mono text-xs"
          />
          <Button size="sm" variant="ghost" className="h-8 w-6 rounded-none border border-border border-l-0 font-mono text-xs" onClick={() => update(key, String((parseFloat(values[key]) || 0) + 1))}>+</Button>
          <div className="flex h-8 w-[50px] items-center rounded-sm rounded-l-none border border-border bg-muted/40 px-3 font-mono text-[11px] text-muted-foreground">
            {unit}
          </div>
        </div>
      ))}
    </div>
  );
}
