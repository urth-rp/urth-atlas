// Places utilities. Places are dynamic — sourced from the shared
// positions.json (community) merged with the user's local edits. Each
// place is `{ name, kind: "nation"|"capital"|"city"|"town", href, x, y }`
// where x/y are map pixels (CRS.Simple) and may be absent until the place
// is placed. Nations that are territories may carry an optional `territory`
// flag string, switching the pin to the subnational (Bell MT Bold Italic)
// style.

// Search tie-break order when text scores are equal: nations first, then
// settlements by tier (capital > city > town), then alphabetical.
const KIND_ORDER = { nation: 0, capital: 1, city: 2, town: 3 };

// Display label for a place's marker type. Territories are stored as kind
// "nation" with a `territory` flag but render as Territory on the map, so
// search and lists must say Territory too — same rule as the map popup.
export function kindLabel(p) {
  if (p.kind === "nation" && typeof p.territory === "string" && p.territory.trim()) {
    return "Territory";
  }
  return p.kind ?? "place";
}

// Dropdown/list dot colors mirror the map: nations brand green, capitals
// and cities amber, towns gray, territories slate (see MapView
// SETTLEMENT_STYLE and the subnational text style).
export function kindDot(p) {
  if (p.kind === "nation" && typeof p.territory === "string" && p.territory.trim()) {
    return "bg-[#475569]";
  }
  switch (p.kind) {
    case "capital":
    case "city":
      return "bg-amber-500";
    case "town":
      return "bg-[#a8a29e]";
    default:
      return "bg-[#1a6f34]";
  }
}
export function searchPlaces(places, query, limit = 8) {
  const q = normalize(query.trim());
  if (!q) return [];
  const scored = [];
  for (const p of places) {
    if (p.name == null) continue;
    const n = normalize(p.name);
    if (n === q) scored.push({ p, score: 0 });
    else if (n.startsWith(q)) scored.push({ p, score: 1 });
    else if (n.includes(q)) scored.push({ p, score: 2 });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      (KIND_ORDER[a.p.kind] ?? 4) - (KIND_ORDER[b.p.kind] ?? 4) ||
      a.p.name.localeCompare(b.p.name)
  );
  return scored.slice(0, limit).map((s) => s.p);
}

// Convert a place to a Leaflet latlng ([y, x]) using mapSize, or null if
// the place has no position yet.
export function placeLatLng(place, mapSize) {
  if (!mapSize) return null;
  if (place.x == null || place.y == null) return null;
  return [place.y, place.x];
}

// Merge shared (community) + local (edits) place maps into an array of
// place objects. Local wins on name collision. Names in `removed` (community
// removal marks, pending submit) are hidden unless re-added locally.
export function mergePlaces(shared = {}, local = {}, removed = {}) {
  const byName = new Map();
  for (const [name, v] of Object.entries(shared)) {
    if (typeof v !== "object" || v === null) continue;
    if (removed[name] && !local[name]) continue;
    byName.set(name, { name, ...v });
  }
  for (const [name, v] of Object.entries(local)) {
    if (typeof v !== "object" || v === null) continue;
    byName.set(name, { name, ...v });
  }
  return [...byName.values()];
}

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}