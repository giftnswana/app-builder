import type { UnitSystem } from "@/types";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type UnitSystemContextValue = {
  /** The active unit system for every converter and calculator surface. */
  unitSystem: UnitSystem;
  /** Switch the active unit system. */
  setUnitSystem: (system: UnitSystem) => void;
  /** Toggle between SI and imperial. */
  toggleUnitSystem: () => void;
};

const UnitSystemContext = createContext<UnitSystemContextValue | null>(null);

export function UnitSystemProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("si");

  const toggleUnitSystem = useCallback(() => {
    setUnitSystem((current) => (current === "si" ? "imperial" : "si"));
  }, []);

  const value = useMemo(
    () => ({ unitSystem, setUnitSystem, toggleUnitSystem }),
    [unitSystem, toggleUnitSystem],
  );

  return (
    <UnitSystemContext.Provider value={value}>
      {children}
    </UnitSystemContext.Provider>
  );
}

export function useUnitSystem(): UnitSystemContextValue {
  const context = useContext(UnitSystemContext);
  if (!context) {
    throw new Error("useUnitSystem must be used within a UnitSystemProvider");
  }
  return context;
}

/** Human-readable label for a unit system, used in toggles and readouts. */
export const UNIT_SYSTEM_LABELS: Record<UnitSystem, string> = {
  si: "SI",
  imperial: "IM",
};
