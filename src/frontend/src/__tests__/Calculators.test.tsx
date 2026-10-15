import "@testing-library/jest-dom/vitest";
import { UnitSystemToggle } from "@/components/UnitSystemToggle";
import { BeamDeflectionCalculator } from "@/components/calculators/BeamDeflectionCalculator";
import { MaterialStressCalculator } from "@/components/calculators/MaterialStressCalculator";
import { PressureVesselCalculator } from "@/components/calculators/PressureVesselCalculator";
import { ShaftSizingCalculator } from "@/components/calculators/ShaftSizingCalculator";
import { TorqueConversionCalculator } from "@/components/calculators/TorqueConversionCalculator";
import { UnitSystemProvider } from "@/lib/units";
import type { Material } from "@/types";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithActor } from "./test-utils";

/**
 * Quick calculators. Each calculator reads the global unit system and computes
 * its result locally; the actor seam is mocked for the material library and the
 * save action. Covers the accepted criteria for beam, shaft, pressure vessel,
 * torque and stress, plus the governing-formula requirement.
 */

const STEEL: Material = {
  name: "Carbon Steel",
  grade: "AISI 1018",
  category: "steel" as Material["category"],
  yieldStrength: { value: 370, unit: "MPa" },
  modulusOfElasticity: { value: 205000, unit: "MPa" },
  density: { value: 7870, unit: "kg/m^3" },
  thermalConductivity: { value: 51.9, unit: "W/(m*K)" },
  thermalExpansion: { value: 11.7, unit: "1e-6/K" },
};

function renderCalculator(ui: React.ReactElement, materials: Material[] = []) {
  return renderWithActor(<UnitSystemProvider>{ui}</UnitSystemProvider>, {
    listMaterials: async () => structuredClone(materials),
  });
}

describe("BeamDeflectionCalculator", () => {
  it("returns a deflection for a simply supported beam with a central point load", () => {
    renderCalculator(<BeamDeflectionCalculator />);

    // Defaults: L=1000mm, P=1000N, b=50mm, h=100mm, E=200000MPa.
    // I = 50*100^3/12 = 4,166,666.7 mm^4; delta = P*L^3/(48*E*I) = 0.025 mm.
    const readout = screen.getByTestId("beam.calculator");
    expect(
      within(readout).getByText(/maximum deflection/i),
    ).toBeInTheDocument();
    expect(within(readout).getByText("0.025")).toBeInTheDocument();
  });

  it("shows the governing formula and the input values used", () => {
    renderCalculator(<BeamDeflectionCalculator />);

    const card = screen.getByTestId("beam.calculator");
    expect(card).toHaveTextContent(/P·L³/);
    expect(within(card).getByTestId("beam.length.input")).toHaveValue(1000);
    expect(within(card).getByTestId("beam.load.input")).toHaveValue(1000);
  });

  it("converts displayed inputs and outputs when the unit system switches", async () => {
    const user = userEvent.setup();
    renderWithActor(
      <UnitSystemProvider>
        <UnitSystemToggle />
        <BeamDeflectionCalculator />
      </UnitSystemProvider>,
      { listMaterials: async () => [] },
    );

    // SI default: length unit is mm.
    expect(
      screen.getByTestId("beam.length.input").parentElement,
    ).toHaveTextContent("mm");

    await user.click(screen.getByTestId("unit_system.imperial"));

    // Imperial: length unit becomes in and the deflection readout is in inches.
    expect(
      screen.getByTestId("beam.length.input").parentElement,
    ).toHaveTextContent("in");
    const card = screen.getByTestId("beam.calculator");
    expect(within(card).getByText(/maximum deflection/i)).toBeInTheDocument();
  });

  it("converts the displayed input values when the unit system switches", async () => {
    const user = userEvent.setup();
    renderWithActor(
      <UnitSystemProvider>
        <UnitSystemToggle />
        <BeamDeflectionCalculator />
      </UnitSystemProvider>,
      { listMaterials: async () => [] },
    );

    // SI defaults: L=1000 mm, P=1000 N, E=200000 MPa.
    expect(screen.getByTestId("beam.length.input")).toHaveValue(1000);
    expect(screen.getByTestId("beam.load.input")).toHaveValue(1000);
    expect(screen.getByTestId("beam.modulus.input")).toHaveValue(200000);

    await user.click(screen.getByTestId("unit_system.imperial"));

    // The numbers keep their physical meaning: 1000 mm -> 39.3700787402 in,
    // 1000 N -> 224.8089431 lbf, 200000 MPa -> 29007547.546 psi.
    expect(screen.getByTestId("beam.length.input")).toHaveValue(39.3700787402);
    expect(screen.getByTestId("beam.load.input")).toHaveValue(224.8089431);
    expect(screen.getByTestId("beam.modulus.input")).toHaveValue(29007547.546);
  });

  it("seeds the modulus field from a material carried in from the materials page", async () => {
    renderWithActor(
      <UnitSystemProvider>
        <BeamDeflectionCalculator initialMaterial="Carbon Steel" />
      </UnitSystemProvider>,
      { listMaterials: async () => structuredClone([STEEL]) },
    );

    // The carried-over material's modulus (205000 MPa) replaces the default.
    expect(await screen.findByDisplayValue("205000")).toBeInTheDocument();
    expect(screen.getByTestId("beam.modulus.input")).toHaveValue(205000);
  });

  it("seeds the modulus field from a selected material", async () => {
    const user = userEvent.setup();
    renderCalculator(<BeamDeflectionCalculator />, [STEEL]);

    await user.click(screen.getByTestId("beam.material.select"));
    const listbox = await screen.findByRole("listbox");
    await user.click(
      within(listbox).getByRole("option", { name: /Carbon Steel/i }),
    );

    expect(screen.getByTestId("beam.modulus.input")).toHaveValue(205000);
  });
});

