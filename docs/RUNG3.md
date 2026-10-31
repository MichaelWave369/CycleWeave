# Rung 3: Dynamic Pattern Engine

The mathematical engine is **original software inspired by ancient cyclic timekeeping**, not a reconstruction of ancient technology or astronomical ephemerides.

## Computation

- Every modeled cycle is converted to a unit vector at its current fraction of a turn.
- **Coherence** is the magnitude of the mean vector, in [0,1]. This describes modeled phase agreement, not a physical resonance or statistical likelihood.
- **Nearby phase pairs** use shortest circular distance in turns, with a selectable threshold from 0 to 0.25.
- A bounded 181-point trace samples the next 260, 584, 2,920, or 37,960 idealized days and renders either a two-dimensional phase trajectory or a coherence timeline.
- Original Rung 1 cycles remain unchanged; changing the current day or experimental period updates the pattern.
- JSON export includes the schema, parameters, periods, current measurements, and deterministic sampled geometry. No personal notes or repository graph claims are exported.

## Reproducible nine-position research workflow

Press **Record result in Matrix Test slot** to *explicitly* append a compact, labeled phase measurement to the nine-position research worksheet. It is marked `[MODERN COMPUTATIONAL EXPERIMENT, NOT HISTORICAL EVIDENCE]`. An overloaded 1,000-character Test note will refuse more captures until there is room. The sourced archaeology ledger is immutable.

## Important limits

An exact numerical cycle recurrence is **not** proof of ancient intercultural transmission, celestial conjunction, scientific validation, or hidden forces. The nine-position worksheet is CycleWeave's original research design, not a pre-Columbian algorithm. No changes are made to FieldAtlas or FieldConstellation in this rung.

## Verification

Run `npm run check && npm test` on Node.js 22+. GitHub Actions uses the same gates. Browser testing (mobile, keyboard, playback, download) should still be performed after merge and Pages deployment.
