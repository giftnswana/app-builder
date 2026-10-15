import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SavedCalculation, ValueEntry } from "@/types";
import { Trash2 } from "lucide-react";

/** A single named input or output rendered as a label/value readout row. */
function ValueRow({ entry }: { entry: ValueEntry }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 last:border-b-0">
      <span className="min-w-0 truncate text-xs text-muted-foreground">
        {entry.name}
      </span>
      <span className="readout shrink-0 text-sm font-medium text-foreground">
        {entry.value}
        {entry.unit ? (
          <span className="ml-1 text-xs text-muted-foreground">
            {entry.unit}
          </span>
        ) : null}
      </span>
    </li>
  );
}

function ValueColumn({
  label,
  values,
}: {
  label: string;
  values: ValueEntry[];
}) {
  const rows = values.map((entry, index) => ({
    id: `${label}-${entry.name}-${entry.value}-${entry.unit}-${index}`,
    entry,
  }));
  return (
    <div className="min-w-0 flex-1">
      <h3 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h3>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">None</p>
      ) : (
        <ul>
          {rows.map(({ id, entry }) => (
            <ValueRow key={id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

export type HistoryListProps = {
  results: SavedCalculation[];
  onDelete: (id: bigint) => void;
  deletingId?: bigint | null;
  className?: string;
};

/**
 * Newest-first list of saved calculation results. Each entry shows its
 * calculator name, timestamp, inputs, outputs and units, with a delete action.
 */
export function HistoryList({
  results,
  onDelete,
  deletingId = null,
  className,
}: HistoryListProps) {
  return (
    <ul
      data-ocid="history.list"
      className={cn("flex flex-col gap-3", className)}
    >
      {results.map((result, index) => {
        const isDeleting = deletingId === result.id;
        return (
          <li
            key={result.id.toString()}
            data-ocid={`history.item.${index + 1}`}
            className="rounded-lg border border-border bg-card p-4 shadow-subtle"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-semibold tracking-tight text-foreground">
                  {result.calculator}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {formatTimestamp(result.createdAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-ocid={`history.delete_button.${index + 1}`}
                aria-label={`Delete ${result.calculator} result`}
                disabled={isDeleting}
                onClick={() => onDelete(result.id)}
                className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </div>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <ValueColumn label="Inputs" values={result.inputs} />
              <ValueColumn label="Outputs" values={result.outputs} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
