import test from "node:test";
import assert from "node:assert/strict";
import { REFERENCE_CYCLES } from "../src/cycle-core.js";
import { tracePattern, formatPatternMeasurement, PATTERN_SCHEMA } from "../src/pattern-engine.js";
import { blankNotes, replaceNote, makeWorkspace } from "../src/pattern-matrix.js";
import { GRAPH_EDGES } from "../src/evidence-graph.js";

const cycles = [...REFERENCE_CYCLES, { id: "experiment", periodDays: 144, offsetDays: 0 }];

test("captured model receipt contains all the reproducibility parameters and disclaimer", () => {
  const pattern = tracePattern(cycles, { startDay: 2920, windowDays: 584, samples: 181, tolerance: 0.08 });
  const receipt = formatPatternMeasurement(pattern);
  assert.equal(pattern.schema, PATTERN_SCHEMA);
  assert.match(receipt, /^\[MODERN COMPUTATIONAL EXPERIMENT, NOT HISTORICAL EVIDENCE\]/);
  assert.match(receipt, /Day 2920; window 584 d; tolerance 0.08 turns/);
  assert.match(receipt, /coherence \d+\.\d{6}/);
  assert.match(receipt, /nearby pairs \d+\/15/);
  assert.match(receipt, /venus=584d/);
  assert.match(receipt, /experiment=144d/);
  assert.ok(receipt.length < 600);
  assert.equal(formatPatternMeasurement(pattern), receipt);
});

test("receipt fits into the canonical Test note, round-trips without editing source claims", () => {
  const originalEdges = JSON.stringify(GRAPH_EDGES);
  const receipt = formatPatternMeasurement(tracePattern(cycles, { samples: 30 }));
  const notes = replaceNote(blankNotes(), "test", receipt);
  const exportRecord = makeWorkspace({ day: 0, customPeriod: 144, notes });
  assert.equal(exportRecord.notes.test, receipt);
  assert.equal(notes.hypothesis, "");
  assert.equal(JSON.stringify(GRAPH_EDGES), originalEdges);
});

test("invalid model data cannot be formatted as a historical receipt", () => {
  assert.throws(() => formatPatternMeasurement({}), TypeError);
  assert.throws(() => formatPatternMeasurement({ schema: "historical-fact", settings: {}, current: {}, cycles: [] }), TypeError);
  assert.throws(() => formatPatternMeasurement(null), TypeError);
});

test("all Rung 3 controls and modules are wired to the static HTML export", async () => {
  const { readFileSync } = await import("node:fs");
  const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
  const html = read("index.html");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  for (const id of [
    "pattern-window", "pattern-view", "pattern-tolerance", "pattern-coherence",
    "pattern-pairs", "pattern-day", "pattern-tolerance-value", "pattern-plot",
    "pattern-contact-list", "pattern-play", "pattern-rewind", "pattern-capture",
    "pattern-export", "pattern-message"
  ]) assert.ok(ids.includes(id), "Missing Rung 3 control " + id);
  assert.equal(ids.length, new Set(ids).size, "All DOM IDs must be unique");
  const app = read("app.js");
  assert.match(app, /initializePatternLab\(\{/);
  assert.match(app, /const rung2 = initializeRung2\(\{/);
  assert.match(app, /capturePattern: receipt => rung2\.appendPatternMeasurement\(receipt\)/);
  const ui = read("src/pattern-ui.js");
  assert.match(ui, /formatPatternMeasurement\(render\(\)\)/);
  assert.match(ui, /requestAnimationFrame\(frame\)/);
  assert.match(ui, /document\.hidden/);
  assert.match(read("src/rung2-ui.js"), /appendPatternMeasurement\(message\)/);
  assert.match(read(".github/workflows/pages.yml"), /cp src\/\*\.js site\/src\//);
});
