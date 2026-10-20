import assert from "node:assert/strict";
import { test } from "node:test";
import { readPhone } from "./phone.ts";

test("a number as people type it becomes one tel: can dial", () => {
  assert.deepEqual(readPhone("(512) 555-0142"), { ok: true, value: "5125550142" });
  assert.deepEqual(readPhone(" +1 512 555 0142 "), { ok: true, value: "+15125550142" });
  assert.deepEqual(readPhone("512.555.0142"), { ok: true, value: "5125550142" });
});

test("empty clears it", () => {
  assert.deepEqual(readPhone("  "), { ok: true, value: null });
});

test("letters, too few or too many digits are refused", () => {
  assert.equal(readPhone("call me").ok, false);
  assert.equal(readPhone("12345").ok, false);
  assert.equal(readPhone("1234567890123456").ok, false);
  assert.equal(readPhone("555-0142; drop").ok, false);
});
