import { UNIT_SYSTEM_LABELS, useUnitSystem } from "@/lib/units";
import { cn } from "@/lib/utils";
import type { UnitSystem } from "@/types";

const SYSTEMS: UnitSystem[] = ["si", "imperial"];

/**
 * Global SI / imperial toggle. Every converter and calculator surface reads
 * the active system from `useUnitSystem` and converts its displayed values.
 */
export function UnitSystemToggle({ className }: { className?: string }) {
  const { unitSystem, setUnitSystem } = useUnitSystem();

  return (
    <fieldset
      data-ocid="unit_system.toggle"
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-secondary p-0.5",
        className,
      )}
    >
      <legend className="sr-only">Unit system</legend>
      {SYSTEMS.map((system) => {
        const active = unitSystem === system;
        return (
          <button
            key={system}
            type="button"
            aria-pressed={active}
            data-ocid={`unit_system.${system}`}
            onClick={() => setUnitSystem(system)}
            className={cn(
              "min-w-11 rounded-full px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {UNIT_SYSTEM_LABELS[system]}
          </button>
        );
      })}
    </fieldset>
  );
}
