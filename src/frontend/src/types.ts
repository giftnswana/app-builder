import type {
  Material as BackendMaterial,
  MaterialCategory,
  SavedCalculation,
  ValueEntry,
} from "@/backend";

export type { MaterialCategory, SavedCalculation, ValueEntry };

/** A material record as returned by the backend, with its category narrowed. */
export type Material = BackendMaterial;

/** The two unit systems the app can display values in. */
export type UnitSystem = "si" | "imperial";

/** A single named input or output captured with a saved calculation. */
export type CalculationValue = ValueEntry;

/** A saved calculation result, ready to render in the History screen. */
export type SavedResult = SavedCalculation;

/** A single material property with its value and display unit. */
export type MaterialProperty = BackendMaterial["yieldStrength"];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  steel: "Steel",
  aluminum: "Aluminum",
  plastic: "Plastic",
};
