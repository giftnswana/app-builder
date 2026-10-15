import { Disclaimer } from "@/components/Disclaimer";
import { HistoryList } from "@/components/HistoryList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalculations, useDeleteCalculation } from "@/hooks/useQueries";
import { downloadHistoryPdf } from "@/lib/pdf";
import { Link } from "@tanstack/react-router";
import { Calculator, Download, History as HistoryIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SKELETON_IDS = Array.from(
  { length: 3 },
  (_, index) => `history-skeleton-${index}`,
);

export function HistoryPage() {
  const { data: results, isLoading, isError, refetch } = useCalculations();
  const deleteCalculation = useDeleteCalculation();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const saved = results ?? [];
  const hasResults = saved.length > 0;

  const handleDelete = (id: bigint) => {
    setDeletingId(id);
    deleteCalculation.mutate(id, {
      onSuccess: () => {
        toast.success("Saved result deleted");
      },
      onError: () => {
        toast.error("Could not delete the saved result. Please try again.");
      },
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  const handleExport = async () => {
    if (!hasResults) return;
    setIsExporting(true);
    try {
      await downloadHistoryPdf(saved);
      toast.success("PDF report downloaded");
    } catch {
      toast.error("Could not generate the PDF report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section data-ocid="history.page" className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          History
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Saved Calculations
        </h1>
        <p className="text-sm text-muted-foreground">
          Every saved result with its inputs, outputs and units — newest first.
        </p>
      </header>

      <Disclaimer />

      {isLoading ? (
        <div
          data-ocid="history.loading_state"
          className="flex flex-col gap-3"
          aria-busy="true"
          aria-label="Loading saved calculations"
        >
          {SKELETON_IDS.map((id) => (
            <div
              key={id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
              <div className="mt-4 flex gap-6">
                <Skeleton className="h-16 flex-1" />
                <Skeleton className="h-16 flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="history.error_state"
          className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
        >
          <p className="text-sm text-foreground">
            We couldn&apos;t load your saved calculations.
          </p>
          <Button
            type="button"
            variant="outline"
            data-ocid="history.retry_button"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !hasResults ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center"
        >
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <HistoryIcon className="size-6" />
          </span>
          <h2 className="font-display text-lg font-semibold text-foreground">
            No saved calculations yet
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Run a calculator or converter and save the result to build your
            history here.
          </p>
          <Button asChild data-ocid="history.run_calculation_button">
            <Link to="/calculators">
              <Calculator aria-hidden="true" className="size-4" />
              Run a calculation
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {saved.length} {saved.length === 1 ? "result" : "results"}
            </p>
            <Button
              type="button"
              data-ocid="history.export_button"
              disabled={isExporting}
              onClick={() => void handleExport()}
            >
              <Download aria-hidden="true" className="size-4" />
              {isExporting ? "Generating…" : "Export PDF"}
            </Button>
          </div>

          <HistoryList
            results={saved}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </>
      )}
    </section>
  );
}
