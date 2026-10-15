import "@testing-library/jest-dom/vitest";
import { UnitConverter } from "@/components/UnitConverter";
import { UnitSystemProvider } from "@/lib/units";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

/**
 * Universal unit converter. The actor seam is mocked; the conversion math runs
 * for real in the component. Covers the accepted criteria: 1 kN -> 224.81 lbf,
 * 100 C -> 212 F, live updates, swap, and inline invalid-input messaging.
 */
function renderConverter() {
  return renderWithActor(
    <UnitSystemProvider>
      <UnitConverter />
    </UnitSystemProvider>,
    {},
  );
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerTestId: string,
  optionName: RegExp | string,
) {
  await user.click(screen.getByTestId(triggerTestId));
  const listbox = await screen.findByRole("listbox");
  await user.click(within(listbox).getByRole("option", { name: optionName }));
}

describe("UnitConverter", () => {
  it("converts 1 kN to 224.81 lbf", async () => {
    const user = userEvent.setup();
    renderConverter();

    await selectOption(user, "converter.from_unit_select", /Kilonewton/i);
    await selectOption(user, "converter.to_unit_select", /Pound-force/i);

    await user.type(screen.getByTestId("converter.input"), "1");

    // 1 kN = 1000 N; 1000 / 4.4482216152605 = 224.808943 lbf.
    expect(screen.getByTestId("converter.result")).toHaveTextContent(
      "224.808943",
    );
  });

  it("converts 100 °C to 212 °F with non-linear temperature handling", async () => {
    const user = userEvent.setup();
    renderConverter();

    await selectOption(user, "converter.category_select", /Temperature/i);
    await user.type(screen.getByTestId("converter.input"), "100");

    // Temperature defaults to Celsius -> Fahrenheit.
    expect(screen.getByTestId("converter.result")).toHaveTextContent("212");
  });

  it("updates the result live as the user types", async () => {
    const user = userEvent.setup();
    renderConverter();

    const input = screen.getByTestId("converter.input");
    await user.type(input, "2");
    // Default force conversion is N -> lbf: 2 N = 0.449618 lbf.
    expect(screen.getByTestId("converter.result")).toHaveTextContent(
      "0.449618",
    );

    await user.type(input, "0");
    // 20 N = 4.496179 lbf.
    expect(screen.getByTestId("converter.result")).toHaveTextContent(
      "4.496179",
    );
  });

  it("swaps source and target units", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.type(screen.getByTestId("converter.input"), "1");
    // Default force conversion is N -> lbf.
    expect(screen.getByTestId("converter.result")).toHaveTextContent("0.2248");

    await user.click(screen.getByTestId("converter.swap_button"));

    // Now lbf -> N, so 1 lbf is about 4.4482 N.
    expect(screen.getByTestId("converter.result")).toHaveTextContent("4.4482");
  });

  it("shows an inline error for non-numeric input instead of a value", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.type(screen.getByTestId("converter.input"), "abc");

    const error = screen.getByTestId("converter.error_state");
    expect(error).toHaveTextContent(/valid number/i);
    expect(screen.getByTestId("converter.result")).toHaveTextContent("—");
  });

  it("shows no error and no value for empty input", () => {
    renderConverter();

    expect(
      screen.queryByTestId("converter.error_state"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("converter.result")).toHaveTextContent("—");
  });

  it("saves a conversion through the actor seam", async () => {
    const user = userEvent.setup();
    const saveCalculation = vi.fn().mockResolvedValue(1n);
    renderWithActor(
      <UnitSystemProvider>
        <UnitConverter />
      </UnitSystemProvider>,
      { saveCalculation },
    );

    await user.type(screen.getByTestId("converter.input"), "1");
    await user.click(screen.getByTestId("converter.save_button"));

    expect(saveCalculation).toHaveBeenCalledTimes(1);
    const [calculator, inputs, outputs] = saveCalculation.mock.calls[0];
    expect(calculator).toMatch(/converter/i);
    expect(inputs[0]).toMatchObject({ name: "Value", unit: "N" });
    expect(outputs[0]).toMatchObject({ name: "Result", unit: "lbf" });
  });
});
