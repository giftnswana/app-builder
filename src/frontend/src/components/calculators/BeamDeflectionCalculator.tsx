import {
  CalculatorShell,
  FormulaNote,
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
import { useMaterials } from "@/hooks/useQueries";
import { useUnitSystem } from "@/lib/units";
import type { UnitSystem, ValueEntry } from "@/types";
import { useMemo, useRef, useState } from "react";

type BeamType = "simply-supported" | "cantilever";
type LoadType = "point" | "distributed";

const BEAM_TYPES: { value: BeamType; label: string }[] = [
  { value: "simply-supported", label: "Simply supported" },
  { value: "cantilever", label: "Cantilever" },
];

const LOAD_TYPES: { value: LoadType; label: string }[] = [
  { value: "point", label: "Central point load" },
  { value: "distributed", label: "Uniformly distributed load" },
];

/** Unit labels for the active system. */
const UNITS = {
  si: {
    length: "mm",
    load: "N",
    udl: "N/mm",
    modulus: "MPa",
    stress: "MPa",
    deflection: "mm",
    inertia: "mm⁴",
  },
  imperial: {
    length: "in",
    load: "lbf",
    udl: "lbf/in",
    modulus: "psi",
    stress: "psi",
    deflection: "in",
    inertia: "in⁴",
  },
} as const;

/** Convert a length entered in the active system to millimetres. */
function lengthToMm(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 25.4;
}

/** Convert a force entered in the active system to newtons. */
function forceToN(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 4.4482216152605;
}

/** Convert a modulus/stress entered in the active system to MPa. */
function stressToMpa(value: number, system: "si" | "imperial"): number {
  return system === "si" ? value : value * 0.006894757293168;
}

const MM_PER_IN = 25.4;
const N_PER_LBF = 4.4482216152605;
const MPA_PER_PSI = 0.006894757293168;

/**
 * Convert a raw input string from one unit system to another so the displayed
 * value keeps its physical meaning when the toggle changes. Non-numeric or
 * empty strings are returned unchanged.
 */
function convertInputString(
  raw: string,
  from: UnitSystem,
  to: UnitSystem,
  factor: number,
): string {
  if (from === to) return raw;
  const value = Number(raw);
  if (raw.trim() === "" || !Number.isFinite(value)) return raw;
  const converted = to === "imperial" ? value / factor : value * factor;
  // Trim floating-point noise while keeping enough precision for the readout.
  return String(Number(converted.toPrecision(12)));
}

export function BeamDeflectionCalculator({
  initialMaterial,
}: {
  /** Material name carried over from the materials page, if any. */
  initialMaterial?: string;
} = {}) {
  const { unitSystem } = useUnitSystem();
  const units = UNITS[unitSystem];
  const { data: materials } = useMaterials();

  const [beamType, setBeamType] = useState<BeamType>("simply-supported");
  const [loadType, setLoadType] = useState<LoadType>("point");
  const [materialName, setMaterialName] = useState<string>(
    initialMaterial ?? "",
  );
  const [length, setLength] = useState("1000");
  const [load, setLoad] = useState("1000");
  const [width, setWidth] = useState("50");
  const [height, setHeight] = useState("100");
  const [modulus, setModulus] = useState("200000");

  // Seed the modulus field once the carried-over material's data arrives.
  const seededMaterial = useRef<string | null>(null);
  if (
    initialMaterial &&
    seededMaterial.current !== initialMaterial &&
    materials
  ) {
    const material = materials.find((entry) => entry.name === initialMaterial);
    if (material) {
      seededMaterial.current = initialMaterial;
      const value = material.modulusOfElasticity.value;
      const unit = material.modulusOfElasticity.unit.toLowerCase();
      const inMpa = unit.includes("gpa") ? value * 1000 : value;
      setModulus(
        unitSystem === "si" ? String(inMpa) : String(inMpa / MPA_PER_PSI),
      );
    }
  }

  // Convert the displayed inputs whenever the unit system changes so the
  // numbers keep their physical meaning (e.g. 1000 mm -> 39.3701 in).
  const previousSystem = useRef<UnitSystem>(unitSystem);
  if (previousSystem.current !== unitSystem) {
    const from = previousSystem.current;
    const to = unitSystem;
    previousSystem.current = to;
    setLength((value) => convertInputString(value, from, to, MM_PER_IN));
    setWidth((value) => convertInputString(value, from, to, MM_PER_IN));
    setHeight((value) => convertInputString(value, from, to, MM_PER_IN));
    setLoad((value) => convertInputString(value, from, to, N_PER_LBF));
    setModulus((value) => convertInputString(value, from, to, MPA_PER_PSI));
  }

  const selectedMaterial = useMemo(
    () => materials?.find((material) => material.name === materialName),
    [materials, materialName],
  );

  // Selecting a material seeds the modulus field from its library value.
  const handleMaterialChange = (name: string) => {
    setMaterialName(name);
    const material = materials?.find((entry) => entry.name === name);
    if (material) {
      const value = material.modulusOfElasticity.value;
      const unit = material.modulusOfElasticity.unit.toLowerCase();
      const inMpa = unit.includes("gpa") ? value * 1000 : value;
      setModulus(
        unitSystem === "si" ? String(inMpa) : String(inMpa / MPA_PER_PSI),
      );
    }
  };

  const result = useMemo(() => {
    const L = lengthToMm(Number(length), unitSystem);
    const P = forceToN(Number(load), unitSystem);
    const b = lengthToMm(Number(width), unitSystem);
    const h = lengthToMm(Number(height), unitSystem);
    const E = stressToMpa(Number(modulus), unitSystem);

    if (
      !Number.isFinite(L) ||
      !Number.isFinite(P) ||
      !Number.isFinite(b) ||
      !Number.isFinite(h) ||
      !Number.isFinite(E) ||
      L <= 0 ||
      P <= 0 ||
      b <= 0 ||
      h <= 0 ||
      E <= 0
    ) {
      return null;
    }

    const I = (b * h ** 3) / 12; // mm⁴
    const c = h / 2; // mm

    // Deflection (mm) and maximum bending moment (N·mm) per case.
    let deflectionMm: number;
    let momentNmm: number;
    if (beamType === "simply-supported") {
      if (loadType === "point") {
        deflectionMm = (P * L ** 3) / (48 * E * I);
        momentNmm = (P * L) / 4;
      } else {
        const w = P / L; // N/mm
        deflectionMm = (5 * w * L ** 4) / (384 * E * I);
        momentNmm = (w * L ** 2) / 8;
      }
    } else {
      if (loadType === "point") {
        deflectionMm = (P * L ** 3) / (3 * E * I);
        momentNmm = P * L;
      } else {
        const w = P / L; // N/mm
        deflectionMm = (w * L ** 4) / (8 * E * I);
        momentNmm = (w * L ** 2) / 2;
      }
    }

    const stressMpa = (momentNmm * c) / I; // N/mm² = MPa

    const toDisplayLength = (mm: number) =>
      unitSystem === "si" ? mm : mm / MM_PER_IN;
    const toDisplayStress = (mpa: number) =>
      unitSystem === "si" ? mpa : mpa / MPA_PER_PSI;

    return {
      deflection: toDisplayLength(deflectionMm),
      stress: toDisplayStress(stressMpa),
      inertia: unitSystem === "si" ? I : I / MM_PER_IN ** 4,
      moment:
        unitSystem === "si" ? momentNmm / 1000 : momentNmm / N_PER_LBF / 12,
    };
  }, [beamType, loadType, length, load, width, height, modulus, unitSystem]);

  const beamLabel =
    BEAM_TYPES.find((entry) => entry.value === beamType)?.label ?? "";
  const loadLabel =
    LOAD_TYPES.find((entry) => entry.value === loadType)?.label ?? "";

  const saveInputs: ValueEntry[] = [
    { name: "Beam type", value: beamLabel, unit: "" },
    { name: "Load type", value: loadLabel, unit: "" },
    {
      name: "Material",
      value: selectedMaterial ? selectedMaterial.name : "Custom",
      unit: "",
    },
    { name: "Length", value: length, unit: units.length },
    { name: "Load", value: load, unit: units.load },
    { name: "Width", value: width, unit: units.length },
    { name: "Height", value: height, unit: units.length },
    { name: "Modulus of elasticity", value: modulus, unit: units.modulus },
  ];

  const saveOutputs: ValueEntry[] = result
    ? [
        {
          name: "Maximum deflection",
          value: readout(result.deflection),
          unit: units.deflection,
        },
        {
          name: "Maximum bending stress",
          value: readout(result.stress),
          unit: units.stress,
        },
      ]
    : [];

  return (
    <CalculatorShell
      ocid="beam.calculator"
      title="Beam Deflection"
      description="Deflection and maximum bending stress for a rectangular beam section."
      formula={
        beamType === "simply-supported"
          ? loadType === "point"
            ? "δ = P·L³ / (48·E·I)   ·   σ = M·c / I,  M = P·L / 4"
            : "δ = 5·w·L⁴ / (384·E·I)   ·   σ = M·c / I,  M = w·L² / 8"
          : loadType === "point"
            ? "δ = P·L³ / (3·E·I)   ·   σ = M·c / I,  M = P·L"
            : "δ = w·L⁴ / (8·E·I)   ·   σ = M·c / I,  M = w·L² / 2"
      }
      results={
        result ? (
          <>
            <ResultReadout
              label="Maximum deflection"
              value={readout(result.deflection)}
              unit={units.deflection}
              emphasis
            />
            <ResultReadout
              label="Maximum bending stress"
              value={readout(result.stress)}
              unit={units.stress}
            />
            <ResultReadout
              label="Second moment of area"
              value={readout(result.inertia)}
              unit={units.inertia}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter positive dimensions, load and modulus to compute a result.
          </p>
        )
      }
      saveInputs={saveInputs}
      saveOutputs={saveOutputs}
      canSave={result !== null}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField id="beam.type" label="Beam type">
          <Select
            value={beamType}
            onValueChange={(value) => setBeamType(value as BeamType)}
          >
            <SelectTrigger
              id="beam.type"
              data-ocid="beam.type.select"
              className="h-12 w-full rounded-md border-input bg-muted/40 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BEAM_TYPES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>

        <SelectField id="beam.load_type" label="Load type">
          <Select
            value={loadType}
            onValueChange={(value) => setLoadType(value as LoadType)}
          >
            <SelectTrigger
              id="beam.load_type"
              data-ocid="beam.load_type.select"
              className="h-12 w-full rounded-md border-input bg-muted/40 text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOAD_TYPES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>
      </div>

      <SelectField id="beam.material" label="Material">
        <Select value={materialName} onValueChange={handleMaterialChange}>
          <SelectTrigger
            id="beam.material"
            data-ocid="beam.material.select"
            className="h-12 w-full rounded-md border-input bg-muted/40 text-base"
          >
            <SelectValue placeholder="Select a material" />
          </SelectTrigger>
          <SelectContent>
            {(materials ?? []).map((material) => (
              <SelectItem key={material.name} value={material.name}>
                {material.name} — {material.grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          id="beam.length"
          label="Beam length"
          value={length}
          onChange={setLength}
          unit={units.length}
        />
        <NumberField
          id="beam.load"
          label={loadType === "point" ? "Point load" : "Total load"}
          value={load}
          onChange={setLoad}
          unit={units.load}
        />
        <NumberField
          id="beam.width"
          label="Section width"
          value={width}
          onChange={setWidth}
          unit={units.length}
        />
        <NumberField
          id="beam.height"
          label="Section height"
          value={height}
          onChange={setHeight}
          unit={units.length}
        />
      </div>

      <NumberField
        id="beam.modulus"
        label="Modulus of elasticity"
        value={modulus}
        onChange={setModulus}
        unit={units.modulus}
      />
    </CalculatorShell>
  );
}
