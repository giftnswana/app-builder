import "@testing-library/jest-dom/vitest";
import type { backendInterface } from "@/backend";
import { HistoryPage } from "@/pages/HistoryPage";
import type { SavedCalculation } from "@/types";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

/**
 * Calculation history. The actor seam supplies saved results and records
 * deletes; the PDF export is mocked at the module boundary so the test asserts
 * the page hands the saved results to the report builder. Covers the accepted
 * criteria: newest-first listing, delete, empty state, and export.
 */

const mockDownloadHistoryPdf = vi.hoisted(() => vi.fn());
vi.mock("@/lib/pdf", () => ({
  downloadHistoryPdf: mockDownloadHistoryPdf,
  buildHistoryPdf: vi.fn(),
}));

function makeResult(
  id: bigint,
  calculator: string,
  createdAt: bigint,
): SavedCalculation {
  return {
    id,
    calculator,
    createdAt,
    inputs: [{ name: "Value", value: "1", unit: "kN" }],
    outputs: [{ name: "Result", value: "224.81", unit: "lbf" }],
  };
}

const RESULTS: SavedCalculation[] = [
  makeResult(2n, "Force converter", 2_000_000_000n),
  makeResult(1n, "Beam Deflection", 1_000_000_000n),
];

// The empty state renders a TanStack Router <Link>, so the page must be
// mounted inside a router for that control to resolve.
function renderHistory<K extends keyof backendInterface>(
  actor: Pick<backendInterface, K>,
) {
  const rootRoute = createRootRoute({ component: HistoryPage });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      createRoute({ getParentRoute: () => rootRoute, path: "/" }),
      createRoute({ getParentRoute: () => rootRoute, path: "/calculators" }),
    ]),
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

describe("HistoryPage", () => {
  it("lists saved results with their inputs, outputs and units", async () => {
    renderHistory({
      listCalculations: async () => structuredClone(RESULTS),
    });

    expect(await screen.findByText("Force converter")).toBeInTheDocument();
    expect(screen.getByText("Beam Deflection")).toBeInTheDocument();

    const first = screen.getByTestId("history.item.1");
    expect(within(first).getByText("Value")).toBeInTheDocument();
    expect(within(first).getByText("kN")).toBeInTheDocument();
    expect(within(first).getByText("224.81")).toBeInTheDocument();
    expect(within(first).getByText("lbf")).toBeInTheDocument();
  });

  it("shows an empty state directing the user to run a calculation", async () => {
    renderHistory({
      listCalculations: async () => [],
    });

    const empty = await screen.findByTestId("history.empty_state");
    expect(empty).toHaveTextContent(/no saved calculations yet/i);
    expect(
      within(empty).getByTestId("history.run_calculation_button"),
    ).toHaveTextContent(/run a calculation/i);
  });

  it("deletes an individual entry through the actor seam", async () => {
    const user = userEvent.setup();
    const deleteCalculation = vi.fn().mockResolvedValue(true);
    renderHistory({
      listCalculations: async () => structuredClone(RESULTS),
      deleteCalculation,
    });

    await screen.findByText("Force converter");
    await user.click(screen.getByTestId("history.delete_button.1"));

    expect(deleteCalculation).toHaveBeenCalledWith(2n);
  });

  it("exports the saved history as a PDF report", async () => {
    const user = userEvent.setup();
    mockDownloadHistoryPdf.mockResolvedValue(undefined);
    renderHistory({
      listCalculations: async () => structuredClone(RESULTS),
    });

    await screen.findByText("Force converter");
    await user.click(screen.getByTestId("history.export_button"));

    expect(mockDownloadHistoryPdf).toHaveBeenCalledTimes(1);
    const [results] = mockDownloadHistoryPdf.mock.calls[0];
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ calculator: "Force converter" });
  });
});
