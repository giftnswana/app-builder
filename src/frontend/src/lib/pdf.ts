import { formatTimestamp } from "@/lib/format";
import type { SavedCalculation, ValueEntry } from "@/types";
import {
  Document,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { type ReactElement, createElement } from "react";

/**
 * Browser-side PDF report for the saved calculation history. The document is
 * rendered entirely in the client with @react-pdf/renderer — no server round
 * trip — and downloaded through a temporary object URL.
 *
 * This module is a `.ts` file, so the document tree is built with
 * `createElement` rather than JSX.
 */

const AMBER = "#e0a020";
const INK = "#1b1f2a";
const MUTED = "#5b6472";
const HAIRLINE = "#d7dbe2";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: AMBER,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    fontSize: 9,
    letterSpacing: 2,
    color: AMBER,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 9,
    color: MUTED,
    marginTop: 4,
  },
  entry: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  entryMeta: {
    fontSize: 8,
    color: MUTED,
  },
  columns: {
    flexDirection: "row",
    gap: 16,
  },
  column: {
    flexGrow: 1,
    flexBasis: 0,
  },
  columnLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: MUTED,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
  },
  rowName: {
    color: MUTED,
    flexShrink: 1,
  },
  rowValue: {
    fontFamily: "Courier",
    textAlign: "right",
  },
  empty: {
    fontSize: 10,
    color: MUTED,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
    paddingTop: 8,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
  },
});

function valueTable(label: string, values: ValueEntry[]): ReactElement {
  const rows =
    values.length === 0
      ? [createElement(Text, { key: "none", style: styles.rowName }, "None")]
      : values.map((entry, index) =>
          createElement(
            View,
            { key: `${label}-${index}`, style: styles.row },
            createElement(Text, { style: styles.rowName }, entry.name),
            createElement(
              Text,
              { style: styles.rowValue },
              `${entry.value}${entry.unit ? ` ${entry.unit}` : ""}`,
            ),
          ),
        );

  return createElement(
    View,
    { style: styles.column },
    createElement(Text, { style: styles.columnLabel }, label),
    ...rows,
  );
}

function historyDocument(
  results: SavedCalculation[],
): ReactElement<DocumentProps> {
  const generated = new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body: ReactElement[] =
    results.length === 0
      ? [
          createElement(
            Text,
            { key: "empty", style: styles.empty },
            "No saved calculations. Run a calculator or converter and save the result to build your history.",
          ),
        ]
      : results.map((result, index) =>
          createElement(
            View,
            { key: `entry-${index}`, style: styles.entry, wrap: false },
            createElement(
              View,
              { style: styles.entryHeader },
              createElement(
                Text,
                { style: styles.entryTitle },
                result.calculator,
              ),
              createElement(
                Text,
                { style: styles.entryMeta },
                formatTimestamp(result.createdAt),
              ),
            ),
            createElement(
              View,
              { style: styles.columns },
              valueTable("Inputs", result.inputs),
              valueTable("Outputs", result.outputs),
            ),
          ),
        );

  return createElement(
    Document,
    {
      title: "Torque — Saved Calculations",
      author: "Torque",
      subject: "Saved calculation history report",
    },
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(
        View,
        { style: styles.header },
        createElement(
          Text,
          { style: styles.brand },
          "TORQUE · ENGINEERING TOOLKIT",
        ),
        createElement(Text, { style: styles.title }, "Saved Calculations"),
        createElement(
          Text,
          { style: styles.subtitle },
          `${results.length} ${
            results.length === 1 ? "result" : "results"
          } · generated ${generated}`,
        ),
      ),
      ...body,
      createElement(
        Text,
        { style: styles.footer, fixed: true },
        "Preliminary design only — verify against official standards before use.",
      ),
    ),
  ) as ReactElement<DocumentProps>;
}

/** Render the saved history to a PDF blob in the browser. */
export async function buildHistoryPdf(
  results: SavedCalculation[],
): Promise<Blob> {
  return pdf(historyDocument(results)).toBlob();
}

/** Build the history PDF and trigger a browser download. */
export async function downloadHistoryPdf(
  results: SavedCalculation[],
): Promise<void> {
  const blob = await buildHistoryPdf(results);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `torque-history-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
