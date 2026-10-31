/** Historical examples are attributed scholarly reconstructions, not ancient software specifications. */
export const TEXT_19 = Object.freeze({
  name: "Sak Tahn Waax — Xultun Text 19",
  evidence: "scholarly reconstruction of partly damaged inscription",
  source: "https://doi.org/10.15184/aqy.2026.10378",
  terms: Object.freeze([
    { count: 1, days: 20, label: "20-day unit" },
    { count: 1, days: 260, label: "Tzolk'in" },
    { count: 2, days: 780, label: "idealized Mars cycle" },
    { count: 3, days: 360, label: "360-day tun" }
  ]),
  expectedDays: 2920
});
export function text19TotalDays() {
  return TEXT_19.terms.reduce((sum, t) => sum + t.count * t.days, 0);
}
export const LONG_CYCLE = Object.freeze({
  days: 37960,
  venus: 65,
  haab: 104,
  tzolkin: 146,
  note: "Idealized integer counts, not planetary ephemerides."
});
export const CASE_STUDIES = Object.freeze([
  {
    id: "cacaxtla", name: "Cacaxtla", region: "Tlaxcala, Mexico",
    evidence: "Temple of Venus painted columns",
    inspiration: "A symbol can carry several separately sourced meanings",
    confidence: "Material evidence; interpretations vary",
    source: "https://lugares.inah.gob.mx/en/pagina-de-elemento/1779"
  },
  {
    id: "copan", name: "Copán", region: "Honduras",
    evidence: "Skyband Bench and other celestial iconography",
    inspiration: "Spatially organize linked nodes without equating position to proof",
    confidence: "Material evidence; software analogy invented by CycleWeave",
    source: "https://whc.unesco.org/en/list/129/"
  },
  {
    id: "xultun", name: "Xultun", region: "Petén, Guatemala",
    evidence: "Text 19 calendrical reconstruction",
    inspiration: "Composable cycles, checked numerically and attributed to a source",
    confidence: "Published scholarly reconstruction; some glyphs damaged",
    source: "https://doi.org/10.15184/aqy.2026.10378"
  },
  {
    id: "kaminaljuyu", name: "Kaminaljuyu", region: "Guatemala",
    evidence: "Reported collection of nine miniature mushroom stones",
    inspiration: "Original, optional nine-position exploration matrix",
    confidence: "Collection account with incomplete provenance; function debated",
    source: "https://www.cambridge.org/core/journals/american-antiquity/article/abs/miniature-mushroom-stones-from-guatemala/A7FB7963C34D50B829F9FBEF5ADB08C0"
  }
]);
