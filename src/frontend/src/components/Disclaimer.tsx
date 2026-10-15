import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

/**
 * Preliminary-design disclaimer. Rendered on every calculator and converter
 * surface so results are never mistaken for certified engineering output.
 */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      data-ocid="disclaimer"
      className={cn(
        "flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning",
        className,
      )}
    >
      <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>
        Preliminary design only — verify against official standards before use.
      </span>
    </p>
  );
}
