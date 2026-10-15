/**
 * Convert a Motoko nanosecond timestamp into a JavaScript Date.
 * Returns null when the value cannot be represented as a valid date.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a compact, locale-aware date + time. */
export function formatTimestamp(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown date";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a numeric value for a readout: up to `maxDecimals` significant
 * decimals, thousands separators, and no trailing zeros.
 */
export function formatNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/** Format a material property value with its unit, e.g. "250 MPa". */
export function formatProperty(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`.trim();
}
