import test from "node:test";
import assert from "node:assert/strict";
import {
  RELATION_TYPES, GRAPH_NODES, GRAPH_EDGES, validateGraph, filterEdges, connectionsFor
} from "../src/evidence-graph.js";
import {
  MATRIX_SLOTS, MAX_NOTE_LENGTH, WORKSPACE_SCHEMA, blankNotes, validateNotes,
  replaceNote, makeWorkspace, readWorkspace
} from "../src/pattern-matrix.js";

test("every graph edge is sourced, typed and refers to unique existing nodes", () => {
  assert.equal(validateGraph(), true);
  assert.equal(new Set(GRAPH_NODES.map(n => n.id)).size, GRAPH_NODES.length);
  assert.equal(new Set(GRAPH_EDGES.map(e => e.id)).size, GRAPH_EDGES.length);
  for (const edge of GRAPH_EDGES) {
    assert.ok(edge.source.startsWith("https://"));
    assert.ok(edge.claim.length > 20);
    assert.ok(edge.limitation.length > 20);
    assert.ok(Object.hasOwn(RELATION_TYPES, edge.type));
  }
});

test("class filtering does not silently promote analogies into documentation", () => {
  assert.equal(filterEdges("all").length, GRAPH_EDGES.length);
  assert.ok(filterEdges("material").every(e => e.type === "material"));
  assert.ok(filterEdges("interpretation").every(e => e.type === "interpretation"));
  assert.ok(filterEdges("report").every(e => e.type === "report"));
  assert.ok(filterEdges("analogy").every(e => e.type === "analogy"));
  assert.ok(filterEdges("analogy").length >= 2);
  assert.throws(() => filterEdges("proven"), RangeError);
});

test("specific Copán and Cacaxtla comparison is labelled interpretation", () => {
  const edge = GRAPH_EDGES.find(e => e.id === "cacaxtla-copan");
  assert.equal(edge.type, "interpretation");
  assert.match(edge.limitation, /does not prove/);
  assert.ok(connectionsFor("cacaxtla").some(e => e.id === edge.id));
  assert.throws(() => connectionsFor("made-up-site"), RangeError);
});

test("private-collection history never becomes an archaeological certainty", () => {
  const report = GRAPH_EDGES.find(e => e.id === "kaminaljuyu-nine");
  const analogy = GRAPH_EDGES.find(e => e.id === "nine-matrix");
  assert.equal(report.type, "report");
  assert.match(report.limitation, /not directly verified/);
  assert.equal(analogy.type, "analogy");
  assert.match(analogy.limitation, /our invention/);
});

test("graph validator rejects missing source, invented types, duplicate ids and unknown nodes", () => {
  const first = GRAPH_EDGES[0];
  assert.throws(() => validateGraph(GRAPH_NODES, [{ ...first, source: "" }]), TypeError);
  assert.throws(() => validateGraph(GRAPH_NODES, [{ ...first, type: "fact" }]), TypeError);
  assert.throws(() => validateGraph(GRAPH_NODES, [{ ...first, to: "unknown" }]), TypeError);
  assert.throws(() => validateGraph(GRAPH_NODES, [first, first]), TypeError);
  assert.throws(() => validateGraph([GRAPH_NODES[0], GRAPH_NODES[0]], []), TypeError);
});

test("nine-slot worksheet is a fixed original schema", () => {
  assert.equal(MATRIX_SLOTS.length, 9);
  assert.equal(new Set(MATRIX_SLOTS.map(s => s.id)).size, 9);
  const notes = blankNotes();
  assert.equal(validateNotes(notes), true);
  assert.deepEqual(Object.keys(notes), MATRIX_SLOTS.map(s => s.id));
});

test("note edits are immutable, bounded and safe to export", () => {
  const original = blankNotes();
  const updated = replaceNote(original, "hypothesis", "Compare the two scorpion motifs");
  assert.equal(original.hypothesis, "");
  assert.equal(updated.hypothesis, "Compare the two scorpion motifs");
  assert.throws(() => replaceNote(original, "unknown", "x"), RangeError);
  assert.throws(() => replaceNote(original, "hypothesis", "z".repeat(MAX_NOTE_LENGTH + 1)), RangeError);
  assert.throws(() => validateNotes({ ...original, injected: "fake evidence" }), TypeError);
});

test("workspace roundtrip is deterministic and only allows known fields", () => {
  const notes = replaceNote(blankNotes(), "counterevidence", "Identical symbols need not mean identical rituals.");
  const a = makeWorkspace({ day: 2920, customPeriod: 144, notes });
  const b = readWorkspace(JSON.parse(JSON.stringify(a)));
  assert.equal(a.schema, WORKSPACE_SCHEMA);
  assert.deepEqual(a, b);
  assert.equal(b.notes.counterevidence, notes.counterevidence);
  const modified = { ...a, graph: [{ id: "invented", type: "material" }] };
  assert.deepEqual(readWorkspace(modified), a);
  assert.throws(() => readWorkspace({ ...a, schema: "unknown" }), TypeError);
  assert.throws(() => readWorkspace({ ...a, day: 9000 }), RangeError);
  assert.throws(() => readWorkspace({ ...a, notes: { ...notes, test: 99 } }), RangeError);
});
