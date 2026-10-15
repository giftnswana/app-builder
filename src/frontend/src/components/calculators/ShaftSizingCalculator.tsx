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
  si: { torque: "N·m", stress: "MPa", diameter: "mm" },
  imperial: { torque: "lb·ft", stress: "psi", diameter: "in" },
} as const;

/** Convert a torque entered in the active system to newton-metres. */
function torqueToNm(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 1.3558179483314;
}

/** Convert an allowable shear stress entered in the active system to MPa. */
function stressToMpa(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 0.006894757293168;
}

export function ShaftSizingCalculator() {
  const { unitSystem } = useUnitSystem();
  const units = UNITS[unitSystem];

  const [torque, setTorque] = useState("500");
  const [allowable, setAllowable] = useState("40");

  const result = useMemo(() => {
    const T = torqueToNm(Number(torque), unitSystem); // N·m
    const tau = stressToMpa(Number(allowable), unitSystem); // MPa = N/mm²

    if (!Number.isFinite(T) || !Number.isFinite(tau) || T <= 0 || tau <= 0) {
      return null;
    }

    // Solid circular shaft: d = (16·T / (π·τ))^(1/3), T in N·mm.
    const Tnmm = T * 1000;
    const diameterMm = Math.cbrt((16 * Tnmm) / (Math.PI * tau));
    const diameter = unitSystem === "si" ? diameterMm : diameterMm / 25.4;

    return { diameter };
  }, [torque, allowable, unitSystem]);

  const saveInputs: ValueEntry[] = [
    { name: "Torque", value: torque, unit: units.torque },
    { name: "Allowable shear stress", value: allowable, unit: units.stress },
  ];

  const saveOutputs: ValueEntry[] = result
    ? [
        {
          name: "Required shaft diameter",
          value: readout(result.diameter),
          unit: units.diameter,
        },
      ]
    : [];

  return (
    <CalculatorShell
      ocid="shaft.calculator"
      title="Shaft Sizing"
      description="Minimum solid shaft diameter for a given torque and allowable shear stress."
      formula="d = ∛(16·T / (π·τ))"
      results={
        result ? (
          <ResultReadout
            label="Required shaft diameter"
            value={readout(result.diameter)}
            unit={units.diameter}
            emphasis
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a positive torque and allowable shear stress to size the
            shaft.
          </p>
        )
      }
      saveInputs={saveInputs}
      saveOutputs={saveOutputs}
      canSave={result !== null}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          id="shaft.torque"
          label="Applied torque"
          value={torque}
          onChange={setTorque}
          unit={units.torque}
        />
        <NumberField
          id="shaft.allowable"
          label="Allowable shear stress"
          value={allowable}
          onChange={setAllowable}
          unit={units.stress}
        />
      </div>
    </CalculatorShell>
  );
}
