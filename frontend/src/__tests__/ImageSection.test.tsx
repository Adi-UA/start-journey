import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import ImageSection from "../ImageSection";

const renderWithChakra = (ui: ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe("ImageSection", () => {
  it("shows the default image when there is no result", () => {
    renderWithChakra(<ImageSection isFetching={false} />);
    expect(screen.getByAltText(/default image/i)).toBeInTheDocument();
  });

  it("shows the generated image from base64 data", () => {
    renderWithChakra(<ImageSection isFetching={false} base64Img="AAAA" />);
    const img = screen.getByAltText(/generated image/i) as HTMLImageElement;
    expect(img.src).toContain("data:image/png;base64,AAAA");
  });
});
