// Shared low-memory / mobile detection. Phones get a lighter map:
// fewer world copies, smaller clouds, no satellite layer, no cylinder mode.
// (Each 11232x7525 decode is ~336MB — mobile Safari kills the tab first.)
// deviceMemory is Chromium-only (non-standard) — cast through any.
export const IS_LOW_MEM =
  typeof navigator !== "undefined" &&
  ((typeof /** @type {any} */ (navigator).deviceMemory === "number" &&
    /** @type {any} */ (navigator).deviceMemory <= 4) ||
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "") ||
    (typeof screen !== "undefined" && Math.min(screen.width, screen.height) < 500));
