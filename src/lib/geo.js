// Coordinate helpers for the atlas' equirectangular-style mapping.
// Leaflet CRS.Simple uses [lat = image row (down positive), lng = image col].
//
// Calibrated against the official graticule overlay (line-centroid fit within
// ~2px on all 15° parallels, tropics and polar circles): the world spans
// 75N..75S vertically with the Aequator (0°) at H/2, and the prime meridian
// (0°) at W/2 with 20° meridian spacing.
//
// NOTE on Leaflet orientation: with bounds [[0,0],[H,W]] the image's top row
// renders at latlng-lat H (screen top) and y-values everywhere in the app
// (clicks, markers, overlays) are measured UP from the bottom. So:
//   lat = (y / H) * 150 - 75   (y=H → +75 screen top, y=0 → -75 bottom)
//   lng = (x / W - 0.5) * 360   (wraps every W px)

export const LAT_TOP = 75;
export const LAT_SPAN = 150;
export const GRAT_LAT_STEP = 15;
export const GRAT_LNG_STEP = 20;

/**
 * A point in full-res map pixels (CRS.Simple space).
 * @typedef {Object} MapPoint
 * @property {number} x - east pixel, wraps every W
 * @property {number} y - north pixel, measured UP from the bottom
 */

/** @param {number} y @param {number} H @returns {number} latitude in degrees */
export function latFromPixel(y, H) {
  return (y / H) * LAT_SPAN - LAT_TOP;
}

/** @param {number} lat @param {number} H @returns {number} north pixel */
export function pixelFromLat(lat, H) {
  return ((lat + LAT_TOP) / LAT_SPAN) * H;
}

/** @param {number} x @param {number} W @returns {number} longitude in degrees */
export function lngFromX(x, W) {
  return (x / W - 0.5) * 360;
}

/** @param {number} lng @param {number} W @returns {number} east pixel */
export function pixelFromLng(lng, W) {
  return ((lng + 180) / 360) * W;
}

/** @param {number} x @param {number} W @returns {number} x wrapped into [0, W) */
export function wrapX(x, W) {
  return ((x % W) + W) % W;
}

/** @param {number} y @param {number} H @returns {number} y wrapped into [0, H) */
export function wrapY(y, H) {
  return ((y % H) + H) % H;
}

export function latLngToPixel(lat, lng, H) {
  return { x: wrapX(lng, 2 * H), y: pixelFromLat(lat, H) };
}

export function pixelToLatLng(x, y, H) {
  return { lat: latFromPixel(y, H), lng: x };
}

// Distance in km/mi for a pixel distance at an average latitude (cos correction).
export function correctedKm(dxPx, dyPx, avgLatDeg) {
  const cos = Math.cos((avgLatDeg * Math.PI) / 180);
  return Math.hypot(dxPx * cos, dyPx);
}