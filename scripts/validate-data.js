#!/usr/bin/env node
// Checks the integrity of js/data.js: every reference must resolve.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8"), ctx);
const A = ctx.window.ATLAS;
const errors = [];
const ids = (arr) => new Set(arr.map((d) => d.id));
const filmIds = ids(A.films), conceptIds = ids(A.concepts), valueIds = ids(A.values),
  movementIds = ids(A.movements), regionIds = ids(A.regions);

if (filmIds.size !== A.films.length) errors.push("duplicate film ids");
for (const [code, c] of Object.entries(A.countries)) if (!regionIds.has(c[1])) errors.push(`country ${code}: bad region ${c[1]}`);
for (const f of A.films) {
  if (!A.countries[f.country]) errors.push(`${f.id}: unknown country ${f.country}`);
  if (!movementIds.has(f.movement)) errors.push(`${f.id}: unknown movement ${f.movement}`);
  if (!Number.isInteger(f.year) || f.year < 1890 || f.year > 2030) errors.push(`${f.id}: bad year ${f.year}`);
  f.concepts.forEach((c) => conceptIds.has(c) || errors.push(`${f.id}: unknown concept ${c}`));
  f.values.forEach((v) => valueIds.has(v) || errors.push(`${f.id}: unknown value ${v}`));
  if (!f.concepts.length || !f.values.length) errors.push(`${f.id}: needs concepts and values`);
}
const seen = new Set();
for (const l of A.links) {
  [l.source, l.target].forEach((id) => filmIds.has(id) || errors.push(`link: unknown film ${id}`));
  if (l.source === l.target) errors.push(`link: self-loop ${l.source}`);
  const key = [l.source, l.target].sort().join("|");
  if (seen.has(key)) errors.push(`link: duplicate ${key}`);
  seen.add(key);
}
for (const j of A.journeys) j.steps.forEach((s) => filmIds.has(s) || errors.push(`journey ${j.id}: unknown film ${s}`));

const linked = new Set(A.links.flatMap((l) => [l.source, l.target]));
const orphans = A.films.filter((f) => !linked.has(f.id)).map((f) => f.id);

console.log(`${A.films.length} films · ${A.links.length} links · ${A.concepts.length} concepts · ${A.values.length} values · ${A.movements.length} movements · ${A.journeys.length} journeys`);
if (orphans.length) console.log(`films without links: ${orphans.join(", ")}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("data OK");
