/**
 * Rung 2: a typed, source-attached relationship ledger.
 * Connections represent specifically described claims, never inferred dependencies.
 */
export const RELATION_TYPES = Object.freeze({
  material: "Documented material",
  interpretation: "Scholarly interpretation",
  report: "Reported provenance",
  analogy: "Modern analogy"
});
export const RELATION_COLORS = Object.freeze({
  material: "#83c8bb",
  interpretation: "#dfbf7b",
  report: "#cb93b4",
  analogy: "#a3a8d7"
});
export const GRAPH_NODES = Object.freeze([
  { id: "cacaxtla", title: "Cacaxtla", kind: "site", x: 105, y: 72 },
  { id: "copan", title: "Copán", kind: "site", x: 105, y: 178 },
  { id: "xultun", title: "Xultun", kind: "site", x: 105, y: 302 },
  { id: "kaminaljuyu", title: "Kaminaljuyu", kind: "site", x: 105, y: 431 },
  { id: "venus", title: "Venus imagery", kind: "motif", x: 352, y: 66 },
  { id: "scorpion", title: "Scorpion motif", kind: "motif", x: 348, y: 150 },
  { id: "skyband", title: "Skyband Bench", kind: "object", x: 365, y: 230 },
  { id: "text19", title: "Text 19", kind: "inscription", x: 352, y: 322 },
  { id: "sak", title: "Sak Tahn Waax", kind: "person", x: 596, y: 310 },
  { id: "nine-stones", title: "Nine-stone report", kind: "collection", x: 359, y: 425 },
  { id: "matrix", title: "Our 9-slot matrix", kind: "invention", x: 602, y: 438 }
].map(Object.freeze));
export const GRAPH_EDGES = Object.freeze([
  {
    id: "cacaxtla-venus", from: "cacaxtla", to: "venus", type: "material",
    claim: "The Temple of Venus pillars carry Venus-related symbolism.",
    limitation: "The precise ritual meanings remain interpretive.",
    source: "https://lugares.inah.gob.mx/en/pagina-de-elemento/1779"
  },
  {
    id: "cacaxtla-scorpion", from: "cacaxtla", to: "scorpion", type: "material",
    claim: "The northern Cacaxtla pillar depicts a scorpion-tailed figure.",
    limitation: "The animal tail is documented, but the figure's identity remains debated.",
    source: "https://lugares.inah.gob.mx/en/pagina-de-elemento/1779"
  },
  {
    id: "copan-bench", from: "copan", to: "skyband", type: "material",
    claim: "A carved bench from Copán's 8N-11 Group includes celestial imagery.",
    limitation: "This record does not establish its exact intended astronomical function.",
    source: "https://doi.org/10.1177/002182869302401803"
  },
  {
    id: "copan-scorpion", from: "copan", to: "scorpion", type: "interpretation",
    claim: "Šprajc discusses a scorpion-tailed figure on a Copán bench panel.",
    limitation: "A Venus identification is a scholarly interpretation, not a proven single deity.",
    source: "https://doi.org/10.1177/002182869302401803"
  },
  {
    id: "cacaxtla-copan", from: "cacaxtla", to: "copan", type: "interpretation",
    claim: "Šprajc explicitly compares Copán's scorpion-tailed imagery to Cacaxtla.",
    limitation: "Comparison does not prove copying, contact, or identical ritual meaning.",
    source: "https://doi.org/10.1177/002182869302401803"
  },
  {
    id: "xultun-text19", from: "xultun", to: "text19", type: "material",
    claim: "Text 19 survives as a painted mathematical inscription at Xultun.",
    limitation: "Sections of the original glyphs are damaged; modern readings reconstruct them.",
    source: "https://doi.org/10.15184/aqy.2026.10378"
  },
  {
    id: "text19-sak", from: "text19", to: "sak", type: "interpretation",
    claim: "Rossi, Stuart and Hurst decipher an attribution to Sak Tahn Waax.",
    limitation: "Attribution does not establish who physically painted the wall.",
    source: "https://doi.org/10.15184/aqy.2026.10378"
  },
  {
    id: "text19-venus", from: "text19", to: "venus", type: "interpretation",
    claim: "The scholarly reconstruction relates Text 19's 2,920-day interval to Venus-cycle arithmetic.",
    limitation: "Numerical equivalence is not a measured sky position.",
    source: "https://doi.org/10.15184/aqy.2026.10378"
  },
  {
    id: "kaminaljuyu-nine", from: "kaminaljuyu", to: "nine-stones", type: "report",
    claim: "Borhegyi published an account of nine miniature stones reportedly found together.",
    limitation: "Private-collection provenance; original excavation location and complete set were not directly verified.",
    source: "https://doi.org/10.2307/278737"
  },
  {
    id: "nine-matrix", from: "nine-stones", to: "matrix", type: "analogy",
    claim: "We choose to organize our own research in nine slots inspired by the reported group of nine objects.",
    limitation: "This is our invention, not a reconstructed pre-Columbian formula.",
    source: "https://doi.org/10.2307/278737"
  },
  {
    id: "text19-matrix", from: "text19", to: "matrix", type: "analogy",
    claim: "We use reproducible mathematical tests as part of our own pattern-analysis workflow.",
    limitation: "This design choice is modern and not attributed to Sak Tahn Waax.",
    source: "https://doi.org/10.15184/aqy.2026.10378"
  }
].map(Object.freeze));

export function validateGraph(nodes = GRAPH_NODES, edges = GRAPH_EDGES) {
  if (!Array.isArray(nodes) || !Array.isArray(edges) || !nodes.length) throw new TypeError("Graph must contain nodes and edges");
  const ids = new Set();
  for (const n of nodes) {
    if (!n || typeof n.id !== "string" || !n.id || ids.has(n.id) || typeof n.title !== "string" ||
        !Number.isFinite(n.x) || !Number.isFinite(n.y)) throw new TypeError("Invalid or duplicate node");
    ids.add(n.id);
  }
  const edgeIds = new Set();
  for (const e of edges) {
    if (!e || typeof e.id !== "string" || !e.id || edgeIds.has(e.id) ||
        !ids.has(e.from) || !ids.has(e.to) || e.from === e.to ||
        !Object.hasOwn(RELATION_TYPES, e.type) ||
        typeof e.claim !== "string" || !e.claim.trim() ||
        typeof e.limitation !== "string" || !e.limitation.trim() ||
        typeof e.source !== "string" || !/^https:\/\/[^/\s]+\/\S+/.test(e.source)) {
      throw new TypeError("Invalid, unsourced or duplicate edge");
    }
    edgeIds.add(e.id);
  }
  return true;
}
export function filterEdges(type = "all", edges = GRAPH_EDGES) {
  if (type !== "all" && !Object.hasOwn(RELATION_TYPES, type)) throw new RangeError("Unknown evidence type");
  return edges.filter(e => type === "all" || e.type === type);
}
export function connectionsFor(nodeId, edges = GRAPH_EDGES) {
  if (!GRAPH_NODES.some(n => n.id === nodeId)) throw new RangeError("Unknown node");
  return edges.filter(e => e.from === nodeId || e.to === nodeId);
}
validateGraph();
