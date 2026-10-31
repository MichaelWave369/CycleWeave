# Φ CycleWeave

**Living Cycles Laboratory · Rung 1 · v0.1.0**

CycleWeave is an open-source, dependency-free mathematical engine for periodic systems, with a browser laboratory and source-traceable inspiration from Mesoamerican history. This is original software, **not** a claim that ancient peoples built the same algorithms or technology.

## Quick start

- Open a local HTTP server in the repository, e.g. `python -m http.server 8000`, then visit `http://localhost:8000`.
- Use Node.js 22 or later and run `npm test` and `npm run check`. There are zero npm dependencies to install.
- For online access, set GitHub Settings → Pages → Build and deployment to **GitHub Actions**. The publish workflow runs when code reaches `main`.

## Rung 1 features

- Signed-day modular arithmetic, configurable cycle offsets, normalized phases, BigInt GCD and LCM, deterministic JSON snapshots, and bounded phase-zero reset scans.
- Xultun Text 19 scholarly reconstruction: 20 + 260 + 2 × 780 + 3 × 360 = **2,920** days.
- Traditional calendrical matching: 5 × 584 = 8 × 365 = **2,920** days.
- Longer idealized relation: 65 × 584 = 104 × 365 = 146 × 260 = **37,960** days.
- Mobile-friendly SVG visualizer, interactive slider, editable experimental cycle, source-labeled history cards, and local JSON export.
- Automated tests for edge cases and historical numeric reference values.

## Research boundaries

The 2026 scholarly reconstruction of Text 19 attributes the calculation to **Sak Tahn Waax**. Parts of the inscription are damaged; authorship of the physical painting is uncertain. The **tun is 360 days**, while the **Haab is 365 days**. The 1,080-day term is three tun periods, notwithstanding a wording inconsistency in the paper. These cycles are idealized counts, **not** computed ephemerides, evidence of hidden forces, or historically verified cross-site connections.

The four study cards cover Cacaxtla, Copán, Xultun and Kaminaljuyu. Their software analogies are **our inventions**. The reported nine miniature mushroom stones have uncertain original provenance and disputed function. No ancient nine-part algorithm is claimed.

## Sources

- Rossi, Stuart and Hurst (2026), *The identification and work of an eighth-century Maya mathematician*, Antiquity: https://doi.org/10.15184/aqy.2026.10378
- INAH Cacaxtla archaeological site: https://lugares.inah.gob.mx/en/pagina-de-elemento/1779
- UNESCO Copán site: https://whc.unesco.org/en/list/129/
- Borhegyi (1961), *Miniature Mushroom Stones from Guatemala*: https://www.cambridge.org/core/journals/american-antiquity/article/abs/miniature-mushroom-stones-from-guatemala/A7FB7963C34D50B829F9FBEF5ADB08C0

## Future rungs (not yet implemented)

- Typed relationship graph with links labeled as observation, scholarship, dispute, or creative analogy.
- Nine-position experimental matrix with safeguards against invented archaeology.
- Optional validated astronomical ephemerides and date-correlation sensitivity analysis.
- Verified, public-identity-based bridges to [FieldAtlas](https://github.com/MichaelWave369/FieldAtlas) and [FieldConstellation](https://github.com/MichaelWave369/FieldConstellation).
- Additional adapters for PhiMathAtelier, DomistikaXR, PhiOS, and Gen.E.Wrist.

## License and ethos

MIT. Local-first, no accounts, no analytics or tracking, and respectful attribution to Indigenous knowledge holders and scholars.
