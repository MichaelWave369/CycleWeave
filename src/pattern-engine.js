/**
 * CycleWeave Rung 3: deterministic, original mathematical pattern synthesis.
 *
 * The phase distance, coherence measure, and 2D trace are software inventions.
 * They do not constitute planetary ephemerides or evidence of ancient intent.
 */
import { cycleSnapshot } from "./cycle-core.js";

export const PATTERN_SCHEMA = "cycleweave.pattern.v1";
export const PATTERN_HORIZONS = Object.freeze([260, 584, 2920, 37960]);
export const MAX_PATTERN_CYCLES = 12;
export const MAX_PATTERN_SAMPLES = 481;

function integer(value, label) {
  if (!Number.isSafeInteger(value)) throw new RangeError(label + " must be a safe integer");
  return value;
}
function cyclesAllowed(cycles) {
  if (!Array.isArray(cycles) || cycles.length < 2 || cycles.length > MAX_PATTERN_CYCLES) {
    throw new RangeError("Use between 2 and " + MAX_PATTERN_CYCLES + " model cycles");
  }
  // Enforces periods, offsets, and unique stable string IDs via the original engine.
  cycleSnapshot(0, cycles);
  return cycles;
}
function toleranceAllowed(tolerance) {
  if (typeof tolerance !== "number" || !Number.isFinite(tolerance) ||
      tolerance < 0 || tolerance > 0.25) {
    throw new RangeError("Phase tolerance must be between 0 and 0.25 turns");
  }
  return tolerance;
}

/** Shortest unit-circle phase distance in turns (0..0.5). */
export function circularDistance(a, b) {
  if (typeof a !== "number" || typeof b !== "number" ||
      !Number.isFinite(a) || !Number.isFinite(b) ||
      a < 0 || a >= 1 || b < 0 || b >= 1) {
    throw new RangeError("Fractions must be in [0, 1)");
  }
  const difference = Math.abs(a - b);
  return Math.min(difference, 1 - difference);
}

/**
 * Coherence is the magnitude of the mean unit-phase vector.
 * 1 means all modeled phases point in the same direction;
 * it is NOT a correlation coefficient or probability.
 */
export function patternAt(day, cycles, tolerance = 0.08) {
  integer(day, "day");
  cyclesAllowed(cycles);
  toleranceAllowed(tolerance);
  const snapshot = cycleSnapshot(day, cycles);
  const { phases } = snapshot;
  const x = phases.reduce((sum, phase) => sum + Math.cos(phase.radians), 0) / phases.length;
  const y = phases.reduce((sum, phase) => sum + Math.sin(phase.radians), 0) / phases.length;
  // Strictly cap floating-point roundoff at the documented [0, 1] interval.
  const coherence = Math.min(1, Math.hypot(x, y));
  const contacts = [];
  for (let i = 0; i < phases.length; i++) {
    for (let j = i + 1; j < phases.length; j++) {
      const gapTurns = circularDistance(phases[i].fraction, phases[j].fraction);
      if (gapTurns <= tolerance) {
        contacts.push({
          from: phases[i].id,
          to: phases[j].id,
          gapTurns,
          exactPhaseMatch: gapTurns === 0
        });
      }
    }
  }
  return {
    day,
    toleranceTurns: tolerance,
    vector: { x, y },
    coherence,
    contacts,
    totalPossiblePairs: phases.length * (phases.length - 1) / 2
  };
}

/** A bounded, stable trace sampled over a modeled future interval. */
export function tracePattern(cycles, options = {}) {
  cyclesAllowed(cycles);
  const startDay = integer(options.startDay ?? 0, "startDay");
  const windowDays = integer(options.windowDays ?? 2920, "windowDays");
  const samples = integer(options.samples ?? 181, "samples");
  const tolerance = toleranceAllowed(options.tolerance ?? 0.08);
  if (windowDays < 1 || windowDays > 37960) {
    throw new RangeError("Window must be 1 to 37,960 days");
  }
  if (samples < 2 || samples > MAX_PATTERN_SAMPLES) {
    throw new RangeError("Sample count must be 2 to " + MAX_PATTERN_SAMPLES);
  }
  if (BigInt(startDay) + BigInt(windowDays) > BigInt(Number.MAX_SAFE_INTEGER) ||
      BigInt(startDay) + BigInt(windowDays) < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError("End day outside safe integer range");
  }

  const points = [];
  for (let i = 0; i < samples; i++) {
    // Rounding makes sampled days exact integers, preserving the Rung 1 engine contract.
    const offset = Math.round((windowDays * i) / (samples - 1));
    const point = patternAt(startDay + offset, cycles, tolerance);
    points.push({
      day: point.day,
      x: point.vector.x,
      y: point.vector.y,
      coherence: point.coherence,
      contactCount: point.contacts.length
    });
  }
  return {
    schema: PATTERN_SCHEMA,
    model: "Original phase-vector experiment; mathematical proximity, not archaeology or physical planetary alignment",
    settings: { startDay, windowDays, samples, toleranceTurns: tolerance },
    cycles: cycleSnapshot(startDay, cycles).phases.map(p => ({
      id: p.id, periodDays: p.periodDays, offsetDays: p.offsetDays
    })),
    current: patternAt(startDay, cycles, tolerance),
    points
  };
}
