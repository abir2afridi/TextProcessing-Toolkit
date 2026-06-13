export interface MathConstant {
  name: string;
  symbol: string;
  value: number;
  unit?: string;
  category: "mathematical" | "physical" | "chemical";
}

export const MATH_CONSTANTS: MathConstant[] = [
  { name: "Pi", symbol: "\u03C0", value: Math.PI, category: "mathematical" },
  { name: "Euler's number", symbol: "e", value: Math.E, category: "mathematical" },
  { name: "Golden ratio", symbol: "\u03C6", value: 1.618033988749895, category: "mathematical" },
  { name: "Square root of 2", symbol: "\u221A2", value: Math.SQRT2, category: "mathematical" },
  { name: "Square root of 3", symbol: "\u221A3", value: 1.7320508075688772, category: "mathematical" },
  { name: "Natural log of 2", symbol: "ln(2)", value: Math.LN2, category: "mathematical" },
  { name: "Natural log of 10", symbol: "ln(10)", value: Math.LN10, category: "mathematical" },
  { name: "Euler-Mascheroni", symbol: "\u03B3", value: 0.5772156649015329, category: "mathematical" },
  { name: "Speed of light", symbol: "c", value: 299792458, unit: "m/s", category: "physical" },
  { name: "Planck constant", symbol: "h", value: 6.62607015e-34, unit: "J\u00B7s", category: "physical" },
  { name: "Gravitational constant", symbol: "G", value: 6.6743e-11, unit: "m\u00B3/(kg\u00B7s\u00B2)", category: "physical" },
  { name: "Boltzmann constant", symbol: "kB", value: 1.380649e-23, unit: "J/K", category: "physical" },
  { name: "Elementary charge", symbol: "e", value: 1.602176634e-19, unit: "C", category: "physical" },
  { name: "Electron mass", symbol: "m\u2091", value: 9.1093837015e-31, unit: "kg", category: "physical" },
  { name: "Proton mass", symbol: "m\u209A", value: 1.67262192369e-27, unit: "kg", category: "physical" },
  { name: "Standard gravity", symbol: "g", value: 9.80665, unit: "m/s\u00B2", category: "physical" },
  { name: "Avogadro constant", symbol: "N\u2090", value: 6.02214076e23, unit: "mol\u207B\u00B9", category: "chemical" },
  { name: "Gas constant", symbol: "R", value: 8.314462618, unit: "J/(mol\u00B7K)", category: "chemical" },
  { name: "Faraday constant", symbol: "F", value: 96485.33212, unit: "C/mol", category: "chemical" },
];

export function formatScientific(value: number): string {
  if (value === 0) return "0";
  const absValue = Math.abs(value);
  if (absValue >= 1e-3 && absValue < 1e6) {
    return value.toPrecision(10).replace(/\.?0+$/, "");
  }
  const exp = Math.floor(Math.log10(absValue));
  const mantissa = value / Math.pow(10, exp);
  return `${mantissa.toPrecision(6).replace(/\.?0+$/, "")} \u00D7 10^${exp}`;
}
