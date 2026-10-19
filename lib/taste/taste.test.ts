import assert from "node:assert/strict";
import { test } from "node:test";
import { idsOf, readTaste } from "./taste.ts";

const fd = (entries: [string, string][]) => {
  const f = new FormData();
  for (const [k, v] of entries) f.append(k, v);
  return f;
};
const gg = { id: "B8F1C0A2-1111-2222-3333-444455556666", name: "Gilmore Girls", kind: "tv_show" };
const adele = { id: "A1B2C3D4-1111-2222-3333-444455556666", name: "Adele", kind: "artist" };

test("city, diets and picks come through, duplicates dropped", () => {
  const r = readTaste(fd([["city", " Austin, TX "], ["diets", "vegetarian"], ["liked", JSON.stringify([gg, adele, gg])]]));
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.city, "Austin, TX");
    assert.deepEqual(r.value.diets, ["vegetarian"]);
    assert.deepEqual(r.value.liked.map((l) => l.name), ["Gilmore Girls", "Adele"]);
  }
});

test("a made-up diet or a broken pick is refused", () => {
  assert.equal(readTaste(fd([["diets", "keto"]])).ok, false);
  assert.equal(readTaste(fd([["liked", "not json"]])).ok, false);
  assert.equal(readTaste(fd([["liked", JSON.stringify([{ ...gg, id: "x" }])]])).ok, false);
  assert.equal(readTaste(fd([["liked", JSON.stringify([{ ...gg, kind: "podcast" }])]])).ok, false);
});

test("ids by kind, for each Qloo question", () => {
  const t = { city: "", diets: [], liked: [gg, adele] as never };
  assert.deepEqual(idsOf(t, ["artist"]), [adele.id]);
  assert.deepEqual(idsOf(t), [gg.id, adele.id]);
  assert.deepEqual(idsOf(null), []);
});
