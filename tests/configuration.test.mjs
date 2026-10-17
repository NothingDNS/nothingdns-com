import test from "node:test";
import assert from "node:assert/strict";
import { createConfiguration, validatePort } from "../src/lib/configuration.ts";

test("starter recipes bind locally and include the selected port", () => {
  for (const preset of ["forwarder", "recursive", "authoritative"]) {
    const yaml = createConfiguration({
      preset,
      port: "5353",
      cache: true,
      dnssec: true,
    });
    assert.match(yaml, /port: 5353\n  bind:\n    - 127\.0\.0\.1/);
    assert.doesNotMatch(yaml, /0\.0\.0\.0|::/);
  }
});
test("iterative recipes omit upstream forwarding while local zones include a zone file", () => {
  const recursive = createConfiguration({
    preset: "recursive",
    port: "53",
    cache: true,
    dnssec: true,
  });
  assert.match(recursive, /recursive: true/);
  assert.doesNotMatch(recursive, /upstream:/);
  const zone = createConfiguration({
    preset: "authoritative",
    port: "5353",
    cache: false,
    dnssec: false,
  });
  assert.match(zone, /zones:\n  - \.\/example\.test\.zone/);
  assert.match(zone, /cache:\n  enabled: false/);
  assert.match(zone, /dnssec:\n  enabled: false/);
});
test("invalid ports cannot become downloadable configuration", () => {
  for (const port of ["", "0", "65536", "-1", "53.5", "53\nupstream:", "NaN"]) {
    assert.ok(validatePort(port));
    assert.throws(
      () =>
        createConfiguration({
          preset: "forwarder",
          port,
          cache: true,
          dnssec: true,
        }),
      /port/,
    );
  }
  for (const port of ["1", "5353", "65535"])
    assert.equal(validatePort(port), null);
});
