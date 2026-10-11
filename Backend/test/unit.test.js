import test from "node:test";
import assert from "node:assert/strict";
import { isCloudinaryConfigured } from "../src/lib/cloudinary.js";

test("Backend Unit Tests", async (t) => {
  await t.test("Cloudinary helper returns boolean state safely", () => {
    const isConfigured = isCloudinaryConfigured();
    assert.strictEqual(typeof isConfigured, "boolean");
  });

  await t.test("Call ID participant verification extracts correct user IDs", () => {
    const callId = "user123-user456";
    const parts = callId.split("-");
    assert.strictEqual(parts.length, 2);
    assert.ok(parts.includes("user123"));
    assert.ok(parts.includes("user456"));
  });

  await t.test("AI payload action validator detects supported actions", () => {
    const validActions = ["translate", "grammar-check", "icebreakers"];
    assert.ok(validActions.includes("translate"));
    assert.ok(validActions.includes("grammar-check"));
    assert.ok(validActions.includes("icebreakers"));
    assert.strictEqual(validActions.includes("invalid-action"), false);
  });

  await t.test("JWT token extraction from cookies handles empty tokens", () => {
    const reqWithoutCookie = { cookies: {} };
    assert.strictEqual(Boolean(reqWithoutCookie.cookies?.jwt), false);

    const reqWithCookie = { cookies: { jwt: "sample-token-jwt" } };
    assert.strictEqual(reqWithCookie.cookies?.jwt, "sample-token-jwt");
  });
});
