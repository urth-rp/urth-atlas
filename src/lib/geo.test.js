import { describe, it, expect } from "vitest";
import {
  latFromPixel,
  pixelFromLat,
  lngFromX,
  pixelFromLng,
  wrapX,
  wrapY,
} from "./geo";

const W = 11232;
const H = 7525;

describe("geo canon", () => {
  it("maps map center to 0,0", () => {
    expect(latFromPixel(H / 2, H)).toBe(0);
    expect(lngFromX(W / 2, W)).toBe(0);
  });

  it("maps edges to +-75 / +-180", () => {
    expect(latFromPixel(H, H)).toBe(75);
    expect(latFromPixel(0, H)).toBe(-75);
    expect(lngFromX(W, W)).toBe(180);
    expect(lngFromX(0, W)).toBe(-180);
  });

  it("round-trips lat/lng through pixels", () => {
    for (const lat of [-75, -54, 0, 23.5, 75]) {
      expect(latFromPixel(pixelFromLat(lat, H), H)).toBeCloseTo(lat, 9);
    }
    for (const lng of [-180, -90, 0, 148, 180]) {
      expect(lngFromX(pixelFromLng(lng, W), W)).toBeCloseTo(lng, 9);
    }
  });

  it("wraps horizontally, clamps vertically by modulo", () => {
    expect(wrapX(-1, W)).toBe(W - 1);
    expect(wrapX(W + 480, W)).toBe(480);
    expect(wrapY(H + 1, H)).toBe(1);
    expect(wrapY(-5, H)).toBe(H - 5);
  });
});
