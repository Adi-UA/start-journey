import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import UserInput from "../UserInput";

const renderWithChakra = (ui: ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe("UserInput", () => {
  it("calls onGenerate with the typed prompt", async () => {
    const onGenerate = vi.fn();
    renderWithChakra(<UserInput isFetching={false} onGenerate={onGenerate} />);

    await userEvent.type(
      screen.getByPlaceholderText(/cyberpunk dragon/i),
      "a fox in a spacesuit",
    );
    await userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(onGenerate).toHaveBeenCalledWith("a fox in a spacesuit");
  });

  it("does not call onGenerate for a blank prompt", async () => {
    const onGenerate = vi.fn();
    renderWithChakra(<UserInput isFetching={false} onGenerate={onGenerate} />);

    await userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(onGenerate).not.toHaveBeenCalled();
  });
});
