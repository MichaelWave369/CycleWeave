/** CycleWeave: deterministic whole-day arithmetic (a modern software design). */
function safeInt(n, label) {
  if (!Number.isSafeInteger(n)) throw new RangeError(label + " must be a safe integer");
  return n;
}
function positive(n, label) {
  safeInt(n, label);
  if (n <= 0) throw new RangeError(label + " must be greater than zero");
  return n;
}
export function mod(n, period) {
  safeInt(n, "day");
  positive(period, "period");
  return ((n % period) + period) % period;
}
export function normalizeCycle(cycle) {
  if (!cycle || typeof cycle !== "object" || Array.isArray(cycle)) throw new TypeError("Cycle must be an object");
  const periodDays = positive(cycle.periodDays, "periodDays");
  const offsetDays = safeInt(cycle.offsetDays ?? 0, "offsetDays");
  const id = cycle.id ?? "cycle";
  if (typeof id !== "string" || !id.trim() || id.length > 80) throw new TypeError("Invalid cycle identifier");
  return { id, periodDays, offsetDays };
}
export function phaseAt(day, cycle) {
  safeInt(day, "day");
  const c = normalizeCycle(cycle);
  const p = BigInt(c.periodDays);
  const positionDays = Number(((BigInt(day) - BigInt(c.offsetDays)) % p + p) % p);
  const fraction = positionDays / c.periodDays;
  return { ...c, positionDays, fraction, radians: 2 * Math.PI * fraction };
}
export function gcdDays(a, b) {
  positive(a, "a");
  positive(b, "b");
  let x = BigInt(a), y = BigInt(b);
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}
export function lcmDays(periods) {
  if (!Array.isArray(periods) || periods.length < 1 || periods.length > 1000) throw new RangeError("Provide 1 to 1000 periods");
  let current = 1n;
  for (const n of periods) {
    positive(n, "period");
    const value = BigInt(n);
    let x = current, y = value;
    while (y !== 0n) [x, y] = [y, x % y];
    current = current / x * value;
  }
  return current;
}
export function cycleSnapshot(day, cycles) {
  safeInt(day, "day");
  if (!Array.isArray(cycles) || !cycles.length) throw new RangeError("At least one cycle required");
  const phases = cycles.map(c => phaseAt(day, c));
  if (new Set(phases.map(p => p.id)).size !== phases.length) throw new RangeError("Cycle ids must be unique");
  return { schemaVersion: 1, day, jointPeriodDays: lcmDays(phases.map(p => p.periodDays)).toString(), phases };
}
/** Resets are modeled coincident phase-zero boundaries, not physical astronomical alignments. */
export function sharedResetDays(cycles, options = {}) {
  if (!Array.isArray(cycles) || !cycles.length) throw new RangeError("At least one cycle required");
  const items = cycles.map(normalizeCycle);
  const fromDay = safeInt(options.fromDay ?? 0, "fromDay");
  const toDay = safeInt(options.toDay ?? 2920, "toDay");
  const maxResults = positive(options.maxResults ?? 100, "maxResults");
  if (toDay < fromDay || BigInt(toDay) - BigInt(fromDay) > 250000n) throw new RangeError("Scan must be ascending and at most 250,000 days");
  const result = [];
  for (let day = fromDay; day <= toDay; day++) {
    if (items.every(c => phaseAt(day, c).positionDays === 0)) {
      result.push(day);
      if (result.length >= maxResults) break;
    }
  }
  return result;
}
export const REFERENCE_CYCLES = Object.freeze([
  { id: "uinal", periodDays: 20 },
  { id: "tzolkin", periodDays: 260 },
  { id: "haab", periodDays: 365 },
  { id: "venus", periodDays: 584 },
  { id: "mars", periodDays: 780 }
].map(c => Object.freeze({ ...c, offsetDays: 0 })));
