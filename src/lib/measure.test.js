import { describe, it, expect } from "vitest";
import { KM_PER_PX, KM2_PER_PX2, ACRES_PER_KM2 } from "./scale";
import { measureDistance, measurePath, measureArea } from "./measure";

const H = 7525;
// Equator in pixel space: lat 0 sits at H/2, where cos = 1 and the
// spherical hypothesis must equal the flat primary exactly.
const EQ = H / 2;

describe("measureDistance", () => {
  it("scales pixels by KM_PER_PX", () => {
    const d = measureDistance({ x: 0, y: EQ }, { x: 100, y: EQ }, H);
    expect(d.pix).toBe(100);
    expect(d.km).toBeCloseTo(100 * KM_PER_PX, 9);
  });

  it("agrees flat vs spherical on the equator", () => {
    // Pure east-west ON the equator: cos = 1 along the whole leg.
    const d = measureDistance({ x: 0, y: EQ }, { x: 100, y: EQ }, H);
    expect(d.kmCorr).toBeCloseTo(d.km, 6);
    expect(d.cosAvg).toBeLessThanOrEqual(1);
  });

  it("shrinks east-west distance toward the poles (spherical)", () => {
    const eq = measureDistance({ x: 0, y: EQ }, { x: 1000, y: EQ }, H);
    const polar = measureDistance({ x: 0, y: 7000 }, { x: 1000, y: 7000 }, H);
    expect(polar.km).toBe(eq.km); // flat primary is uniform
    expect(polar.kmCorr).toBeLessThan(eq.kmCorr);
  });
});

describe("measurePath", () => {
  it("sums legs", () => {
    const r = measurePath(
      [
        { x: 0, y: EQ },
        { x: 100, y: EQ },
        { x: 100, y: EQ + 100 },
      ],
      H
    );
    expect(r.totalPix).toBe(200);
    expect(r.totalKm).toBeCloseTo(200 * KM_PER_PX, 9);
  });
});

describe("measureArea", () => {
  it("shoelaces a 100x100 square", () => {
    const a = measureArea(
      [
        { x: 0, y: EQ - 50 },
        { x: 100, y: EQ - 50 },
        { x: 100, y: EQ + 50 },
        { x: 0, y: EQ + 50 },
      ],
      H
    );
    expect(a.areaPx).toBe(10000);
    expect(a.areaKm2).toBeCloseTo(10000 * KM2_PER_PX2, 6);
    expect(a.acres).toBeCloseTo(a.areaKm2 * ACRES_PER_KM2, 6);
  });

  it("nearly matches flat area near the equator (spherical)", () => {
    // The square spans EQ±50px (±0.66°), so mean cos < 1 by ~0.01%.
    const a = measureArea(
      [
        { x: 0, y: EQ - 50 },
        { x: 100, y: EQ - 50 },
        { x: 100, y: EQ + 50 },
        { x: 0, y: EQ + 50 },
      ],
      H
    );
    expect(Math.abs(a.areaKm2Corr - a.areaKm2) / a.areaKm2).toBeLessThan(0.001);
  });
});
