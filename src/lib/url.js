// Deep-linkable URL state: view center, zoom, active tool, measurement points,
// layer visibility, and base layer. Everything is in image-pixel coordinates.

import { getLayer } from "./scale";

export function parseUrl() {
  const q = new URLSearchParams(window.location.search);
  const out = {};

  const at = q.get("at");
  if (at) {
    const [x, y] = at.split(",").map(Number);
    if (Number.isFinite(x) && Number.isFinite(y)) out.at = [x, y];
  }

  const z = q.get("z");
  if (z && Number.isFinite(Number(z))) out.z = Number(z);

  if (q.get("nations") === "1") out.nations = true;

  const layer = q.get("layer");
  if (layer && getLayer(layer).id === layer) out.layer = layer;

  return out;
}

export function buildQuery(state, baseSearch = "") {
  const q = new URLSearchParams(baseSearch);
  for (const k of ["at", "z", "mode", "pts", "nations", "layer"]) q.delete(k);
  if (state.at) q.set("at", `${state.at[0].toFixed(1)},${state.at[1].toFixed(1)}`);
  if (state.z != null) q.set("z", String(state.z));
  if (state.mode) q.set("mode", state.mode);
  if (state.pts?.length)
    q.set(
      "pts",
      state.pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("|")
    );
  if (state.nations) q.set("nations", "1");
  if (state.layer && state.layer !== "map") q.set("layer", state.layer);
  return q;
}

function locationParts() {
  const loc = window.location;
  return { origin: loc.origin, pathname: loc.pathname, search: loc.search };
}

export function writeUrl(state, { replace = true } = {}) {
  // Start from the live query string so unrecognized flags (e.g. ?tiles=1
  // prototype, ?maintainer=1) survive rewrites; managed keys are deleted
  // first so stale values never linger, then set from state below.
  const { origin, pathname, search } = locationParts();
  const q = buildQuery(state, search);
  const qs = q.toString();
  const url = `${pathname}${qs ? `?${qs}` : ""}`;
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  return `${origin}${url}`;
}

// Build a share link encoding a full measurement session.
export function shareLink(state) {
  return writeUrl(state, { replace: false });
}

export const EMBED_SIZES = [
  { id: "small", label: "Small", width: 400, height: 300 },
  { id: "medium", label: "Medium", width: 640, height: 480 },
  { id: "large", label: "Large", width: 800, height: 600 },
];

// Pure builder for the view-only embed URL (adds ?embed=1). Unlike
// shareLink it never touches window.history, so copying embed code won't
// trap the live tab in embed mode on reload (?embed=1 survives rewrites).
export function embedLink(state) {
  const { origin, pathname, search } = locationParts();
  const q = buildQuery(state, search);
  q.set("embed", "1");
  const qs = q.toString();
  return `${origin}${pathname}${qs ? `?${qs}` : ""}`;
}

// Full <iframe> snippet for the current view. src always carries ?embed=1
// so the framed atlas renders the bare view-only presentation.
export function embedSnippet(state, { width = 640, height = 480 } = {}) {
  const w = Math.max(200, Math.min(2000, Math.round(Number(width) || 640)));
  const h = Math.max(150, Math.min(2000, Math.round(Number(height) || 480)));
  const src = embedLink(state);
  return `<iframe src="${src}" width="${w}" height="${h}" style="border:0" loading="lazy" allowfullscreen title="Urth Atlas"></iframe>`;
}