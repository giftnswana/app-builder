import { Button } from "@/components/ui/button";
import { useSaveCalculation } from "@/hooks/useQueries";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ValueEntry } from "@/types";
import { Check, Loader2, Save } from "lucide-react";
import type { ReactNode } from "react";

/** A single labelled numeric input row used across every calculator. */
export function NumberField({
  id,
  label,
  value,
  onChange,
  unit,
  step = "any",
  min = "0",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <input
          id={id}
          data-ocid={`${id}.input`}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="readout h-12 min-w-0 flex-1 rounded-md border border-input bg-muted/40 px-3 text-lg text-foreground transition-smooth placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="readout flex h-12 shrink-0 items-center rounded-md border border-border bg-secondary px-3 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

/** A labelled dropdown row used for beam/load/material selection. */
export function SelectField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/** A single computed output rendered as a calibrated gauge readout. */
export function ResultReadout({
  label,
  value,
  unit,
  emphasis = false,
}: {
  label: string;
  value: string;
  unit: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "readout flex flex-wrap items-baseline gap-1.5 font-semibold",
          emphasis
            ? "text-3xl text-primary md:text-4xl"
            : "text-2xl text-foreground",
        )}
      >
        {value}
        <span
          className={cn(
            "text-sm font-medium",
            emphasis ? "text-primary/80" : "text-muted-foreground",
          )}
        >
          {unit}
        </span>
      </span>
    </div>
  );
}

/** The governing formula, shown beneath the inputs. */
export function FormulaNote({ children }: { children: ReactNode }) {
  return (
    <p className="readout rounded-md border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * Shared calculator card: title, inputs, formula, result readouts and a save
 * action that persists the run through `useSaveCalculation`.
 */
export function CalculatorShell({
  ocid,
  title,
  description,
  inputs,
  formula,
  results,
  saveInputs,
  saveOutputs,
  canSave,
  children,
}: {
  ocid: string;
  title: string;
  description: string;
  inputs?: ReactNode;
  formula: ReactNode;
  results: ReactNode;
  saveInputs: ValueEntry[];
  saveOutputs: ValueEntry[];
  canSave: boolean;
  children?: ReactNode;
}) {
  const save = useSaveCalculation();

  const handleSave = () => {
    save.mutate({
      calculator: title,
      inputs: saveInputs,
      outputs: saveOutputs,
    });
  };

  return (
    <section
      data-ocid={ocid}
      className="flex flex-col gap-4 rounded-lg border border-border border-l-2 border-l-primary bg-card p-4 shadow-subtle md:p-6"
    >
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="flex flex-col gap-4">{inputs ?? children}</div>

      <FormulaNote>{formula}</FormulaNote>

      <div className="flex flex-col gap-4 rounded-md border border-border bg-muted/30 p-4">
        {results}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          data-ocid={`${ocid}.save_button`}
          onClick={handleSave}
          disabled={!canSave || save.isPending}
          className="h-12 rounded-md px-5 font-semibold"
        >
          {save.isPending ? (
            <Loader2
              aria-hidden="true"
              className="size-4 motion-safe:animate-spin"
            />
          ) : save.isSuccess ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          {save.isPending
            ? "Saving…"
            : save.isSuccess
              ? "Saved"
              : "Save result"}
        </Button>
        {save.isError ? (
          <p
            data-ocid={`${ocid}.save_error`}
            className="text-sm text-destructive"
          >
            Could not save — check your connection and try again.
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Format a computed number for a readout, guarding non-finite results. */
export function readout(value: number, maxDecimals = 4): string {
  return formatNumber(value, maxDecimals);
}
