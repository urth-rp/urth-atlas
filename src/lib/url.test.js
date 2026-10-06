import { describe, it, expect, beforeEach } from "vitest";
import { parseUrl, writeUrl, embedLink, embedSnippet } from "./url";

// url.js talks to window at call time — stub a minimal location/history.
beforeEach(() => {
  globalThis.window = /** @type {any} */ ({
    location: { search: "", pathname: "/", origin: "https://atlas.urthmaps.com" },
    history: {
      replaceState(_s, _t, url) {
        const q = url.split("?")[1] ?? "";
        globalThis.window.location.search = q ? `?${q}` : "";
      },
      pushState(_s, _t, url) {
        globalThis.window.location.search = `?${url.split("?")[1] ?? ""}`;
      },
    },
  });
});

describe("url state", () => {
  it("round-trips view + layer", () => {
    writeUrl({ at: [10234.2, 1054.7], z: 0, nations: false, layer: "map" });
    const out = parseUrl();
    expect(out.at[0]).toBeCloseTo(10234.2, 1);
    expect(out.at[1]).toBeCloseTo(1054.7, 1);
    expect(out.z).toBe(0);
  });

  it("parses nations + layer params", () => {
    globalThis.window.location.search = "?nations=1&layer=satellite";
    const out = parseUrl();
    expect(out.nations).toBe(true);
    expect(out.layer).toBe("satellite");
  });

  it("ignores unknown layers, keeps unknown flags", () => {
    globalThis.window.location.search = "?layer=nope&tiles=0";
    const out = parseUrl();
    expect(out.layer).toBeUndefined();
    writeUrl({ at: [1, 2] });
    expect(globalThis.window.location.search).toContain("tiles=0");
  });

  it("embedLink adds embed=1 without touching history", () => {
    globalThis.window.location.search = "?tiles=0";
    const link = embedLink({ at: [10234.2, 1054.7], z: 1, nations: false, layer: "map" });
    expect(link).toContain("embed=1");
    expect(link).toContain("at=10234.2");
    expect(link).toContain("tiles=0");
    // Live tab must NOT be trapped in embed mode.
    expect(globalThis.window.location.search).not.toContain("embed=1");
  });

  it("embedSnippet wraps the embed URL in an iframe", () => {
    globalThis.window.location.search = "";
    const html = embedSnippet({ at: [1, 2], z: 0, layer: "satellite" }, { width: 400, height: 300 });
    expect(html.startsWith("<iframe ")).toBe(true);
    expect(html).toContain('width="400"');
    expect(html).toContain('height="300"');
    expect(html).toContain("embed=1");
    expect(html).toContain("layer=satellite");
  });
});
