/** Original CycleWeave nine-position research worksheet (not an ancient algorithm). */
export const MATRIX_SLOTS = Object.freeze([
  { id: "observation", title: "Observation", prompt: "What is directly visible or measured?" },
  { id: "cycle", title: "Cycle", prompt: "Which repeat period or sequence is being tested?" },
  { id: "symbol", title: "Symbol", prompt: "What imagery appears, and where is it recorded?" },
  { id: "place", title: "Place", prompt: "What is the verified archaeological or physical context?" },
  { id: "relationship", title: "Relationship", prompt: "Which specific comparison is proposed?" },
  { id: "transformation", title: "Transformation", prompt: "What mathematical or spatial operation is our own invention?" },
  { id: "hypothesis", title: "Hypothesis", prompt: "State the testable explanation, clearly as a hypothesis." },
  { id: "counterevidence", title: "Counterevidence", prompt: "What contradicts it or limits the claim?" },
  { id: "test", title: "Test", prompt: "How would we attempt to falsify or reproduce this idea?" }
].map(Object.freeze));
export const MAX_NOTE_LENGTH = 1000;
export const WORKSPACE_SCHEMA = "cycleweave.workspace.v1";
const expectedIds = MATRIX_SLOTS.map(slot => slot.id);

export function blankNotes() {
  return Object.fromEntries(expectedIds.map(id => [id, ""]));
}
export function validateNotes(notes) {
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) throw new TypeError("Notes must be a keyed object");
  const keys = Object.keys(notes);
  if (keys.length !== expectedIds.length || keys.some(key => !expectedIds.includes(key))) {
    throw new TypeError("All nine canonical slots are required; unknown slots are rejected");
  }
  for (const id of expectedIds) {
    if (typeof notes[id] !== "string" || notes[id].length > MAX_NOTE_LENGTH) {
      throw new RangeError("Each note must be text of at most " + MAX_NOTE_LENGTH + " characters");
    }
  }
  return true;
}
export function replaceNote(notes, id, value) {
  validateNotes(notes);
  if (!expectedIds.includes(id)) throw new RangeError("Unknown matrix position");
  if (typeof value !== "string" || value.length > MAX_NOTE_LENGTH) throw new RangeError("Note exceeds safe length");
  return { ...notes, [id]: value };
}
function validSettings(day, customPeriod) {
  if (!Number.isSafeInteger(day) || day < 0 || day > 2920 ||
      !Number.isSafeInteger(customPeriod) || customPeriod < 1 || customPeriod > 10000) {
    throw new RangeError("Workspace day or custom period outside laboratory bounds");
  }
}
export function makeWorkspace({ day, customPeriod, notes }) {
  validSettings(day, customPeriod);
  validateNotes(notes);
  return {
    schema: WORKSPACE_SCHEMA,
    model: "Original modern CycleWeave worksheet; historical claims must be checked against their separate sources",
    day,
    customPeriod,
    notes: Object.fromEntries(expectedIds.map(id => [id, notes[id]]))
  };
}
/** Import NEVER accepts claims, citations, graph relationships, scripts or arbitrary settings. */
export function readWorkspace(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || input.schema !== WORKSPACE_SCHEMA) {
    throw new TypeError("Not a supported CycleWeave Rung 2 workspace");
  }
  const { day, customPeriod, notes } = input;
  return makeWorkspace({ day, customPeriod, notes });
}
