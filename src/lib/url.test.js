import { describe, it, expect, beforeEach } from "vitest";
import { parseUrl, writeUrl } from "./url";

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
});
