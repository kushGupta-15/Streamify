import { describe, expect, it } from "vitest";
import { capitialize } from "../lib/utils";
import { LANGUAGES, LANGUAGE_TO_FLAG } from "../constants";

describe("Frontend Utilities & Constants", () => {
  it("should capitalize words properly", () => {
    expect(capitialize("spanish")).toBe("Spanish");
    expect(capitialize("ENGLISH")).toBe("English");
    expect(capitialize("")).toBe("");
  });

  it("should maintain valid language flags mapping", () => {
    expect(LANGUAGE_TO_FLAG["english"]).toBe("gb");
    expect(LANGUAGE_TO_FLAG["spanish"]).toBe("es");
    expect(LANGUAGE_TO_FLAG["japanese"]).toBe("jp");
  });

  it("should have comprehensive supported language list", () => {
    expect(LANGUAGES).toContain("English");
    expect(LANGUAGES).toContain("Spanish");
    expect(LANGUAGES).toContain("Mandarin");
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(10);
  });
});
