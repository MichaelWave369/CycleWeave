import test from "node:test";
import assert from "node:assert/strict";
import {
  mod, normalizeCycle, phaseAt, gcdDays, lcmDays, cycleSnapshot,
  sharedResetDays, REFERENCE_CYCLES
} from "../src/cycle-core.js";
import { TEXT_19, text19TotalDays, LONG_CYCLE, CASE_STUDIES } from "../src/historical-presets.js";

test("Sak Tahn Waax Text 19 arithmetic", () => {
  assert.equal(text19TotalDays(), 20 + 260 + 2 * 780 + 3 * 360);
  assert.equal(text19TotalDays(), TEXT_19.expectedDays);
  assert.equal(text19TotalDays(), 5 * 584);
  assert.equal(text19TotalDays(), 8 * 365);
});

test("calendrical cycle LCMs are exact", () => {
  assert.equal(gcdDays(584, 365), 73n);
  assert.equal(lcmDays([584, 365]), 2920n);
  assert.equal(lcmDays([260, 365, 584]), 37960n);
  assert.equal(65 * 584, LONG_CYCLE.days);
  assert.equal(104 * 365, LONG_CYCLE.days);
  assert.equal(146 * 260, LONG_CYCLE.days);
});

test("phase math includes offsets and negative days", () => {
  assert.equal(mod(-1, 20), 19);
  assert.equal(phaseAt(2920, { id: "venus", periodDays: 584 }).positionDays, 0);
  assert.equal(phaseAt(2920, { id: "tzolkin", periodDays: 260 }).positionDays, 60);
  assert.equal(phaseAt(-1, { id: "a", periodDays: 20 }).positionDays, 19);
  assert.equal(phaseAt(1, { id: "a", periodDays: 20, offsetDays: 1 }).fraction, 0);
  assert.equal(phaseAt(Number.MAX_SAFE_INTEGER, { id: "a", periodDays: 2, offsetDays: -3 }).positionDays, 0);
});

test("snapshot output is deterministic and serializable", () => {
  const a = cycleSnapshot(2920, REFERENCE_CYCLES);
  const b = cycleSnapshot(2920, REFERENCE_CYCLES);
  assert.deepEqual(a, b);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), a);
  assert.equal(a.jointPeriodDays, lcmDays([20, 260, 365, 584, 780]).toString());
});

test("reset search is bounded and handles incompatible offsets", () => {
  assert.deepEqual(sharedResetDays([{ periodDays: 584 }, { periodDays: 365 }], { toDay: 2920 }), [0, 2920]);
  assert.deepEqual(sharedResetDays([{ periodDays: 4, offsetDays: 1 }, { periodDays: 6, offsetDays: 2 }], { fromDay: -20, toDay: 20 }), []);
  assert.deepEqual(sharedResetDays([{ periodDays: 4, offsetDays: 1 }, { periodDays: 6, offsetDays: 3 }], { toDay: 40 }), [9, 21, 33]);
});

test("invalid inputs are rejected", () => {
  assert.throws(() => normalizeCycle({ periodDays: 0 }), RangeError);
  assert.throws(() => normalizeCycle({ periodDays: 2.3 }), RangeError);
  assert.throws(() => phaseAt(NaN, { periodDays: 10 }), RangeError);
  assert.throws(() => cycleSnapshot(0, [{ id: "a", periodDays: 2 }, { id: "a", periodDays: 3 }]), RangeError);
  assert.throws(() => lcmDays([]), RangeError);
  assert.throws(() => sharedResetDays([{ periodDays: 1 }], { toDay: 300000 }), RangeError);
});

test("case studies preserve sources and uncertainty", () => {
  assert.equal(CASE_STUDIES.length, 4);
  assert.ok(CASE_STUDIES.every(s => s.source.startsWith("https://") && s.confidence && s.inspiration));
  assert.match(CASE_STUDIES[3].confidence, /incomplete provenance/);
});
