// Chart/UI palette for the marketing platform. Hex values are copied from the
// brand CSS variables in app/globals.css (recon §7) so Recharts (which needs
// concrete colors for SVG fill/stroke) reads as one system with the Tailwind
// utility layer used everywhere else. Do not invent new brand colors here — the
// non-brand accents below are a small, muted categorical set for charts only.

export const BRAND = {
  gold: "#c9a54e",
  goldDark: "#b8923d",
  goldLight: "#d4b568",
  text: "#1e1812",
  textMid: "#3d3228",
  textSoft: "#a89a8c",
  textMuted: "#9a8e80",
  cream: "#f4eee7",
  cream2: "#f8f3ed",
  stone: "#ede4d9",
  line: "#d8cdc0",
} as const;

// Categorical series colors — brand gold anchors, earthy + one cool tone for
// separation. Kept muted to suit the luxury aesthetic.
export const CHART_COLORS = [
  "#c9a54e", // brand gold
  "#6b4226", // walnut (matches admin accents)
  "#7d8c6a", // sage
  "#9a8e80", // stone-taupe
  "#4f6d7a", // slate blue
  "#b8923d", // gold-dark
  "#a9705a", // clay
] as const;

// Semantic colors for status/stakes/deltas (not brand-owned, used sparingly).
export const SEMANTIC = {
  positive: "#5a8a5a",
  negative: "#a85450",
  warn: "#c99a3d",
  neutral: "#9a8e80",
  targetBand: "rgba(201, 165, 78, 0.14)", // gold @ low alpha, for target bands
  targetLine: "#b8923d",
  grid: "#e5d8ca",
} as const;
