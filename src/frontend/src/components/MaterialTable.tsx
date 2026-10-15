import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  MATERIAL_CATEGORY_LABELS,
  type Material,
  type MaterialCategory,
} from "@/types";
import { ChevronRight } from "lucide-react";

const CATEGORY_BADGE: Record<MaterialCategory, string> = {
  steel: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  aluminum: "border-accent/40 bg-accent/10 text-accent",
  plastic: "border-chart-4/40 bg-chart-4/10 text-chart-4",
};

type MaterialTableProps = {
  materials: Material[];
  selectedName: string | null;
  onSelect: (material: Material) => void;
};

/** Dense, scannable material list. Rows are keyboard-selectable buttons. */
export function MaterialTable({
  materials,
  selectedName,
  onSelect,
}: MaterialTableProps) {
  return (
    <div
      data-ocid="materials.table"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      <Table>
        <TableHeader className="sticky top-16 z-10 bg-card">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-11 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Material
            </TableHead>
            <TableHead className="h-11 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Grade
            </TableHead>
            <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Yield
            </TableHead>
            <TableHead className="h-11 w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material, index) => {
            const selected = material.name === selectedName;
            return (
              <TableRow
                key={`${material.name}-${material.grade}`}
                data-ocid={`materials.row.${index + 1}`}
                aria-selected={selected}
                className={cn(
                  "border-border transition-smooth",
                  selected ? "bg-primary/10" : "hover:bg-muted/50",
                )}
              >
                <TableCell className="p-0">
                  <button
                    type="button"
                    data-ocid={`materials.select_button.${index + 1}`}
                    onClick={() => onSelect(material)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {material.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1 rounded px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider",
                          CATEGORY_BADGE[material.category],
                        )}
                      >
                        {MATERIAL_CATEGORY_LABELS[material.category]}
                      </Badge>
                    </span>
                  </button>
                </TableCell>
                <TableCell className="p-0">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onSelect(material)}
                    className="block w-full px-4 py-3 text-left font-mono text-sm text-muted-foreground"
                  >
                    {material.grade}
                  </button>
                </TableCell>
                <TableCell className="p-0">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onSelect(material)}
                    className="readout block w-full px-4 py-3 text-right text-sm text-foreground"
                  >
                    {material.yieldStrength.value}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {material.yieldStrength.unit}
                    </span>
                  </button>
                </TableCell>
                <TableCell className="p-0 pr-2">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onSelect(material)}
                    className="flex w-full items-center justify-end px-2 py-3 text-muted-foreground"
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Layout-matched skeleton shown while the material library loads. */
export function MaterialTableSkeleton() {
  const rows = Array.from({ length: 6 }, (_, i) => `material-skeleton-${i}`);
  return (
    <div
      data-ocid="materials.loading_state"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      <div className="flex flex-col divide-y divide-border">
        {rows.map((id) => (
          <div key={id} className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
