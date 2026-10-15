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
  si: { pressure: "MPa", diameter: "mm", thickness: "mm" },
  imperial: { pressure: "psi", diameter: "in", thickness: "in" },
} as const;

/** Convert a pressure entered in the active system to MPa. */
function pressureToMpa(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 0.006894757293168;
}

export function PressureVesselCalculator() {
  const { unitSystem } = useUnitSystem();
  const units = UNITS[unitSystem];

  const [pressure, setPressure] = useState("1.5");
  const [diameter, setDiameter] = useState("500");
  const [allowable, setAllowable] = useState("140");

  const result = useMemo(() => {
    const P = pressureToMpa(Number(pressure), unitSystem); // MPa
    const D = Number(diameter); // mm or in
    const S = pressureToMpa(Number(allowable), unitSystem); // MPa

    if (
      !Number.isFinite(P) ||
      !Number.isFinite(D) ||
      !Number.isFinite(S) ||
      P <= 0 ||
      D <= 0 ||
      S <= 0
    ) {
      return null;
    }

    // Thin-wall cylindrical shell: t = P·D / (2·S). Diameter is converted to
    // millimetres so the result is dimensionally consistent, then converted
    // back to the active system.
    const Dmm = unitSystem === "si" ? D : D * 25.4;
    const thicknessMm = (P * Dmm) / (2 * S);
    const thickness = unitSystem === "si" ? thicknessMm : thicknessMm / 25.4;

    return { thickness };
  }, [pressure, diameter, allowable, unitSystem]);

  const saveInputs: ValueEntry[] = [
    { name: "Internal pressure", value: pressure, unit: units.pressure },
    { name: "Internal diameter", value: diameter, unit: units.diameter },
    { name: "Allowable stress", value: allowable, unit: units.pressure },
  ];

  const saveOutputs: ValueEntry[] = result
    ? [
        {
          name: "Minimum wall thickness",
          value: readout(result.thickness),
          unit: units.thickness,
        },
      ]
    : [];

  return (
    <CalculatorShell
      ocid="vessel.calculator"
      title="Pressure Vessel Wall"
      description="Minimum wall thickness for a thin-wall cylindrical shell."
      formula="t = P·D / (2·S)"
      results={
        result ? (
          <ResultReadout
            label="Minimum wall thickness"
            value={readout(result.thickness)}
            unit={units.thickness}
            emphasis
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter positive pressure, diameter and allowable stress to size the
            wall.
          </p>
        )
      }
      saveInputs={saveInputs}
      saveOutputs={saveOutputs}
      canSave={result !== null}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          id="vessel.pressure"
          label="Internal pressure"
          value={pressure}
          onChange={setPressure}
          unit={units.pressure}
        />
        <NumberField
          id="vessel.diameter"
          label="Internal diameter"
          value={diameter}
          onChange={setDiameter}
          unit={units.diameter}
        />
      </div>
      <NumberField
        id="vessel.allowable"
        label="Allowable stress"
        value={allowable}
        onChange={setAllowable}
        unit={units.pressure}
      />
    </CalculatorShell>
  );
}
