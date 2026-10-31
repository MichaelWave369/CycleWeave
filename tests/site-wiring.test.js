import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Rung 2 controls exist exactly once in the static HTML", () => {
  const html = read("index.html");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, "DOM IDs must remain unique");
  for (const id of [
    "day-slider", "rings", "cases", "relation-filter", "evidence-graph",
    "relation-count", "relation-list", "relation-detail", "matrix-grid",
    "matrix-editor", "matrix-label", "matrix-prompt", "matrix-count",
    "matrix-export", "matrix-clear", "matrix-import", "matrix-status"
  ]) assert.ok(ids.includes(id), "Missing DOM control: " + id);
  assert.match(html, /not<\/strong> an ancient formula/i);
});

test("browser app invokes optional Rung 2 module without replacing Rung 1 core", () => {
  const app = read("app.js");
  assert.match(app, /import \{ initializeRung2 \} from "\.\/src\/rung2-ui\.js"/);
  assert.match(app, /initializeRung2\(\{/);
  assert.match(app, /renderCases\(\)/);
  assert.match(app, /cycleSnapshot\(day, cycles\(\)\)/);
});

test("Pages workflow publishes the source modules used by the static browser lab", () => {
  const workflow = read(".github/workflows/pages.yml");
  assert.match(workflow, /cp src\/\*\.js site\/src\//);
  for (const path of ["src/evidence-graph.js", "src/pattern-matrix.js", "src/rung2-ui.js"]) {
    assert.ok(read(path).length > 100, path + " must exist");
  }
});
