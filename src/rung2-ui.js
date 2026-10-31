import {
  GRAPH_NODES, GRAPH_EDGES, RELATION_TYPES, RELATION_COLORS, filterEdges
} from "./evidence-graph.js";
import {
  MATRIX_SLOTS, MAX_NOTE_LENGTH, blankNotes, replaceNote, makeWorkspace, readWorkspace
} from "./pattern-matrix.js";

const $ = id => document.getElementById(id);
const SVG_NS = "http://www.w3.org/2000/svg";
const positions = new Map(GRAPH_NODES.map(node => [node.id, node]));
let graphType = "all";
let activeEdgeId = GRAPH_EDGES[0].id;
let notes = blankNotes();
let activeSlotId = "observation";

function svg(tag, props, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(props)) node.setAttribute(k, String(v));
  parent.appendChild(node);
  return node;
}
function makeText(tag, content, className = "") {
  const el = document.createElement(tag);
  el.textContent = content;
  if (className) el.className = className;
  return el;
}
function sourceLink(url) {
  const a = makeText("a", "Read cited source ↗");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}
function showStatus(message, isError = false) {
  const status = $("matrix-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}
function nodeTitle(id) {
  return positions.get(id).title;
}
function describeEdge(e) {
  return nodeTitle(e.from) + " → " + nodeTitle(e.to);
}

function renderGraph() {
  const visible = filterEdges(graphType);
  if (!visible.some(e => e.id === activeEdgeId)) activeEdgeId = visible[0]?.id ?? null;
  const graphic = $("evidence-graph");
  graphic.replaceChildren();
  for (const edge of visible) {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    svg("line", {
      x1: from.x, y1: from.y, x2: to.x, y2: to.y,
      stroke: RELATION_COLORS[edge.type],
      "stroke-width": edge.id === activeEdgeId ? 3 : 1.7,
      "stroke-dasharray": edge.type === "analogy" ? "5 6" : "none",
      "stroke-opacity": edge.id === activeEdgeId ? 1 : 0.62
    }, graphic);
  }
  for (const node of GRAPH_NODES) {
    const incident = visible.some(e => e.from === node.id || e.to === node.id);
    svg("circle", {
      cx: node.x, cy: node.y, r: 9,
      fill: node.kind === "site" ? "#5c99a7" : node.kind === "invention" ? "#9381bd" : "#c6ad77",
      stroke: "#101b2f", "stroke-width": 2,
      opacity: incident ? 1 : 0.22
    }, graphic);
    const text = svg("text", {
      x: node.x, y: node.y - 16,
      fill: "#dfeaf3", "font-size": 12, "text-anchor": "middle",
      opacity: incident ? 1 : 0.25
    }, graphic);
    text.textContent = node.title;
  }
  graphic.setAttribute("aria-label", visible.length + " documented or explicitly labeled relationships between " +
    GRAPH_NODES.length + " subject and concept nodes. " + visible.map(describeEdge).join("; "));
  $("relation-count").textContent = visible.length + " shown / " + GRAPH_EDGES.length + " total";
  const listing = $("relation-list");
  listing.replaceChildren();
  for (const edge of visible) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "relation-entry";
    button.setAttribute("aria-pressed", String(edge.id === activeEdgeId));
    button.append(
      makeText("span", describeEdge(edge), "relation-names"),
      makeText("span", RELATION_TYPES[edge.type], "relation-type"),
      makeText("small", edge.claim)
    );
    button.addEventListener("click", () => {
      activeEdgeId = edge.id;
      renderGraph();
    });
    listing.appendChild(button);
  }
  const detail = $("relation-detail");
  detail.replaceChildren();
  const edge = visible.find(e => e.id === activeEdgeId);
  if (edge) {
    detail.append(
      makeText("h4", describeEdge(edge)),
      makeText("p", RELATION_TYPES[edge.type] + ": " + edge.claim),
      makeText("p", "Limit: " + edge.limitation, "relation-limitation"),
      sourceLink(edge.source)
    );
  } else {
    detail.append(makeText("p", "No relationships in this class."));
  }
}

function renderMatrix() {
  const grid = $("matrix-grid");
  grid.replaceChildren();
  for (const [index, slot] of MATRIX_SLOTS.entries()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "matrix-slot";
    button.setAttribute("aria-pressed", String(slot.id === activeSlotId));
    button.append(
      makeText("span", String(index + 1).padStart(2, "0"), "slot-number"),
      makeText("strong", slot.title),
      makeText("small", notes[slot.id] ? notes[slot.id].slice(0, 64) : "Add your observation")
    );
    button.addEventListener("click", () => {
      activeSlotId = slot.id;
      renderMatrix();
      $("matrix-editor").focus();
    });
    grid.appendChild(button);
  }
  const current = MATRIX_SLOTS.find(s => s.id === activeSlotId);
  $("matrix-label").textContent = current.title + " · private research note";
  $("matrix-prompt").textContent = current.prompt;
  $("matrix-editor").value = notes[activeSlotId];
  $("matrix-count").textContent = notes[activeSlotId].length + "/" + MAX_NOTE_LENGTH + " characters";
}

function downloadWorkspace(day, customPeriod) {
  const workspace = makeWorkspace({ day, customPeriod, notes });
  const blob = new Blob([JSON.stringify(workspace, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cycleweave-workspace-day-" + day + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showStatus("Worksheet exported locally. No information was sent anywhere.");
}

/** Existing Rung 1 laboratory remains unchanged. Only settings from our schema may be restored. */
export function initializeRung2({ getSettings, restoreSettings }) {
  if (typeof getSettings !== "function" || typeof restoreSettings !== "function") {
    throw new TypeError("Rung 2 needs bounded setting accessors");
  }
  for (const [id, label] of Object.entries({ all: "All evidence classes", ...RELATION_TYPES })) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    $("relation-filter").appendChild(option);
  }
  $("relation-filter").addEventListener("change", e => {
    graphType = e.target.value;
    renderGraph();
  });
  $("matrix-editor").addEventListener("input", e => {
    notes = replaceNote(notes, activeSlotId, e.target.value);
    renderMatrix();
  });
  $("matrix-export").addEventListener("click", () => {
    const { day, customPeriod } = getSettings();
    downloadWorkspace(day, customPeriod);
  });
  $("matrix-import").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 30_000) throw new RangeError("Workspace is too large (30 KB maximum).");
      const loaded = readWorkspace(JSON.parse(await file.text()));
      notes = loaded.notes;
      activeSlotId = "observation";
      restoreSettings({ day: loaded.day, customPeriod: loaded.customPeriod });
      renderMatrix();
      showStatus("Workspace imported. Historical evidence and graph sources remain unchanged.");
    } catch (error) {
      showStatus("Import rejected: " + error.message, true);
    }
  });
  $("matrix-clear").addEventListener("click", () => {
    if (!window.confirm("Clear all nine unsaved research notes? This does not change the evidence graph.")) return;
    notes = blankNotes();
    activeSlotId = "observation";
    renderMatrix();
    showStatus("The nine research notes have been cleared.");
  });
  renderGraph();
  renderMatrix();
}
