import "@testing-library/jest-dom/vitest";
import App from "@/App";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithActor } from "./test-utils";

/**
 * The Lumen marketing landing page was intentionally replaced by the
 * engineering toolkit shell. These tests cover the accepted shell: the default
 * route renders without a blank screen, the persistent navigation reaches all
 * four screens, and the global unit-system toggle is present on every surface.
 */
describe("engineering toolkit shell", () => {
  it("renders the default route without a blank screen", async () => {
    renderWithActor(<App />, {});

    expect(await screen.findByTestId("site.header")).toBeInTheDocument();
    expect(screen.getByTestId("site.logo_link")).toHaveTextContent("Torque");
    expect(screen.getByTestId("converter.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /unit converter/i }),
    ).toBeInTheDocument();
  });

  it("exposes persistent navigation to all four screens", () => {
    renderWithActor(<App />, {});

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByTestId("site.nav.converter")).toHaveTextContent(
      "Converter",
    );
    expect(within(nav).getByTestId("site.nav.calculators")).toHaveTextContent(
      "Calculators",
    );
    expect(within(nav).getByTestId("site.nav.materials")).toHaveTextContent(
      "Materials",
    );
    expect(within(nav).getByTestId("site.nav.history")).toHaveTextContent(
      "History",
    );
  });

  it("navigates from the converter to the calculators screen", async () => {
    const user = userEvent.setup();
    renderWithActor(<App />, {});

    await user.click(screen.getByTestId("site.nav.calculators"));

    expect(screen.getByTestId("calculators.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /engineering calculators/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the global unit-system toggle in the shell header", () => {
    renderWithActor(<App />, {});

    const toggle = screen.getByTestId("unit_system.toggle");
    expect(within(toggle).getByTestId("unit_system.si")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(toggle).getByTestId("unit_system.imperial")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches the active unit system when the toggle is used", async () => {
    const user = userEvent.setup();
    renderWithActor(<App />, {});

    await user.click(screen.getByTestId("unit_system.imperial"));

    expect(screen.getByTestId("unit_system.imperial")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("unit_system.si")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("renders the preliminary-design disclaimer on the converter surface", () => {
    renderWithActor(<App />, {});

    expect(screen.getByTestId("disclaimer")).toHaveTextContent(
      /verify against official standards/i,
    );
  });
});
