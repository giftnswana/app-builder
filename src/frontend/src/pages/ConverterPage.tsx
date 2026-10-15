import { Disclaimer } from "@/components/Disclaimer";
import { UnitConverter } from "@/components/UnitConverter";
import { UNIT_SYSTEM_LABELS, useUnitSystem } from "@/lib/units";

export function ConverterPage() {
  const { unitSystem } = useUnitSystem();

  return (
    <section data-ocid="converter.page" className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Converter
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Unit Converter
        </h1>
        <p className="text-sm text-muted-foreground">
          Convert force, torque, pressure, stress, length, temperature, flow
          rate and thermal conductivity. Displaying in{" "}
          <span className="font-mono font-semibold text-accent">
            {UNIT_SYSTEM_LABELS[unitSystem]}
          </span>
          .
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-4 shadow-subtle">
        <UnitConverter />
      </div>

      <Disclaimer />
    </section>
  );
}
