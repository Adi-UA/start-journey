import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import AdvancedControls from "../AdvancedControls";

const renderWithChakra = (ui: ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe("AdvancedControls", () => {
  it("shows the sliders and explanatory tips", () => {
    renderWithChakra(
      <AdvancedControls
        steps={25}
        guidance={8.5}
        onSteps={vi.fn()}
        onGuidance={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("steps")).toBeInTheDocument();
    expect(screen.getByLabelText("guidance")).toBeInTheDocument();
    expect(screen.getByText(/more steps add detail/i)).toBeInTheDocument();
    expect(screen.getByText(/how closely the image follows/i)).toBeInTheDocument();
  });
});
