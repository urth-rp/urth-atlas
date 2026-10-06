import { describe, it, expect } from "vitest";
import { mergePlaces, searchPlaces, placeLatLng } from "./places";

describe("mergePlaces", () => {
  it("merges shared and local, local wins", () => {
    const out = mergePlaces(
      { A: { kind: "nation", x: 1, y: 2 } },
      { A: { kind: "city", x: 3, y: 4 }, B: { kind: "town" } }
    );
    expect(out.find((p) => p.name === "A")).toMatchObject({ kind: "city", x: 3 });
    expect(out.find((p) => p.name === "B")).toBeTruthy();
  });

  it("hides removed shared places unless re-added locally", () => {
    expect(mergePlaces({ A: { kind: "nation" } }, {}, { A: true })).toHaveLength(0);
    expect(
      mergePlaces({ A: { kind: "nation" } }, { A: { kind: "city" } }, { A: true })
    ).toHaveLength(1);
  });

  it("skips non-object entries", () => {
    expect(mergePlaces({ A: null, B: "x", C: { kind: "city" } }, {})).toHaveLength(1);
  });
});

describe("searchPlaces", () => {
  const places = [
    { name: "Nagyfelvárad", kind: "nation" },
    { name: "Nagyvarad", kind: "city" },
    { name: "Bluckingham", kind: "nation" },
  ];

  it("ranks exact above prefix above substring", () => {
    const out = searchPlaces(places, "nagyvarad", 8).map((p) => p.name);
    expect(out[0]).toBe("Nagyvarad");
  });

  it("ignores diacritics", () => {
    expect(searchPlaces(places, "nagyfelvarad", 8).map((p) => p.name)).toContain(
      "Nagyfelvárad"
    );
  });

  it("returns [] for blank queries", () => {
    expect(searchPlaces(places, "   ", 8)).toEqual([]);
  });

  it("returns capitals, cities, and towns — not just nations", () => {
    const mixed = [
      { name: "Riverton", kind: "town" },
      { name: "River City", kind: "city" },
      { name: "River Capital", kind: "capital" },
      { name: "Rivernation", kind: "nation" },
    ];
    const out = searchPlaces(mixed, "river", 8).map((p) => p.kind);
    expect(out).toContain("town");
    expect(out).toContain("city");
    expect(out).toContain("capital");
    expect(out).toContain("nation");
  });

  it("tie-breaks equal text scores by kind: nation, capital, city, town", () => {
    const mixed = [
      { name: "Azora Town", kind: "town" },
      { name: "Azora City", kind: "city" },
      { name: "Azora Capital", kind: "capital" },
      { name: "Azora Nation", kind: "nation" },
    ];
    const out = searchPlaces(mixed, "azora", 8).map((p) => p.kind);
    expect(out).toEqual(["nation", "capital", "city", "town"]);
  });
});

describe("placeLatLng", () => {
  it("converts to Leaflet [y, x] or null", () => {
    expect(placeLatLng({ x: 10, y: 20 }, { W: 1, H: 1 })).toEqual([20, 10]);
    expect(placeLatLng({ name: "unplaced" }, { W: 1, H: 1 })).toBeNull();
    expect(placeLatLng({ x: 1, y: 1 }, null)).toBeNull();
  });
});
