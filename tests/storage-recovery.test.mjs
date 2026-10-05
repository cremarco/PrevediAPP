import test from "node:test";
import assert from "node:assert/strict";
import { KEY, initialState } from "../assets/data.js";
import { createStore } from "../assets/js/store.js";

function storageFixture(raw = null) {
  let value = raw;
  const fixture = {
    writes: 0,
    denyRead: false,
    denyWrite: false,
    getItem(key) {
      assert.equal(key, KEY);
      if (fixture.denyRead) throw new Error("Read denied");
      return value;
    },
    setItem(key, next) {
      assert.equal(key, KEY);
      if (fixture.denyWrite) throw new Error("Write denied");
      fixture.writes++;
      value = next;
    },
    get raw() {
      return value;
    },
    corrupt(next) {
      value = next;
    },
  };
  return fixture;
}

test("An unreadable local file is exportable verbatim and cannot be overwritten by ordinary saves", () => {
  const raw = '  {"version":1,"entries":[\n"incomplete"';
  const storage = storageFixture(raw);
  const store = createStore(() => storage);
  assert.equal(store.recoveryRequired, true);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(store.recoveryRaw, raw);
  assert.equal(store.recoveryReason, "unreadable");
  assert.equal(store.storageUnavailable, false);
  store.state.name = "Temporary session";
  assert.equal(store.save(), false);
  assert.equal(store.save(), false);
  assert.equal(storage.writes, 0);
  assert.equal(storage.raw, raw);
  assert.equal(store.unreadableRaw, raw);
  assert.ok(store.problem);
});

test("A readable JSON file with an unsupported schema is protected just like malformed JSON", () => {
  const raw = JSON.stringify({ version: 9, entries: [], awards: [] });
  const storage = storageFixture(raw);
  const store = createStore(() => storage);
  assert.equal(store.recoveryRequired, true);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(store.save(), false);
  assert.equal(storage.raw, raw);
});

test("Read-denied storage permits temporary edits and a normal save when empty storage recovers", () => {
  const storage = storageFixture();
  storage.denyRead = true;
  const store = createStore(() => storage);
  assert.equal(store.recoveryRequired, false);
  assert.equal(store.unreadableRaw, null);
  assert.equal(store.storageUnavailable, true);
  assert.equal(store.prepareWrite(), true);
  store.state.name = "In memory";
  assert.equal(store.save(), false);
  assert.equal(store.state.name, "In memory");
  storage.denyRead = false;
  assert.equal(store.save(), true);
  assert.equal(JSON.parse(storage.raw).name, "In memory");
  assert.equal(store.problem, "");
  assert.equal(store.storageUnavailable, false);
});

test("A corrupt file discovered after storage access recovers remains intact", () => {
  const raw = "{unreadable before access recovered";
  const storage = storageFixture(raw);
  storage.denyRead = true;
  const store = createStore(() => storage);
  store.state.name = "Temporary";
  storage.denyRead = false;
  assert.equal(store.save(), false);
  assert.equal(store.recoveryRequired, true);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(storage.writes, 0);
  assert.equal(storage.raw, raw);
});

test("A valid previous file discovered after a denied initial read needs an explicit recovery decision", () => {
  const saved = { ...initialState(), name: "Previous journey" };
  const raw = JSON.stringify(saved, null, 2);
  const storage = storageFixture(raw);
  storage.denyRead = true;
  const store = createStore(() => storage);
  store.state.name = "Temporary session";
  const previous = store.state;
  storage.denyRead = false;
  assert.equal(store.save(), false);
  assert.equal(store.state, previous);
  assert.equal(store.recoveryReason, "existing");
  assert.equal(store.recoveryRaw, raw);
  assert.equal(storage.raw, raw);
  assert.equal(storage.writes, 0);
  assert.equal(store.sync(null), false);
  storage.denyWrite = true;
  assert.equal(store.recover(), false);
  assert.equal(store.state, previous);
  assert.equal(store.recoveryRaw, raw);
  assert.equal(storage.raw, raw);
  storage.denyWrite = false;
  assert.equal(store.recover(), true);
  assert.equal(store.state.name, "Previous journey");
  assert.equal(JSON.parse(storage.raw).name, "Previous journey");
  assert.equal(store.recoveryRequired, false);
  assert.equal(store.recoveryReason, null);
  assert.equal(store.recoveryRaw, null);
  assert.equal(store.problem, "");
});

test("Preflight discovers a recovered existing file before the controller mutates its state", () => {
  const raw = JSON.stringify({ ...initialState(), name: "Saved journey" });
  const storage = storageFixture(raw);
  storage.denyRead = true;
  const store = createStore(() => storage);
  const previous = store.state;
  assert.equal(store.prepareWrite(), true);
  storage.denyRead = false;
  assert.equal(store.prepareWrite(), false);
  assert.equal(store.state, previous);
  assert.equal(store.state.name, "");
  assert.equal(store.recoveryReason, "existing");
  assert.equal(store.recoveryRaw, raw);
  assert.equal(storage.raw, raw);
  assert.equal(storage.writes, 0);
  assert.equal(store.prepareWrite(), false);
});