describe("ShaftSizingCalculator", () => {
  it("returns a required diameter for a given torque and allowable shear stress", () => {
    renderCalculator(<ShaftSizingCalculator />);

    // Defaults: T=500 N·m, tau=40 MPa.
    // d = cbrt(16*500000/(pi*40)) = cbrt(63661.98) = 39.9295 mm.
    const card = screen.getByTestId("shaft.calculator");
    expect(within(card).getByText("39.9295")).toBeInTheDocument();
    expect(card).toHaveTextContent(/d = ∛/);
  });

  it("shows no result for a non-positive torque", async () => {
    const user = userEvent.setup();
    renderCalculator(<ShaftSizingCalculator />);

    const torque = screen.getByTestId("shaft.torque.input");
    await user.clear(torque);
    await user.type(torque, "0");

    const card = screen.getByTestId("shaft.calculator");
    expect(
      within(card).getByText(/enter a positive torque/i),
    ).toBeInTheDocument();
  });
});

describe("PressureVesselCalculator", () => {
  it("returns a minimum wall thickness for given pressure, diameter and stress", () => {
    renderCalculator(<PressureVesselCalculator />);

    // Defaults: P=1.5 MPa, D=500 mm, S=140 MPa.
    // t = P*D/(2*S) = 1.5*500/280 = 2.6786 mm.
    const card = screen.getByTestId("vessel.calculator");
    expect(within(card).getByText("2.6786")).toBeInTheDocument();
    expect(card).toHaveTextContent(/t = P·D/);
  });
});

describe("TorqueConversionCalculator", () => {
  it("converts a torque value between common units", () => {
    renderCalculator(<TorqueConversionCalculator />);

    // Defaults: 100 N·m -> lb·ft = 100 / 1.3558179483314 = 73.7562.
    const card = screen.getByTestId("torque.calculator");
    expect(within(card).getByText(/converted torque/i)).toBeInTheDocument();
    expect(within(card).getByText("73.7562")).toBeInTheDocument();
  });

  it("swaps the from and to units", async () => {
    const user = userEvent.setup();
    renderCalculator(<TorqueConversionCalculator />);

    await user.click(screen.getByTestId("torque.swap_button"));

    // Now 100 lb·ft -> N·m = 100 * 1.3558179483314 = 135.5818.
    const card = screen.getByTestId("torque.calculator");
    expect(within(card).getByText("135.5818")).toBeInTheDocument();
  });
});

describe("MaterialStressCalculator", () => {
  it("returns stress from a given force and cross-sectional area", () => {
    renderCalculator(<MaterialStressCalculator />);

    // Defaults: F=5000 N, A=100 mm² -> sigma = 50 MPa.
    const card = screen.getByTestId("stress.calculator");
    expect(within(card).getByText("50")).toBeInTheDocument();
    expect(card).toHaveTextContent(/σ = F \/ A/);
  });

  it("shows no result for a zero area", async () => {
    const user = userEvent.setup();
    renderCalculator(<MaterialStressCalculator />);

    const area = screen.getByTestId("stress.area.input");
    await user.clear(area);
    await user.type(area, "0");

    const card = screen.getByTestId("stress.calculator");
    expect(
      within(card).getByText(/enter a force and a positive/i),
    ).toBeInTheDocument();
  });
});
