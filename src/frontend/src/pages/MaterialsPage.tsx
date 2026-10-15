import { MaterialCategory } from "@/backend";
import { Disclaimer } from "@/components/Disclaimer";
import {
  MaterialTable,
  MaterialTableSkeleton,
} from "@/components/MaterialTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMaterials } from "@/hooks/useQueries";
import { formatNumber } from "@/lib/format";
import { useUnitSystem } from "@/lib/units";
import {
  MATERIAL_CATEGORY_LABELS,
  type Material,
  type UnitSystem,
} from "@/types";
import { Link } from "@tanstack/react-router";
import { Calculator, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type PropertyKey =
  | "yieldStrength"
  | "modulusOfElasticity"
  | "density"
  | "thermalConductivity"
  | "thermalExpansion";

type PropertySpec = {
  key: PropertyKey;
  label: string;
  /** Convert the SI value into the imperial display value. */
  toImperial: (value: number) => number;
  imperialUnit: string;
};

/**
 * Material properties are stored in SI. Each spec converts to the imperial
 * display value and names the imperial unit shown when the toggle is set to IM.
 */
const PROPERTY_SPECS: PropertySpec[] = [
  {
    key: "yieldStrength",
    label: "Yield strength",
    toImperial: (v) => v / 6.894757,
    imperialUnit: "ksi",
  },
  {
    key: "modulusOfElasticity",
    label: "Modulus of elasticity",
    toImperial: (v) => v / 6.894757,
    imperialUnit: "ksi",
  },
  {
    key: "density",
    label: "Density",
    toImperial: (v) => v / 27679.9,
    imperialUnit: "lb/in^3",
  },
  {
    key: "thermalConductivity",
    label: "Thermal conductivity",
    toImperial: (v) => v * 6.933471,
    imperialUnit: "BTU*in/(h*ft^2*F)",
  },
  {
    key: "thermalExpansion",
    label: "Thermal expansion",
    toImperial: (v) => v * 0.555556,
    imperialUnit: "1e-6/F",
  },
];

const CATEGORY_ORDER: MaterialCategory[] = [
  MaterialCategory.steel,
  MaterialCategory.aluminum,
  MaterialCategory.plastic,
];

function matchesQuery(material: Material, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    material.name.toLowerCase().includes(q) ||
    material.grade.toLowerCase().includes(q)
  );
}

export function MaterialsPage() {
  const { data: materials, isLoading, isError, refetch } = useMaterials();
  const { unitSystem } = useUnitSystem();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Material | null>(null);

  const filtered = useMemo(
    () => (materials ?? []).filter((m) => matchesQuery(m, query)),
    [materials, query],
  );

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filtered.filter((m) => m.category === category),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  return (
    <section data-ocid="materials.page" className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Materials
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Material Properties
        </h1>
        <p className="text-sm text-muted-foreground">
          {materials
            ? `${materials.length} common metals and plastics with published mechanical and thermal properties.`
            : "Common metals and plastics with published mechanical and thermal properties."}
        </p>
      </header>

      <Disclaimer />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="materials.search"
          className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"
        >
          Search materials
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="materials.search"
            type="search"
            inputMode="search"
            data-ocid="materials.search_input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by material or grade…"
            className="h-12 rounded-md border-input bg-muted/40 pl-11 pr-11 text-base"
          />
          {query ? (
            <button
              type="button"
              data-ocid="materials.clear_search_button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {selected ? (
        <MaterialDetail
          material={selected}
          unitSystem={unitSystem}
          onClose={() => setSelected(null)}
        />
      ) : null}

      {isLoading ? (
        <MaterialTableSkeleton />
      ) : isError ? (
        <div
          data-ocid="materials.error_state"
          className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
        >
          <p className="text-sm text-destructive-foreground">
            Could not load the material library.
          </p>
          <Button
            type="button"
            variant="secondary"
            data-ocid="materials.retry_button"
            onClick={() => void refetch()}
            className="h-11 rounded-md"
          >
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="materials.empty_state"
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card p-8 text-center"
        >
          <Search aria-hidden="true" className="size-6 text-muted-foreground" />
          <p className="font-medium text-foreground">No materials match</p>
          <p className="text-sm text-muted-foreground">
            Try a different name or grade, or clear the search.
          </p>
          <Button
            type="button"
            variant="secondary"
            data-ocid="materials.empty_clear_button"
            onClick={() => setQuery("")}
            className="mt-1 h-11 rounded-md"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {MATERIAL_CATEGORY_LABELS[group.category]} ·{" "}
                {group.items.length}
              </h2>
              <MaterialTable
                materials={group.items}
                selectedName={selected?.name ?? null}
                onSelect={setSelected}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MaterialDetail({
  material,
  unitSystem,
  onClose,
}: {
  material: Material;
  unitSystem: UnitSystem;
  onClose: () => void;
}) {
  return (
    <article
      data-ocid="materials.detail_panel"
      className="rounded-lg border border-border border-l-2 border-l-primary bg-card p-4 shadow-subtle md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {material.name}
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            {material.grade} · {MATERIAL_CATEGORY_LABELS[material.category]}
          </p>
        </div>
        <button
          type="button"
          data-ocid="materials.detail_close_button"
          aria-label="Close material detail"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROPERTY_SPECS.map((spec) => {
          const property = material[spec.key];
          const imperial = unitSystem === "imperial";
          const value = imperial
            ? spec.toImperial(property.value)
            : property.value;
          const unit = imperial ? spec.imperialUnit : property.unit;
          return (
            <div
              key={spec.key}
              data-ocid={`materials.property.${spec.key}`}
              className="rounded-md border border-border bg-muted/40 px-3 py-2"
            >
              <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {spec.label}
              </dt>
              <dd className="readout mt-1 text-xl font-semibold text-foreground">
                {formatNumber(value)}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {unit}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <Button
        asChild
        data-ocid="materials.use_in_calculator_button"
        className="mt-4 h-12 w-full rounded-md bg-primary font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
      >
        <Link to="/calculators" search={{ material: material.name }}>
          <Calculator aria-hidden="true" className="mr-2 size-5" />
          Use in beam deflection calculator
        </Link>
      </Button>
    </article>
  );
}