test("Preflight discovers missed corruption before any in-memory change", () => {
  const storage = storageFixture(JSON.stringify(initialState()));
  const store = createStore(() => storage);
  const previous = store.state;
  const raw = "{missed external event";
  storage.corrupt(raw);
  assert.equal(store.prepareWrite(), false);
  assert.equal(store.state, previous);
  assert.equal(store.recoveryReason, "unreadable");
  assert.equal(store.recoveryRaw, raw);
  assert.equal(storage.writes, 0);
});

test("Recover cannot accept an unreadable original or reset a healthy session implicitly", () => {
  const storage = storageFixture("{broken");
  const store = createStore(() => storage);
  assert.equal(store.recover(), false);
  assert.equal(store.recoveryReason, "unreadable");
  assert.equal(storage.raw, "{broken");
  assert.equal(storage.writes, 0);
  assert.equal(store.reset(), true);
  store.state.name = "Current";
  assert.equal(store.recover(), false);
  assert.equal(store.state.name, "Current");
});

test("Failed restoration leaves current state and the original protected file intact", () => {
  const raw = "{original broken file";
  const storage = storageFixture(raw);
  const store = createStore(() => storage);
  store.state.name = "Current session";
  const previous = store.state;
  storage.denyWrite = true;
  assert.equal(store.replace({ ...initialState(), name: "Imported" }), false);
  assert.equal(store.state, previous);
  assert.equal(store.state.name, "Current session");
  assert.equal(store.recoveryRequired, true);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(storage.raw, raw);
  assert.ok(store.problem);
});

test("A validated explicit restoration persists a clone before releasing protection", () => {
  const storage = storageFixture("{broken");
  const store = createStore(() => storage);
  const incoming = { ...initialState(), name: "Restored" };
  assert.equal(store.replace(incoming), true);
  incoming.name = "Changed after import";
  assert.equal(store.state.name, "Restored");
  assert.equal(JSON.parse(storage.raw).name, "Restored");
  assert.equal(store.recoveryRequired, false);
  assert.equal(store.unreadableRaw, null);
  assert.equal(store.problem, "");
  assert.equal(store.save(), true);
});

test("An invalid restoration cannot replace data or release recovery protection", () => {
  const raw = "{broken";
  const storage = storageFixture(raw);
  const store = createStore(() => storage);
  store.state.name = "Current";
  const previous = store.state;
  assert.throws(() => store.replace({ version: 2 }));
  assert.throws(() => store.replace(undefined));
  assert.throws(() => store.replace(null));
  assert.equal(store.state, previous);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(storage.raw, raw);
  assert.equal(storage.writes, 0);
});

test("A failed new beginning is atomic; a successful explicit reset releases recovery", () => {
  const raw = "{broken";
  const storage = storageFixture(raw);
  const store = createStore(() => storage);
  store.state.name = "Current";
  const previous = store.state;
  storage.denyWrite = true;
  assert.equal(store.reset(), false);
  assert.equal(store.state, previous);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(storage.raw, raw);
  storage.denyWrite = false;
  assert.equal(store.reset(), true);
  assert.deepEqual(store.state, initialState());
  assert.deepEqual(JSON.parse(storage.raw), initialState());
  assert.equal(store.recoveryRequired, false);
  assert.equal(store.unreadableRaw, null);
  assert.equal(store.problem, "");
});

test("Corrupt external saves protect the original file and preserve current state until an explicit decision", () => {
  const storage = storageFixture();
  const store = createStore(() => storage);
  store.state.name = "Current";
  assert.equal(store.save(), true);
  const raw = "{first external corruption";
  storage.corrupt(raw);
  const previous = store.state;
  assert.equal(store.sync(raw), false);
  assert.equal(store.state, previous);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(store.sync("{second corruption"), false);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(
    store.sync(JSON.stringify({ ...initialState(), name: "Another tab" })),
    false,
  );
  assert.equal(store.sync(null), false);
  assert.equal(store.state, previous);
  assert.equal(store.save(), false);
  assert.equal(storage.raw, raw);
  assert.equal(store.replace(previous), true);
  assert.equal(store.recoveryRequired, false);
  assert.equal(JSON.parse(storage.raw).name, "Current");
  assert.equal(
    store.sync(JSON.stringify({ ...initialState(), name: "Another tab" })),
    true,
  );
  assert.equal(store.state.name, "Another tab");
  assert.equal(store.sync(null), true);
  assert.equal(store.state.name, "");
});

test("A missed external corruption event cannot turn the next local save into data loss", () => {
  const storage = storageFixture(JSON.stringify(initialState()));
  const store = createStore(() => storage);
  const raw = "{unexpected corruption";
  storage.corrupt(raw);
  store.state.name = "Local edit";
  assert.equal(store.save(), false);
  assert.equal(store.unreadableRaw, raw);
  assert.equal(storage.raw, raw);
  assert.equal(storage.writes, 0);
});

test("A denied normal write reports failure and keeps temporary edits available for export", () => {
  const storage = storageFixture();
  const store = createStore(() => storage);
  store.state.name = "Unsaved";
  storage.denyWrite = true;
  assert.equal(store.save(), false);
  assert.equal(store.state.name, "Unsaved");
  assert.equal(storage.raw, null);
  assert.equal(store.recoveryRequired, false);
  assert.ok(store.problem);
});
