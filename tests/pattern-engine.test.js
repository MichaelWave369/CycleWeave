import test from "node:test";
import assert from "node:assert/strict";
import { REFERENCE_CYCLES } from "../src/cycle-core.js";
import {
  PATTERN_SCHEMA, PATTERN_HORIZONS, MAX_PATTERN_SAMPLES,
  circularDistance, patternAt, tracePattern
} from "../src/pattern-engine.js";

const models = [...REFERENCE_CYCLES, { id: "experiment", periodDays: 144, offsetDays: 0 }];

test("circular phase gaps use the shorter arc across the wrap-around", () => {
  assert.ok(Math.abs(circularDistance(0.99, 0.01) - 0.02) < 1e-12);
  assert.equal(circularDistance(0.25, 0.75), 0.5);
  assert.equal(circularDistance(0, 0), 0);
  assert.throws(() => circularDistance(1, 0), RangeError);
  assert.throws(() => circularDistance(-0.01, 0.5), RangeError);
  assert.throws(() => circularDistance(NaN, 0), RangeError);
});

test("all zero-offset phase vectors coincide on day zero", () => {
  const state = patternAt(0, models);
  assert.ok(Math.abs(state.coherence - 1) < 1e-12);
  assert.equal(state.contacts.length, 15);
  assert.equal(state.totalPossiblePairs, 15);
  assert.ok(state.contacts.every(x => x.exactPhaseMatch && x.gapTurns === 0));
  assert.equal(state.vector.x, 1);
});

test("2,920 days matches some modeled cycles but not all", () => {
  const state = patternAt(2920, models, 0);
  const matching = state.contacts.map(p => [p.from, p.to].join(":"));
  assert.ok(matching.includes("uinal:haab"));
  assert.ok(matching.includes("uinal:venus"));
  assert.ok(matching.includes("haab:venus"));
  assert.ok(!matching.includes("tzolkin:venus"));
  assert.ok(state.coherence < 1);
});

test("tolerance changes contact counts without changing underlying phases", () => {
  const a = patternAt(199, models, 0);
  const b = patternAt(199, models, 0.25);
  assert.ok(b.contacts.length >= a.contacts.length);
  assert.equal(a.vector.x, b.vector.x);
  assert.equal(a.coherence, b.coherence);
  assert.equal(b.totalPossiblePairs, 15);
});

test("trace sampling is bounded, endpoints exact, and JSON export stable", () => {
  for (const horizon of PATTERN_HORIZONS) {
    const trace = tracePattern(models, { startDay: 111, windowDays: horizon, samples: 181 });
    assert.equal(trace.schema, PATTERN_SCHEMA);
    assert.equal(trace.points.length, 181);
    assert.equal(trace.points[0].day, 111);
    assert.equal(trace.points.at(-1).day, 111 + horizon);
    assert.equal(trace.current.day, 111);
    assert.ok(trace.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) &&
      p.coherence >= 0 && p.coherence <= 1 &&
      p.contactCount >= 0 && p.contactCount <= 15));
    assert.deepEqual(JSON.parse(JSON.stringify(trace)), trace);
    assert.deepEqual(tracePattern(models, { startDay: 111, windowDays: horizon, samples: 181 }), trace);
  }
});

test("changing experimental period produces different trajectories", () => {
  const short = tracePattern(models, { startDay: 13, windowDays: 584, samples: 40 });
  const changed = [...REFERENCE_CYCLES, { id: "experiment", periodDays: 145 }];
  const long = tracePattern(changed, { startDay: 13, windowDays: 584, samples: 40 });
  assert.notDeepEqual(short.points, long.points);
  assert.equal(short.points[0].day, long.points[0].day);
});

test("malformed or unsafe input fails without unbounded processing", () => {
  assert.throws(() => patternAt(2.5, models), RangeError);
  assert.throws(() => patternAt(0, models, -0.01), RangeError);
  assert.throws(() => patternAt(0, models, 0.51), RangeError);
  assert.throws(() => patternAt(0, models, NaN), RangeError);
  assert.throws(() => patternAt(0, [{ periodDays: 20 }]), RangeError);
  assert.throws(() => patternAt(0, [{ id: "dup", periodDays: 20 }, { id: "dup", periodDays: 21 }]), RangeError);
  assert.throws(() => tracePattern(models, { samples: MAX_PATTERN_SAMPLES + 1 }), RangeError);
  assert.throws(() => tracePattern(models, { samples: 1 }), RangeError);
  assert.throws(() => tracePattern(models, { windowDays: 37961 }), RangeError);
  assert.throws(() => tracePattern(models, { startDay: Number.MAX_SAFE_INTEGER, windowDays: 260 }), RangeError);
});

test("model preserves explicit attribution boundaries", () => {
  const sample = tracePattern(models, { startDay: 0, windowDays: 260, samples: 2 });
  assert.match(sample.model, /Original phase-vector experiment/);
  assert.match(sample.model, /not archaeology/);
  assert.equal(sample.points[0].day, 0);
  assert.equal(sample.points[1].day, 260);
});
