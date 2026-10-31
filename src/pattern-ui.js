/**
 * Rung 3 browser view: read-only visualization of modern phase-vector mathematics.
 * No modification of the source-backed archaeological relationship ledger.
 */
import { PATTERN_HORIZONS, tracePattern } from "./pattern-engine.js";

const $ = id => document.getElementById(id);
const SVG_NS = "http://www.w3.org/2000/svg";
let horizon = 2920;
let tolerance = 0.08;
let view = "orbit";
let getState = () => ({ day: 0, cycles: [] });

function svg(tag, attributes, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, String(value));
  }
  parent.appendChild(el);
  return el;
}
function pathFor(points, convert) {
  return points.map((p, i) => {
    const [x, y] = convert(p, i);
    return (i ? "L" : "M") + x.toFixed(3) + "," + y.toFixed(3);
  }).join(" ");
}

function drawOrbit(canvas, trace) {
  const centre = 240;
  const radius = 202;
  for (const r of [50, 100, 150, 200]) {
    svg("circle", { cx: centre, cy: centre, r, fill: "none",
      stroke: "#344a60", "stroke-width": 1 }, canvas);
  }
  svg("path", {
    d: "M40,240H440M240,40V440", stroke: "#344a60",
    fill: "none", "stroke-width": 1, "stroke-dasharray": "4 7"
  }, canvas);
  svg("path", {
    d: pathFor(trace.points, point => [
      centre + radius * point.x, centre - radius * point.y
    ]),
    fill: "none",
    stroke: "#91d9d1",
    "stroke-width": 2.5,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, canvas);
  // Dot at the first point always represents the current day.
  const first = trace.points[0];
  svg("circle", { cx: centre + radius * first.x,
    cy: centre - radius * first.y, r: 7, fill: "#eac78a",
    stroke: "#102036", "stroke-width": 2 }, canvas);
  $("pattern-plot").setAttribute("aria-label",
    "Original phase-vector trace from day " + trace.settings.startDay +
    " through day " + (trace.settings.startDay + trace.settings.windowDays) +
    ". Gold dot marks the current day.");
}

function drawCoherence(canvas, trace) {
  const left = 48, top = 34, bottom = 427, width = 385, height = bottom - top;
  for (let i = 0; i <= 4; i++) {
    const level = i / 4;
    const y = bottom - level * height;
    svg("line", { x1: left, y1: y, x2: left + width, y2: y,
      stroke: "#3c4f67", "stroke-dasharray": "3 7" }, canvas);
    const text = svg("text", {
      x: left - 8, y: y + 4, "text-anchor": "end",
      fill: "#a9bdcf", "font-size": 12
    }, canvas);
    text.textContent = String(Math.round(level * 100)) + "%";
  }
  svg("path", { d: pathFor(trace.points, (p, i) => [
    left + width * i / (trace.points.length - 1),
    bottom - p.coherence * height
  ]), stroke: "#91d9d1", "stroke-width": 2.5, fill: "none",
  "stroke-linejoin": "round" }, canvas);
  svg("circle", { cx: left,
    cy: bottom - trace.points[0].coherence * height,
    r: 6, stroke: "#102036", "stroke-width": 2, fill: "#eac78a" }, canvas);
  for (const [x, label] of [[left, "Today"], [left + width, "+" + trace.settings.windowDays + " d"]]) {
    const text = svg("text", { x, y: 453, "text-anchor": x === left ? "start" : "end",
      fill: "#b8c8d7", "font-size": 12 }, canvas);
    text.textContent = label;
  }
  $("pattern-plot").setAttribute("aria-label",
    "Coherence over the next " + trace.settings.windowDays +
    " modeled days. Higher percentage means the average modeled phase vectors agree more closely.");
}

function downloadExperiment(trace) {
  const file = JSON.stringify(trace, null, 2) + "\n";
  const url = URL.createObjectURL(new Blob([file], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "cycleweave-pattern-day-" + trace.settings.startDay + ".json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("pattern-message").textContent = "Mathematical experiment exported as local JSON, without notes or historical claims.";
}

function render() {
  const state = getState();
  const trace = tracePattern(state.cycles, {
    startDay: state.day, windowDays: horizon, samples: 181, tolerance
  });
  const canvas = $("pattern-plot");
  canvas.replaceChildren();
  if (view === "orbit") drawOrbit(canvas, trace);
  else drawCoherence(canvas, trace);
  $("pattern-coherence").textContent = (trace.current.coherence * 100).toFixed(1) + "%";
  $("pattern-pairs").textContent = trace.current.contacts.length +
    " / " + trace.current.totalPossiblePairs;
  $("pattern-day").textContent = String(state.day);
  $("pattern-tolerance-value").textContent = String(Math.round(tolerance * 100)) + "% of one turn";
  const pairs = $("pattern-contact-list");
  pairs.replaceChildren();
  const contacts = trace.current.contacts;
  if (!contacts.length) {
    const empty = document.createElement("li");
    empty.textContent = "No modeled phase pairs within the chosen threshold today.";
    pairs.appendChild(empty);
  } else {
    for (const contact of contacts) {
      const li = document.createElement("li");
      li.textContent = contact.from + " + " + contact.to + ": " +
        (contact.gapTurns * 100).toFixed(2) + "% of one turn apart" +
        (contact.exactPhaseMatch ? " (exact modeled match)" : "");
      pairs.appendChild(li);
    }
  }
  return trace;
}

/** Returns a redraw hook used whenever Rung 1 changes day or experimental period. */
export function initializePatternLab({ getPatternState }) {
  if (typeof getPatternState !== "function") {
    throw new TypeError("A pattern state getter is required");
  }
  getState = getPatternState;
  for (const value of PATTERN_HORIZONS) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = value.toLocaleString() + " days";
    $("pattern-window").appendChild(option);
  }
  $("pattern-window").value = String(horizon);
  $("pattern-window").addEventListener("change", e => {
    horizon = Number(e.target.value);
    $("pattern-message").textContent = "";
    render();
  });
  $("pattern-tolerance").value = String(Math.round(tolerance * 100));
  $("pattern-tolerance").addEventListener("input", e => {
    tolerance = Number(e.target.value) / 100;
    $("pattern-message").textContent = "";
    render();
  });
  $("pattern-view").addEventListener("change", e => {
    view = e.target.value;
    $("pattern-message").textContent = "";
    render();
  });
  $("pattern-export").addEventListener("click", () => {
    downloadExperiment(render());
  });
  render();
  return render;
}
