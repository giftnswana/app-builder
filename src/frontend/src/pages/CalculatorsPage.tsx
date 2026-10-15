import { Disclaimer } from "@/components/Disclaimer";
import { BeamDeflectionCalculator } from "@/components/calculators/BeamDeflectionCalculator";
import { MaterialStressCalculator } from "@/components/calculators/MaterialStressCalculator";
import { PressureVesselCalculator } from "@/components/calculators/PressureVesselCalculator";
import { ShaftSizingCalculator } from "@/components/calculators/ShaftSizingCalculator";
import { TorqueConversionCalculator } from "@/components/calculators/TorqueConversionCalculator";
import { useSearch } from "@tanstack/react-router";

/**
 * Engineering calculators screen. Each calculator reads the global unit system
 * and persists its result through the shared save action. A `material` search
 * param carries a selection over from the materials page.
 */
export function CalculatorsPage() {
  const { material } = useSearch({ from: "/calculators" });

  return (
    <section
      data-ocid="calculators.page"
      className="flex flex-col gap-6 motion-safe:animate-fade-up"
    >
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Calculators
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
          Engineering Calculators
        </h1>
        <p className="text-sm text-muted-foreground">
          Quick design checks for beams, shafts, pressure vessels, torque and
          stress. Inputs follow the active unit system.
        </p>
      </header>

      <Disclaimer />

      <div className="flex flex-col gap-6">
        <BeamDeflectionCalculator initialMaterial={material} />
        <ShaftSizingCalculator />
        <PressureVesselCalculator />
        <TorqueConversionCalculator />
        <MaterialStressCalculator />
      </div>
    </section>
  );
}
