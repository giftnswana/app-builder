import "@testing-library/jest-dom/vitest";
import { UnitSystemProvider } from "@/lib/units";
import { MaterialsPage } from "@/pages/MaterialsPage";
import type { Material } from "@/types";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithActor } from "./test-utils";

/**
 * Material property database. The actor seam supplies the material list; the
 * page filters and renders it locally. Covers the accepted criteria: at least
 * 50 materials, search by grade (e.g. 6061), and the detail panel.
 */

function makeMaterial(
  name: string,
  grade: string,
  category: Material["category"],
): Material {
  return {
    name,
    grade,
    category,
    yieldStrength: { value: 276, unit: "MPa" },
    modulusOfElasticity: { value: 68900, unit: "MPa" },
    density: { value: 2700, unit: "kg/m^3" },
    thermalConductivity: { value: 167, unit: "W/(m*K)" },
    thermalExpansion: { value: 23.6, unit: "1e-6/K" },
  };
}

const MATERIALS: Material[] = [
  makeMaterial("Carbon Steel", "AISI 1018", "steel" as Material["category"]),
  makeMaterial("Aluminum", "6061-T6", "aluminum" as Material["category"]),
  makeMaterial("Aluminum", "6063-T5", "aluminum" as Material["category"]),
  makeMaterial("Aluminum", "7075-T6", "aluminum" as Material["category"]),
  makeMaterial("ABS", "General Purpose", "plastic" as Material["category"]),
];

function renderMaterials(materials: Material[] = MATERIALS) {
  // The detail panel renders a TanStack Router <Link>, so the page must be
  // mounted inside a router for the "use in calculator" control to resolve.
  const rootRoute = createRootRoute({ component: MaterialsPage });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      createRoute({ getParentRoute: () => rootRoute, path: "/" }),
      createRoute({ getParentRoute: () => rootRoute, path: "/calculators" }),
    ]),
  });
  return renderWithActor(
    <UnitSystemProvider>
      <RouterProvider router={router} />
    </UnitSystemProvider>,
    { listMaterials: async () => structuredClone(materials) },
  );
}

describe("MaterialsPage", () => {
  it("renders the material list returned by the backend", async () => {
    renderMaterials();

    expect(await screen.findByText("Carbon Steel")).toBeInTheDocument();
    expect(screen.getByText("6061-T6")).toBeInTheDocument();
    expect(screen.getByText("ABS")).toBeInTheDocument();
  });

  it("filters the list by grade as the user types", async () => {
    const user = userEvent.setup();
    renderMaterials();

    await screen.findByText("Carbon Steel");
    await user.type(screen.getByTestId("materials.search_input"), "6061");

    expect(screen.getByText("6061-T6")).toBeInTheDocument();
    expect(screen.queryByText("Carbon Steel")).not.toBeInTheDocument();
    expect(screen.queryByText("7075-T6")).not.toBeInTheDocument();
  });

  it("shows an empty state when no material matches", async () => {
    const user = userEvent.setup();
    renderMaterials();

    await screen.findByText("Carbon Steel");
    await user.type(screen.getByTestId("materials.search_input"), "zzzz");

    expect(screen.getByTestId("materials.empty_state")).toBeInTheDocument();
  });

  it("shows full property detail when a material is selected", async () => {
    const user = userEvent.setup();
    renderMaterials();

    await screen.findByText("Carbon Steel");
    // The select_button index resets per category group, so target the row by
    // its visible material name instead of a non-unique test id.
    await user.click(screen.getByRole("button", { name: /Carbon Steel/ }));

    const detail = screen.getByTestId("materials.detail_panel");
    expect(within(detail).getByText("Carbon Steel")).toBeInTheDocument();
    expect(
      within(detail).getByTestId("materials.property.yieldStrength"),
    ).toHaveTextContent("MPa");
    expect(
      within(detail).getByTestId("materials.property.thermalConductivity"),
    ).toBeInTheDocument();
    expect(
      within(detail).getByTestId("materials.use_in_calculator_button"),
    ).toHaveTextContent(/beam deflection/i);
  });

  it("carries the selected material into the beam calculator link", async () => {
    const user = userEvent.setup();
    renderMaterials();

    await screen.findByText("Carbon Steel");
    await user.click(screen.getByRole("button", { name: /Carbon Steel/ }));

    // The asChild Button forwards data-ocid onto the rendered anchor itself.
    const link = screen.getByTestId("materials.use_in_calculator_button");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("material=Carbon+Steel"),
    );
  });

  it("renders at least 50 materials when the backend supplies them", async () => {
    const many: Material[] = Array.from({ length: 50 }, (_, i) =>
      makeMaterial(
        `Material ${i}`,
        `Grade ${i}`,
        "steel" as Material["category"],
      ),
    );
    renderMaterials(many);

    expect(await screen.findByText("Material 0")).toBeInTheDocument();
    expect(screen.getByText("Material 49")).toBeInTheDocument();
  });
});
