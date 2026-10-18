import test from "node:test";
import assert from "node:assert/strict";
import { createAmbientPreference } from "../src/lib/ambient-preference.ts";

function device({ saved = null, reduced = false, blocked = false } = {}) {
  const state = { saved, reduced };
  const setting = createAmbientPreference({
    read() {
      if (blocked) throw new Error("Storage disabled");
      return state.saved;
    },
    write(value) {
      if (blocked) throw new Error("Storage disabled");
      state.saved = value;
    },
    reduced: () => state.reduced,
  });
  return { setting, state };
}

test("first visit follows the device preference without saving an implicit choice", () => {
  for (const reduced of [false, true]) {
    const { setting, state } = device({ reduced });
    assert.equal(setting.load(), !reduced);
    state.reduced = !reduced;
    assert.equal(setting.current(), reduced);
    assert.equal(state.saved, null);
  }
});

test("explicit on/off choices persist across reloads and override subsequent device changes", () => {
  for (const reduced of [false, true]) {
    const { setting, state } = device({ reduced });
    const initial = setting.load();
    assert.equal(setting.toggle(), !initial);
    assert.equal(state.saved, initial ? "off" : "on");
    state.reduced = !reduced;
    assert.equal(setting.current(), !initial);
    const reload = device({ saved: state.saved, reduced });
    assert.equal(reload.setting.load(), !initial);
    assert.equal(reload.setting.toggle(), initial);
  }
});

test("missing or invalid saved preferences fall back to reduced motion safely", () => {
  for (const saved of [null, "", "unexpected", "true"]) {
    assert.equal(device({ saved, reduced: true }).setting.load(), false);
    assert.equal(device({ saved, reduced: false }).setting.load(), true);
  }
});

test("blocked storage keeps the control usable for this session", () => {
  const { setting, state } = device({ blocked: true, reduced: true });
  assert.equal(setting.load(), false);
  assert.equal(setting.toggle(), true);
  assert.equal(setting.current(), true);
  assert.equal(state.saved, null);
  assert.equal(setting.toggle(), false);
});

test("cross-tab changes synchronize choices; clearing storage restores the device default", () => {
  const { setting, state } = device();
  assert.equal(setting.load(), true);
  assert.equal(setting.sync("off"), false);
  assert.equal(setting.sync("on"), true);
  state.reduced = true;
  assert.equal(setting.sync(null), false);
  state.reduced = false;
  assert.equal(setting.current(), true);
});
