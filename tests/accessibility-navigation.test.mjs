import test from "node:test";
import assert from "node:assert/strict";
import {
  createAnnouncer,
  createDrawerNavigation,
  focusableElements,
} from "../assets/js/accessibility.js";

function fixture() {
  let focusChanged = () => {};
  const document = {
    activeElement: null,
    body: {},
    addEventListener: (_, callback) => {
      focusChanged = callback;
    },
  };
  const element = (extra = {}) => ({
    tabIndex: 0,
    disabled: false,
    hidden: false,
    attrs: {},
    closest() {
      return this.hidden || this.inertAncestor ? this : null;
    },
    getClientRects() {
      return this.hidden ? [] : [{}];
    },
    focus() {
      document.activeElement = this;
      focusChanged({ target: this });
    },
    setAttribute(key, value) {
      this.attrs[key] = value;
    },
    removeAttribute(key) {
      delete this.attrs[key];
    },
    hasAttribute(key) {
      return Object.hasOwn(this.attrs, key);
    },
    ...extra,
  });
  const close = element(),
    current = element({ attrs: { "aria-current": "page" } }),
    last = element();
  const trigger = element(),
    drawer = { checked: false },
    content = {},
    toast = {};
  const dock = { contains: (target) => target === dockLink },
    dockLink = element();
  const panel = element({
    querySelectorAll: () => [close, current, last],
    contains: (target) => [close, current, last].includes(target),
  });
  let resized;
  const mediaQuery = {
    matches: false,
    addEventListener: (_, callback) => {
      resized = callback;
    },
  };
  const navigation = createDrawerNavigation({
    document,
    drawer,
    trigger,
    panel,
    content,
    dock,
    toast,
    mediaQuery,
    scheduleFocus: (callback) => callback(),
  });
  const key = (key, shiftKey = false) => {
    const event = {
      key,
      shiftKey,
      prevented: false,
      preventDefault() {
        this.prevented = true;
      },
    };
    navigation.keydown(event);
    return event;
  };
  return {
    document,
    drawer,
    trigger,
    panel,
    content,
    dock,
    dockLink,
    toast,
    mediaQuery,
    close,
    current,
    last,
    navigation,
    key,
    resize: () => resized(),
  };
}

test("Opening mobile navigation isolates background controls and contains keyboard focus", () => {
  const f = fixture();
  f.navigation.sync();
  assert.equal(f.panel.inert, true);
  f.drawer.checked = true;
  f.navigation.sync();
  assert.equal(f.document.activeElement, f.close);
  assert.equal(f.panel.attrs["aria-modal"], "true");
  for (const background of [f.content, f.dock, f.toast])
    assert.equal(background.inert, true);
  assert.equal(f.key("Tab", true).prevented, true);
  assert.equal(f.document.activeElement, f.last);
  assert.equal(f.key("Tab").prevented, true);
  assert.equal(f.document.activeElement, f.close);
  f.trigger.focus();
  assert.equal(f.key("Tab").prevented, true);
  assert.equal(f.document.activeElement, f.close);
});

test("Escape closes the mobile menu and restores the trigger without leaving inert content", () => {
  const f = fixture();
  f.drawer.checked = true;
  f.navigation.sync();
  assert.equal(f.key("Escape").prevented, true);
  assert.equal(f.document.activeElement, f.trigger);
  assert.equal(f.drawer.checked, false);
  assert.equal(f.trigger.attrs["aria-expanded"], "false");
  for (const background of [f.content, f.dock, f.toast])
    assert.equal(background.inert, false);
  assert.equal(f.panel.inert, true);
});

test("Responsive navigation moves focus off hidden mobile controls and does not reopen on narrowing", () => {
  for (const origin of ["close", "trigger", "dockLink"]) {
    const f = fixture();
    f.drawer.checked = true;
    f.navigation.sync();
    f[origin].focus();
    f.close.hidden = true;
    f.document.activeElement = f.document.body;
    f.mediaQuery.matches = true;
    f.resize();
    assert.equal(f.document.activeElement, f.current, origin);
    assert.equal(f.drawer.checked, false);
    assert.equal(f.panel.inert, false);
    assert.equal(f.panel.attrs["aria-modal"], undefined);
    f.close.hidden = false;
    f.mediaQuery.matches = false;
    f.resize();
    assert.equal(f.document.activeElement, f.trigger);
    assert.equal(f.panel.inert, true);
  }
});

test("The focus loop excludes hidden, disabled and deliberately non-tabbed controls", () => {
  const f = fixture();
  f.close.hidden = true;
  f.last.disabled = true;
  assert.deepEqual(focusableElements(f.panel), [f.current]);
  f.current.tabIndex = -1;
  assert.deepEqual(focusableElements(f.panel), []);
});

test("A repeated announcement gets a fresh update and a superseded message is canceled", () => {
  const region = { textContent: "Salvato" },
    jobs = new Map();
  let next = 0;
  const speak = createAnnouncer(
    region,
    (callback) => {
      jobs.set(++next, callback);
      return next;
    },
    (id) => jobs.delete(id),
  );
  speak("Salvato");
  assert.equal(region.textContent, "");
  assert.equal(jobs.size, 1);
  speak(() => "Salvato nel diario, 6 ottobre");
  assert.equal(jobs.size, 1);
  [...jobs.values()][0]();
  assert.equal(region.textContent, "Salvato nel diario, 6 ottobre");
});
