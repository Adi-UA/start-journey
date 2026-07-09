import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { EXAMPLE_PROMPTS } from "../constants";
import UserInput from "../UserInput";

const renderWithChakra = (ui: ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe("UserInput", () => {
  it("calls onGenerate with the typed prompt", async () => {
    const onGenerate = vi.fn();
    renderWithChakra(<UserInput isFetching={false} onGenerate={onGenerate} />);

    await userEvent.type(
      screen.getByPlaceholderText(/describe an image/i),
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

  it("fills the input when an example chip is clicked", async () => {
    const onGenerate = vi.fn();
    renderWithChakra(<UserInput isFetching={false} onGenerate={onGenerate} />);

    await userEvent.click(screen.getByText(EXAMPLE_PROMPTS[0]));

    const input = screen.getByPlaceholderText(
      /describe an image/i,
    ) as HTMLInputElement;
    expect(input.value).toBe(EXAMPLE_PROMPTS[0]);
  });
});
