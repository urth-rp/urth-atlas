// Shared identifiers for measurement tools + Leaflet popup actions.
// Single source of truth: a typo in a string literal fails SILENTLY (dead
// tool button, dead popup button), while an import typo fails LOUDLY at
// build time. Import these instead of retyping the strings.
//
// NOTE: result kinds ("distance" | "path" | "area" in App result objects)
// are a SEPARATE namespace from tool modes ("measure" does not exist as a
// result kind) — do not merge them.

/** Measurement tool mode: "measure" | "path" | "area" | "none". */
export const MODE_MEASURE = "measure";
export const MODE_PATH = "path";
export const MODE_AREA = "area";
export const MODE_NONE = "none";

/** @param {string} mode @returns {boolean} true for a measurement tool. */
export const isMeasTool = (mode) =>
  mode === MODE_MEASURE || mode === MODE_PATH || mode === MODE_AREA;

// Leaflet popup button actions (data-act attributes -> App.onPopupAction).
export const ACT_COPY = "copy";
export const ACT_REMOVE = "remove";
export const ACT_SAVE_HOME = "save-home";
export const ACT_CLEAR_HOME = "clear-home";
