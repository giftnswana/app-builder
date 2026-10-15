import {
  CalculatorShell,
  NumberField,
  ResultReadout,
  SelectField,
  readout,
} from "@/components/calculators/CalculatorShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnitSystem } from "@/lib/units";
import type { ValueEntry } from "@/types";
import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";

type TorqueUnit = "nm" | "knm" | "lbf-ft" | "lbf-in" | "kgf-m";

/** Factor converting one unit of each torque unit into newton-metres. */
const TORQUE_UNITS: { value: TorqueUnit; label: string; toNm: number }[] = [
  { value: "nm", label: "Newton-metres (N·m)", toNm: 1 },
  { value: "knm", label: "Kilonewton-metres (kN·m)", toNm: 1000 },
  { value: "lbf-ft", label: "Pound-feet (lb·ft)", toNm: 1.3558179483314 },
  { value: "lbf-in", label: "Pound-inches (lb·in)", toNm: 0.11298482902762 },
  { value: "kgf-m", label: "Kilogram-force-metres (kgf·m)", toNm: 9.80665 },
];

export function TorqueConversionCalculator() {
  const { unitSystem } = useUnitSystem();

  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<TorqueUnit>(
    unitSystem === "si" ? "nm" : "lbf-ft",
  );
  const [to, setTo] = useState<TorqueUnit>(
    unitSystem === "si" ? "lbf-ft" : "nm",
  );

  const fromUnit = TORQUE_UNITS.find((entry) => entry.value === from);
  const toUnit = TORQUE_UNITS.find((entry) => entry.value === to);

  const result = useMemo(() => {
    const input = Number(value);
    if (!Number.isFinite(input) || !fromUnit || !toUnit) return null;
    const inNm = input * fromUnit.toNm;
    return inNm / toUnit.toNm;
  }, [value, fromUnit, toUnit]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const saveInputs: ValueEntry[] = [
    { name: "Input value", value, unit: fromUnit?.label ?? "" },
    { name: "From unit", value: fromUnit?.label ?? "", unit: "" },
    { name: "To unit", value: toUnit?.label ?? "", unit: "" },
  ];

  const saveOutputs: ValueEntry[] = result
    ? [
        {
          name: "Converted torque",
          value: readout(result),
          unit: toUnit?.label ?? "",
        },
      ]
    : [];

  return (
    <CalculatorShell
      ocid="torque.calculator"
      title="Torque Conversion"
      description="Convert a torque value between common metric and imperial units."
      formula="result = value × (from → N·m) ÷ (to → N·m)"
      results={
        result !== null ? (
          <ResultReadout
            label="Converted torque"
            value={readout(result)}
            unit={toUnit?.label ?? ""}
            emphasis
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a numeric torque value to convert it.
          </p>
        )
      }
      saveInputs={saveInputs}
      saveOutputs={saveOutputs}
      canSave={result !== null}
    >
      <NumberField
        id="torque.value"
        label="Torque value"
        value={value}
        onChange={setValue}
        unit={fromUnit?.label ?? ""}
      />

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <SelectField id="torque.from" label="From unit">
          <Select
            value={from}
            onValueChange={(next) => setFrom(next as TorqueUnit)}
          >
            <SelectTrigger
              id="torque.from"
              data-ocid="torque.from.select"
              className="h-12 w-full rounded-md border-input bg-muted/40 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TORQUE_UNITS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>

        <button
          type="button"
          data-ocid="torque.swap_button"
          onClick={swap}
          aria-label="Swap from and to units"
          className="mx-auto flex size-12 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-smooth hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeftRight aria-hidden="true" className="size-5" />
        </button>

        <SelectField id="torque.to" label="To unit">
          <Select
            value={to}
            onValueChange={(next) => setTo(next as TorqueUnit)}
          >
            <SelectTrigger
              id="torque.to"
              data-ocid="torque.to.select"
              className="h-12 w-full rounded-md border-input bg-muted/40 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TORQUE_UNITS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>
      </div>
    </CalculatorShell>
  );
}
