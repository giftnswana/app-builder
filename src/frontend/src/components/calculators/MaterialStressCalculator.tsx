import {
  CalculatorShell,
  NumberField,
  ResultReadout,
  readout,
} from "@/components/calculators/CalculatorShell";
import { useUnitSystem } from "@/lib/units";
import type { ValueEntry } from "@/types";
import { useMemo, useState } from "react";

const UNITS = {
  si: { force: "N", area: "mm²", stress: "MPa" },
  imperial: { force: "lbf", area: "in²", stress: "psi" },
} as const;

/** Convert a force entered in the active system to newtons. */
function forceToN(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 4.4482216152605;
}

/** Convert an area entered in the active system to square millimetres. */
function areaToMm2(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 645.16;
}

export function MaterialStressCalculator() {
  const { unitSystem } = useUnitSystem();
  const units = UNITS[unitSystem];

  const [force, setForce] = useState("5000");
  const [area, setArea] = useState("100");

  const result = useMemo(() => {
    const F = forceToN(Number(force), unitSystem); // N
    const A = areaToMm2(Number(area), unitSystem); // mm²

    if (!Number.isFinite(F) || !Number.isFinite(A) || A <= 0) {
      return null;
    }

    const stressMpa = F / A; // N/mm² = MPa
    const stress =
      unitSystem === "si" ? stressMpa : stressMpa / 0.006894757293168;

    return { stress };
  }, [force, area, unitSystem]);

  const saveInputs: ValueEntry[] = [
    { name: "Applied force", value: force, unit: units.force },
    { name: "Cross-sectional area", value: area, unit: units.area },
  ];

  const saveOutputs: ValueEntry[] = result
    ? [
        {
          name: "Normal stress",
          value: readout(result.stress),
          unit: units.stress,
        },
      ]
    : [];

  return (
    <CalculatorShell
      ocid="stress.calculator"
      title="Material Stress"
      description="Normal stress from an applied force over a cross-sectional area."
      formula="σ = F / A"
      results={
        result ? (
          <ResultReadout
            label="Normal stress"
            value={readout(result.stress)}
            unit={units.stress}
            emphasis
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a force and a positive cross-sectional area to compute stress.
          </p>
        )
      }
      saveInputs={saveInputs}
      saveOutputs={saveOutputs}
      canSave={result !== null}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          id="stress.force"
          label="Applied force"
          value={force}
          onChange={setForce}
          unit={units.force}
        />
        <NumberField
          id="stress.area"
          label="Cross-sectional area"
          value={area}
          onChange={setArea}
          unit={units.area}
        />
      </div>
    </CalculatorShell>
  );
}
