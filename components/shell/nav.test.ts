import assert from "node:assert/strict";
import { test } from "node:test";
import { activeHref, navFor } from "./nav.ts";

test("a mother checks in; her circle and care team don't", () => {
  assert.ok(navFor("mother").some((i) => i.href === "/check-in"));
  assert.ok(!navFor("circle").some((i) => i.href === "/check-in"));
  assert.ok(!navFor("care_team").some((i) => i.href === "/check-in"));
});

test("a check-in result highlights Check in, not Today", () => {
  assert.equal(activeHref(navFor("mother"), "/check-in/abc"), "/check-in");
  assert.equal(activeHref(navFor("mother"), "/home"), "/home");
  assert.equal(activeHref(navFor("mother"), "/homework"), null);
});

test("her circle can read the warning signs and what to do", () => {
  assert.ok(navFor("circle").some((i) => i.href === "/signs"));
});
