import { cycleSnapshot, REFERENCE_CYCLES } from "./src/cycle-core.js";
import { CASE_STUDIES, text19TotalDays } from "./src/historical-presets.js";
import { initializeRung2 } from "./src/rung2-ui.js";
import { initializePatternLab } from "./src/pattern-ui.js";

const byId = id => document.getElementById(id);
const SVG = "http://www.w3.org/2000/svg";
const colors = ["#ddae70", "#9fb7dd", "#9dd5be", "#d6a5c6", "#df9484", "#7bd7e5"];
let day = 0;
let customPeriod = 144;
const cycles = () => [...REFERENCE_CYCLES, { id: "experiment", periodDays: customPeriod, offsetDays: 0 }];
let refreshPatternLab = () => {};

function addSvg(tag, attributes, parent) {
  const node = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  parent.appendChild(node);
  return node;
}

function renderRings(snapshot) {
  const svg = byId("rings");
  svg.replaceChildren();
  addSvg("circle", { cx: 240, cy: 240, r: 219, fill: "none", stroke: "#33435a", "stroke-dasharray": "2 10" }, svg);
  snapshot.phases.forEach((phase, i) => {
    const radius = 194 - i * 29;
    const color = colors[i];
    addSvg("circle", { cx: 240, cy: 240, r: radius, fill: "none", stroke: "#35465d", "stroke-width": 1.5 }, svg);
    const angle = phase.radians - Math.PI / 2;
    const x = 240 + radius * Math.cos(angle);
    const y = 240 + radius * Math.sin(angle);
    addSvg("line", { x1: 240, y1: 240, x2: x, y2: y, stroke: color, "stroke-opacity": 0.19 }, svg);
    addSvg("circle", { cx: x, cy: y, r: 6, fill: color, stroke: "#0c1525", "stroke-width": 2 }, svg);
    addSvg("circle", { cx: 240, cy: 240 - radius, r: 2.4, fill: color, "fill-opacity": 0.7 }, svg);
  });
  addSvg("circle", { cx: 240, cy: 240, r: 41, fill: "#173242", stroke: "#77a9a8", "stroke-width": 1.4 }, svg);
  const label = addSvg("text", { x: 240, y: 251, "text-anchor": "middle", fill: "#d1eee6", "font-size": 35, "font-family": "Georgia, serif" }, svg);
  label.textContent = "Φ";
  svg.setAttribute("aria-label", "Cycle positions on day " + day + ". " + snapshot.phases.map(p => p.id + " " + p.positionDays + " of " + p.periodDays).join(". "));
}

function render() {
  const snapshot = cycleSnapshot(day, cycles());
  byId("day-slider").value = String(day);
  byId("day-output").textContent = day.toLocaleString();
  renderRings(snapshot);
  const container = byId("phases");
  container.replaceChildren();
  snapshot.phases.forEach((phase, i) => {
    const row = document.createElement("div");
    row.className = "phase";
    const swatch = document.createElement("span");
    swatch.className = "dot";
    swatch.style.backgroundColor = colors[i];
    const title = document.createElement("span");
    title.textContent = phase.id;
    const value = document.createElement("strong");
    value.textContent = phase.positionDays + "/" + phase.periodDays;
    row.append(swatch, title, value);
    container.appendChild(row);
  });
  refreshPatternLab();
}

function applyPeriod() {
  const input = byId("custom").value.trim();
  const n = Number(input);
  if (!/^[0-9]+$/.test(input) || !Number.isSafeInteger(n) || n < 1 || n > 10000) {
    byId("error").textContent = "Enter an integer from 1 to 10,000 days.";
    byId("error").hidden = false;
    return;
  }
  byId("error").hidden = true;
  customPeriod = n;
  render();
}

function renderCases() {
  for (const item of CASE_STUDIES) {
    const card = document.createElement("article");
    card.className = "case";
    const title = document.createElement("h3");
    title.textContent = item.name;
    const place = document.createElement("small");
    place.textContent = item.region;
    const explanation = document.createElement("p");
    explanation.textContent = item.evidence + ". Original engineering idea: " + item.inspiration + ".";
    const confidence = document.createElement("p");
    confidence.textContent = "Evidence class: " + item.confidence;
    const link = document.createElement("a");
    link.href = item.source;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "See source ↗";
    card.append(title, place, explanation, confidence, link);
    byId("cases").appendChild(card);
  }
}

function exportJson() {
  const snapshot = {
    ...cycleSnapshot(day, cycles()),
    provenance: {
      source: "https://doi.org/10.15184/aqy.2026.10378",
      text19ReconstructedDays: text19TotalDays(),
      kind: "modern computational experiment; idealized integer cycles, not a planetary ephemeris"
    }
  };
  const blob = new Blob([JSON.stringify(snapshot, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cycleweave-day-" + day + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

byId("day-slider").addEventListener("input", e => { day = Number(e.target.value); render(); });
byId("reset").addEventListener("click", () => { day = 0; render(); });
byId("full").addEventListener("click", () => { day = 2920; render(); });
byId("step").addEventListener("click", () => { day = (day + 260) % 2921; render(); });
byId("apply").addEventListener("click", applyPeriod);
byId("custom").addEventListener("keydown", e => { if (e.key === "Enter") applyPeriod(); });
byId("export").addEventListener("click", exportJson);
renderCases();
render();

initializeRung2({
  getSettings: () => ({ day, customPeriod }),
  restoreSettings: settings => {
    day = settings.day;
    customPeriod = settings.customPeriod;
    byId("custom").value = String(customPeriod);
    byId("error").hidden = true;
    render();
  }
});

refreshPatternLab = initializePatternLab({
  getPatternState: () => ({ day, cycles: cycles() }),
  setPatternDay: nextDay => {
    if (!Number.isSafeInteger(nextDay) || nextDay < 0 || nextDay > 2920) throw new RangeError("Invalid playback day");
    day = nextDay;
    render();
  }
});
