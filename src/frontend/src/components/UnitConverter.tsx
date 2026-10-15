import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaveCalculation } from "@/hooks/useQueries";
import { formatNumber } from "@/lib/format";
import { useUnitSystem } from "@/lib/units";
import { cn } from "@/lib/utils";
import type { UnitSystem, ValueEntry } from "@/types";
import { ArrowDownUp, Check, Save } from "lucide-react";
import { useMemo, useState } from "react";

type UnitDef = {
  id: string;
  label: string;
  symbol: string;
  /** Multiply a value in this unit by `factor` to get the category base unit. */
  factor: number;
  system: UnitSystem;
};

type CategoryDef = {
  id: string;
  label: string;
  /** The base unit every other unit in the category converts through. */
  baseSymbol: string;
  units: UnitDef[];
  /** Non-linear categories (temperature) supply their own converters. */
  toBase?: (value: number, unitId: string) => number;
  fromBase?: (base: number, unitId: string) => number;
};

const linear = (
  id: string,
  label: string,
  symbol: string,
  factor: number,
  system: UnitSystem,
): UnitDef => ({ id, label, symbol, factor, system });

const CATEGORIES: CategoryDef[] = [
  {
    id: "force",
    label: "Force",
    baseSymbol: "N",
    units: [
      linear("n", "Newton", "N", 1, "si"),
      linear("kn", "Kilonewton", "kN", 1000, "si"),
      linear("kgf", "Kilogram-force", "kgf", 9.80665, "si"),
      linear("lbf", "Pound-force", "lbf", 4.4482216152605, "imperial"),
      linear("kip", "Kip", "kip", 4448.2216152605, "imperial"),
    ],
  },
  {
    id: "torque",
    label: "Torque",
    baseSymbol: "N·m",
    units: [
      linear("nm", "Newton-metre", "N·m", 1, "si"),
      linear("knm", "Kilonewton-metre", "kN·m", 1000, "si"),
      linear("kgfm", "Kilogram-force-metre", "kgf·m", 9.80665, "si"),
      linear(
        "lbfin",
        "Pound-force-inch",
        "lbf·in",
        0.1129848290276167,
        "imperial",
      ),
      linear(
        "lbfft",
        "Pound-force-foot",
        "lbf·ft",
        1.3558179483314003,
        "imperial",
      ),
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    baseSymbol: "Pa",
    units: [
      linear("pa", "Pascal", "Pa", 1, "si"),
      linear("kpa", "Kilopascal", "kPa", 1000, "si"),
      linear("mpa", "Megapascal", "MPa", 1_000_000, "si"),
      linear("bar", "Bar", "bar", 100_000, "si"),
      linear(
        "psi",
        "Pound per square inch",
        "psi",
        6894.757293168361,
        "imperial",
      ),
      linear(
        "ksi",
        "Kilopound per square inch",
        "ksi",
        6_894_757.293168361,
        "imperial",
      ),
    ],
  },
  {
    id: "stress",
    label: "Stress",
    baseSymbol: "Pa",
    units: [
      linear("pa", "Pascal", "Pa", 1, "si"),
      linear("kpa", "Kilopascal", "kPa", 1000, "si"),
      linear("mpa", "Megapascal", "MPa", 1_000_000, "si"),
      linear("gpa", "Gigapascal", "GPa", 1_000_000_000, "si"),
      linear(
        "psi",
        "Pound per square inch",
        "psi",
        6894.757293168361,
        "imperial",
      ),
      linear(
        "ksi",
        "Kilopound per square inch",
        "ksi",
        6_894_757.293168361,
        "imperial",
      ),
    ],
  },
  {
    id: "length",
    label: "Length",
    baseSymbol: "m",
    units: [
      linear("mm", "Millimetre", "mm", 0.001, "si"),
      linear("cm", "Centimetre", "cm", 0.01, "si"),
      linear("m", "Metre", "m", 1, "si"),
      linear("km", "Kilometre", "km", 1000, "si"),
      linear("in", "Inch", "in", 0.0254, "imperial"),
      linear("ft", "Foot", "ft", 0.3048, "imperial"),
      linear("yd", "Yard", "yd", 0.9144, "imperial"),
      linear("mi", "Mile", "mi", 1609.344, "imperial"),
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    baseSymbol: "°C",
    units: [
      linear("c", "Celsius", "°C", 1, "si"),
      linear("k", "Kelvin", "K", 1, "si"),
      linear("f", "Fahrenheit", "°F", 1, "imperial"),
      linear("r", "Rankine", "°R", 1, "imperial"),
    ],
    toBase: (value, unitId) => {
      switch (unitId) {
        case "c":
          return value;
        case "k":
          return value - 273.15;
        case "f":
          return (value - 32) / 1.8;
        case "r":
          return (value - 491.67) / 1.8;
        default:
          return value;
      }
    },
    fromBase: (base, unitId) => {
      switch (unitId) {
        case "c":
          return base;
        case "k":
          return base + 273.15;
        case "f":
          return base * 1.8 + 32;
        case "r":
          return (base + 273.15) * 1.8;
        default:
          return base;
      }
    },
  },
  {
    id: "flow",
    label: "Flow rate",
    baseSymbol: "m³/s",
    units: [
      linear("m3s", "Cubic metre per second", "m³/s", 1, "si"),
      linear("lps", "Litre per second", "L/s", 0.001, "si"),
      linear("lpm", "Litre per minute", "L/min", 0.001 / 60, "si"),
      linear("m3h", "Cubic metre per hour", "m³/h", 1 / 3600, "si"),
      linear("gpm", "US gallon per minute", "gpm", 0.0000630901964, "imperial"),
      linear(
        "cfm",
        "Cubic foot per minute",
        "cfm",
        0.0004719474432,
        "imperial",
      ),
    ],
  },
  {
    id: "thermal",
    label: "Thermal conductivity",
    baseSymbol: "W/(m·K)",
    units: [
      linear("wmk", "Watt per metre-kelvin", "W/(m·K)", 1, "si"),
      linear("wcmk", "Watt per centimetre-kelvin", "W/(cm·K)", 100, "si"),
      linear(
        "btuin",
        "BTU·in/(h·ft²·°F)",
        "BTU·in/(h·ft²·°F)",
        0.1442279,
        "imperial",
      ),
      linear("btuft", "BTU/(h·ft·°F)", "BTU/(h·ft·°F)", 1.730735, "imperial"),
    ],
  },
];

const DEFAULT_UNITS: Record<string, { from: string; to: string }> = {
  force: { from: "n", to: "lbf" },
  torque: { from: "nm", to: "lbfft" },
  pressure: { from: "mpa", to: "psi" },
  stress: { from: "mpa", to: "ksi" },
  length: { from: "mm", to: "in" },
  temperature: { from: "c", to: "f" },
  flow: { from: "lps", to: "gpm" },
  thermal: { from: "wmk", to: "btuin" },
};

/** Convert a value between two units of the same category. */
function convert(
  category: CategoryDef,
  value: number,
  fromId: string,
  toId: string,
): number {
  const from = category.units.find((unit) => unit.id === fromId);
  const to = category.units.find((unit) => unit.id === toId);
  if (!from || !to) return Number.NaN;

  if (category.toBase && category.fromBase) {
    return category.fromBase(category.toBase(value, fromId), toId);
  }
  return (value * from.factor) / to.factor;
}

/** Parse a user-entered numeric string, tolerating a leading + and spaces. */
function parseInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function UnitConverter() {
  const { unitSystem } = useUnitSystem();
  const saveCalculation = useSaveCalculation();

  const [categoryId, setCategoryId] = useState<string>("force");
  const [fromUnitId, setFromUnitId] = useState<string>("n");
  const [toUnitId, setToUnitId] = useState<string>("lbf");
  const [rawValue, setRawValue] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const category =
    CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[0];

  const fromUnit =
    category.units.find((unit) => unit.id === fromUnitId) ?? category.units[0];
  const toUnit =
    category.units.find((unit) => unit.id === toUnitId) ?? category.units[1];

  const parsed = parseInput(rawValue);
  const result =
    parsed === null ? null : convert(category, parsed, fromUnit.id, toUnit.id);

  const error =
    rawValue.trim() === ""
      ? null
      : parsed === null
        ? "Enter a valid number."
        : result !== null && !Number.isFinite(result)
          ? "This conversion is out of range."
          : null;

  const canSave = parsed !== null && result !== null && Number.isFinite(result);

  const handleCategoryChange = (nextId: string) => {
    const next = CATEGORIES.find((item) => item.id === nextId);
    if (!next) return;
    const defaults = DEFAULT_UNITS[next.id] ?? {
      from: next.units[0].id,
      to: next.units[1].id,
    };
    setCategoryId(next.id);
    setFromUnitId(defaults.from);
    setToUnitId(defaults.to);
    setSaved(false);
  };

  const handleSwap = () => {
    setFromUnitId(toUnit.id);
    setToUnitId(fromUnit.id);
    setSaved(false);
  };

  const handleSave = () => {
    if (!canSave || result === null || parsed === null) return;
    const inputs: ValueEntry[] = [
      { name: "Value", value: formatNumber(parsed, 6), unit: fromUnit.symbol },
    ];
    const outputs: ValueEntry[] = [
      { name: "Result", value: formatNumber(result, 6), unit: toUnit.symbol },
    ];
    saveCalculation.mutate(
      { calculator: `${category.label} converter`, inputs, outputs },
      { onSuccess: () => setSaved(true) },
    );
  };

  const unitOptions = useMemo(
    () =>
      category.units.map((unit) => ({
        ...unit,
        preferred: unit.system === unitSystem,
      })),
    [category, unitSystem],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="converter-category"
          className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Category
        </Label>
        <Select value={category.id} onValueChange={handleCategoryChange}>
          <SelectTrigger
            id="converter-category"
            data-ocid="converter.category_select"
            className="h-12 w-full text-base"
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="converter-value"
            className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            From
          </Label>
          <Input
            id="converter-value"
            data-ocid="converter.input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={rawValue}
            onChange={(event) => {
              setRawValue(event.target.value);
              setSaved(false);
            }}
            aria-invalid={error !== null}
            aria-describedby={error ? "converter-error" : undefined}
            className="readout h-14 w-full text-2xl font-semibold"
          />
          <Select
            value={fromUnit.id}
            onValueChange={(value) => {
              setFromUnitId(value);
              setSaved(false);
            }}
          >
            <SelectTrigger
              data-ocid="converter.from_unit_select"
              className="h-12 w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.label} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center sm:pb-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            data-ocid="converter.swap_button"
            aria-label="Swap source and target units"
            onClick={handleSwap}
            className="size-12 rounded-full"
          >
            <ArrowDownUp aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            To
          </span>
          <output
            data-ocid="converter.result"
            aria-live="polite"
            className={cn(
              "readout flex h-14 w-full items-center overflow-hidden rounded-md border border-border bg-secondary px-3 text-2xl font-semibold",
              error ? "text-muted-foreground" : "text-primary",
            )}
          >
            <span className="truncate">
              {error ? "—" : result === null ? "—" : formatNumber(result, 6)}
            </span>
          </output>
          <Select
            value={toUnit.id}
            onValueChange={(value) => {
              setToUnitId(value);
              setSaved(false);
            }}
          >
            <SelectTrigger
              data-ocid="converter.to_unit_select"
              className="h-12 w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.label} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <p
          id="converter-error"
          data-ocid="converter.error_state"
          role="alert"
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          data-ocid="converter.save_button"
          onClick={handleSave}
          disabled={!canSave || saveCalculation.isPending}
          className="h-12 gap-2 px-5 text-base font-semibold"
        >
          {saved ? (
            <Check aria-hidden="true" className="size-5" />
          ) : (
            <Save aria-hidden="true" className="size-5" />
          )}
          {saveCalculation.isPending
            ? "Saving…"
            : saved
              ? "Saved to history"
              : "Save conversion"}
        </Button>
        {saveCalculation.isError ? (
          <p
            data-ocid="converter.save_error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            Could not save. Try again.
          </p>
        ) : null}
      </div>
    </div>
  );
}
