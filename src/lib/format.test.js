import { describe, it, expect } from "vitest";
import { num, intNum, fmtKmMi, dms } from "./format";

// toLocaleString output varies by runtime locale — assert locale-agnostic shapes.
describe("format", () => {
  it("num fixes fraction digits", () => {
    expect(num(2.518, 3)).toMatch(/2[.,]518/);
    expect(num(1234.567, 1)).toMatch(/234[.,]6/);
  });

  it("intNum drops fractions", () => {
    expect(intNum(63412.6)).toMatch(/63\D?413/);
  });

  it("fmtKmMi joins both units", () => {
    expect(fmtKmMi(100)).toMatch(/100[.,]0 km \/ 62[.,]1 mi/);
  });

  it("dms formats hemispheres", () => {
    expect(dms(0)).toBe(`0°0'0"N`);
    expect(dms(-54.5)).toBe(`54°30'0"S`);
    expect(dms(23.25)).toBe(`23°15'0"N`);
  });
});
