import { describe, expect, it } from "vitest";
import { promptToFilename } from "../download";

describe("promptToFilename", () => {
  it("slugifies a prompt into a png filename", () => {
    expect(promptToFilename("A cyberpunk Dragon!")).toBe("a-cyberpunk-dragon.png");
  });

  it("trims leading/trailing separators and collapses symbols", () => {
    expect(promptToFilename("  Hello, World!!  ")).toBe("hello-world.png");
  });

  it("falls back when the prompt has no usable characters", () => {
    expect(promptToFilename("!!!")).toBe("start-journey.png");
  });

  it("caps the length", () => {
    const name = promptToFilename("word ".repeat(50));
    expect(name.length).toBeLessThanOrEqual(64);
    expect(name.endsWith(".png")).toBe(true);
  });
});
