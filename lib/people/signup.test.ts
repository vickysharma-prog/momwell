import assert from "node:assert/strict";
import { test } from "node:test";
import { roleForInvite, signUpInput } from "./signup.ts";

const ok = { role: "mother", name: " Maya ", email: "Maya@Example.com ", password: "longenough" };

test("a good sign-up is cleaned up", () => {
  const r = signUpInput.parse(ok);
  assert.equal(r.name, "Maya");
  assert.equal(r.email, "maya@example.com");
  assert.equal(r.invite, undefined);
});

test("an empty invite field means no invite", () => {
  assert.equal(signUpInput.parse({ ...ok, invite: "" }).invite, undefined);
});

test("bad input is refused with a plain message", () => {
  const cases: [object, string][] = [
    [{ ...ok, role: "admin" }, "Choose who you are"],
    [{ ...ok, name: "  " }, "Tell us your name"],
    [{ ...ok, email: "maya" }, "That email doesn't look right"],
    [{ ...ok, password: "short" }, "Use at least 8 characters"],
  ];
  for (const [input, message] of cases) {
    const r = signUpInput.safeParse(input);
    assert.equal(r.success, false);
    assert.equal(r.error!.issues[0].message, message);
  }
});

test("an invite token must be a real token", () => {
  assert.equal(signUpInput.safeParse({ ...ok, invite: "not-a-token" }).success, false);
});

test("an invite decides the role", () => {
  assert.equal(roleForInvite("mother", "circle"), "circle");
  assert.equal(roleForInvite("mother", "care_team"), "care_team");
  assert.equal(roleForInvite("care_team", "care_team"), "mother");
});
