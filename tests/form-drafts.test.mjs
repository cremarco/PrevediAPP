import test from "node:test";
import assert from "node:assert/strict";
import { createFormDrafts } from "../assets/js/form-drafts.js";

function field(name, value = "", props = {}) {
  return {
    tagName: "INPUT",
    type: "text",
    id: "",
    name,
    value,
    defaultValue: "",
    checked: false,
    defaultChecked: false,
    disabled: false,
    selectionStart: null,
    selectionEnd: null,
    matches(selector) {
      return selector === ":disabled" && !!this.inDisabledFieldset;
    },
    focus(options) {
      this.ownerDocument.activeElement = this;
      this.focusOptions = options;
    },
    setSelectionRange(start, end, direction) {
      Object.assign(this, {
        selectionStart: start,
        selectionEnd: end,
        selectionDirection: direction,
      });
    },
    ...props,
  };
}

function form(id, elements) {
  const status = { hidden: true };
  return {
    tagName: "FORM",
    id,
    elements,
    dataset: {},
    status,
    querySelectorAll() {
      return [];
    },
    querySelector(selector) {
      return selector === "[data-draft-status]" ? status : null;
    },
  };
}

function root(...forms) {
  const ownerDocument = { activeElement: null };
  for (const item of forms) {
    item.ownerDocument = ownerDocument;
    for (const control of item.elements) control.ownerDocument = ownerDocument;
  }
  return {
    ownerDocument,
    querySelectorAll(selector) {
      return selector === "form" ? forms : [];
    },
  };
}

test("A profile draft survives a new render without changing the saved defaults", () => {
  const drafts = createFormDrafts();
  const original = form("profile-form", [
    field("name", "Nome modificato", { id: "profile-name" }),
    field("movement", "45", { type: "number", id: "profile-movement" }),
    field("sleep", "7.5", { type: "number" }),
    field("water", "9", { type: "number" }),
  ]);
  assert.equal(drafts.capture(root(original), "profilo").captured, 4);
  original.elements[0].value = "Mutazione successiva";
  const rendered = form("profile-form", [
    field("name", "Nome salvato", { id: "profile-name" }),
    field("movement", "30", { type: "number", id: "profile-movement" }),
    field("sleep", "8", { type: "number" }),
    field("water", "8", { type: "number" }),
  ]);
  const restored = drafts.restore(root(rendered), "profilo");
  assert.equal(restored.restored, 4);
  assert.deepEqual(
    rendered.elements.map((item) => item.value),
    ["Nome modificato", "45", "7.5", "9"],
  );
  assert.equal(rendered.dataset.draftRestored, "true");
  assert.equal(rendered.status.hidden, false);
});

test("New and edited record scopes retain their own drafts", () => {
  const drafts = createFormDrafts();
  const composer = form("community-form", [
    field("text", "Un nuovo messaggio", { tagName: "TEXTAREA" }),
  ]);
  const container = root(composer);
  drafts.capture(container, "community:nuovo");
  composer.elements[0].value = "Una correzione al messaggio esistente";
  drafts.capture(container, "community:edit:post-1");
  composer.elements[0].value = "";
  drafts.restore(container, "community:nuovo");
  assert.equal(composer.elements[0].value, "Un nuovo messaggio");
  drafts.restore(container, "community:edit:post-1");
  assert.equal(
    composer.elements[0].value,
    "Una correzione al messaggio esistente",
  );
  assert.equal(drafts.restore(container, "community:edit:post-2").restored, 0);
});

test("Record fields retain native select, checkbox, radio and textarea states", () => {
  const drafts = createFormDrafts();
  const meal = field("meal", "Pranzo", {
    tagName: "SELECT",
    type: "select-one",
    options: [
      { value: "Pranzo", defaultSelected: false },
      { value: "Cena", defaultSelected: true },
    ],
  });
  const quality = field("quality", "", {
    tagName: "SELECT",
    type: "select-multiple",
    multiple: true,
    options: [
      { value: "a", selected: true, defaultSelected: false },
      { value: "b", selected: false, defaultSelected: true },
      { value: "c", selected: true, defaultSelected: false },
    ],
  });
  const labelA = field("label", "A", {
    type: "radio",
    checked: false,
    defaultChecked: true,
  });
  const labelB = field("label", "B", { type: "radio", checked: true });
  const notes = field("notes", "Due righe\nancora da salvare", {
    tagName: "TEXTAREA",
  });
  const entry = form("entry-form", [meal, quality, labelA, labelB, notes]);
  const container = root(entry);
  drafts.capture(container, "entry:meal");
  meal.value = "Cena";
  quality.options.forEach((option) => (option.selected = option.value === "b"));
  labelA.checked = true;
  labelB.checked = false;
  notes.value = "";
  drafts.restore(container, "entry:meal");
  assert.equal(meal.value, "Pranzo");
  assert.deepEqual(
    quality.options.map((option) => option.selected),
    [true, false, true],
  );
  assert.deepEqual([labelA.checked, labelB.checked], [false, true]);
  assert.equal(notes.value, "Due righe\nancora da salvare");
});

test("Risk body drafts never restore radio answers owned by the branch flow", () => {
  const drafts = createFormDrafts();
  const height = field("height", "170", { type: "number" });
  const weight = field("weight", "75.5", { type: "number" });
  const asian = field("asian", "on", { type: "checkbox", checked: true });
  const answer = field("answer", "yes", { type: "radio", checked: true });
  const risk = form("risk-form", [height, weight, asian, answer]);
  const container = root(risk);
  assert.equal(drafts.capture(container, "rischio:body").captured, 3);
  height.value = "";
  weight.value = "";
  asian.checked = false;
  answer.checked = false;
  drafts.restore(container, "rischio:body");
  assert.deepEqual(
    [height.value, weight.value, asian.checked],
    ["170", "75.5", true],
  );
  assert.equal(answer.checked, false);
});

test("Draft capture excludes files, hidden, disabled, unknown and sensitive fields", () => {
  const drafts = createFormDrafts();
  const ignored = [
    field("name", "file", { type: "file" }),
    field("name", "internal", { type: "hidden" }),
    field("name", "disabled", { disabled: true }),
    field("name", "fieldset", { inDisabledFieldset: true }),
    field("name", "secret", { type: "password" }),
    field("name", "email@example.test", { type: "email" }),
    field("name", "phone", { type: "tel" }),
    field("unknown", "unrelated"),
  ];
  const profile = form("profile-form", ignored);
  const unknown = form("unrelated-form", [field("name", "Other form")]);
  const container = root(profile, unknown);
  assert.equal(drafts.capture(container, "profilo").captured, 0);
  ignored.forEach((control) => (control.value = "later"));
  unknown.elements[0].value = "later";
  assert.equal(drafts.restore(container, "profilo").restored, 0);
  assert.ok(ignored.every((control) => control.value === "later"));
  assert.equal(unknown.elements[0].value, "later");
});

test("A disabled chat during a topic reply does not overwrite the unsent draft", () => {
  const drafts = createFormDrafts();
  const message = field("message", "Il mio messaggio personale");
  const composer = form("chat-form", [message]);
  const container = root(composer);
  drafts.capture(container, "assistente");
  message.disabled = true;
  message.value = "";
  drafts.capture(container, "assistente");
  message.disabled = false;
  drafts.restore(container, "assistente");
  assert.equal(message.value, "Il mio messaggio personale");
});

test("Focus and the text selection follow the stable field ID across a render", () => {
  const drafts = createFormDrafts();
  const original = field("message", "Una bozza con un dettaglio", {
    id: "chat-message",
    selectionStart: 4,
    selectionEnd: 9,
    selectionDirection: "backward",
  });
  const oldRoot = root(form("chat-form", [original]));
  oldRoot.ownerDocument.activeElement = original;
  drafts.capture(oldRoot, "assistente");
  const replacement = field("message", "", { id: "chat-message" });
  const newRoot = root(form("chat-form", [replacement]));
  const result = drafts.restore(newRoot, "assistente");
  assert.equal(newRoot.ownerDocument.activeElement, replacement);
  assert.equal(result.focusRestored, true);
  assert.deepEqual(replacement.focusOptions, { preventScroll: true });
  assert.deepEqual(
    [
      replacement.selectionStart,
      replacement.selectionEnd,
      replacement.selectionDirection,
    ],
    [4, 9, "backward"],
  );
});

test("A form can be the root and clearing one form leaves the other drafts intact", () => {
  const drafts = createFormDrafts();
  const profile = form("profile-form", [field("name", "Nome")]);
  const chat = form("chat-form", [field("message", "Messaggio")]);
  const container = root(profile, chat);
  drafts.capture(container, "shared");
  drafts.clear("shared", "profile-form");
  profile.elements[0].value = "";
  chat.elements[0].value = "";
  assert.equal(drafts.restore(profile, "shared").restored, 0);
  assert.equal(drafts.restore(chat, "shared").restored, 1);
  drafts.clear("shared");
  chat.elements[0].value = "";
  assert.equal(drafts.restore(chat, "shared").restored, 0);
  drafts.capture(container, "another-scope");
  drafts.clear();
  assert.equal(drafts.restore(container, "another-scope").restored, 0);
});

test("Free draft text is assigned as a field value without writing HTML", () => {
  const drafts = createFormDrafts();
  const text = '<img src=x onerror="alert(1)"> & <script>ignored</script>';
  const notes = field("notes", text, { tagName: "TEXTAREA" });
  const entry = form("entry-form", [notes]);
  Object.defineProperty(entry, "innerHTML", {
    set() {
      assert.fail("Restoring drafts must never write HTML");
    },
  });
  const container = root(entry);
  drafts.capture(container, "entry");
  notes.value = "";
  drafts.restore(container, "entry");
  assert.equal(notes.value, text);
});

test("An untouched profile never overwrites newer saved defaults on return", () => {
  const drafts = createFormDrafts();
  const untouched = form("profile-form", [
    field("name", "Marco", { defaultValue: "Marco" }),
    field("movement", "30", { type: "number", defaultValue: "30" }),
    field("sleep", "8", { type: "number", defaultValue: "8" }),
    field("water", "8", { type: "number", defaultValue: "8" }),
  ]);
  assert.equal(drafts.capture(root(untouched), "profilo").captured, 0);
  const updated = form("profile-form", [
    field("name", "Nome aggiornato", { defaultValue: "Nome aggiornato" }),
    field("movement", "45", { type: "number", defaultValue: "45" }),
    field("sleep", "7.5", { type: "number", defaultValue: "7.5" }),
    field("water", "9", { type: "number", defaultValue: "9" }),
  ]);
  assert.equal(drafts.restore(root(updated), "profilo").restored, 0);
  assert.deepEqual(
    updated.elements.map((control) => control.value),
    ["Nome aggiornato", "45", "7.5", "9"],
  );
  assert.equal(updated.status.hidden, true);
  assert.equal(updated.dataset.draftRestored, undefined);
});

test("Only an edited profile name is recovered while untouched goals update", () => {
  const drafts = createFormDrafts();
  const old = form("profile-form", [
    field("name", "Nome in bozza", { defaultValue: "Marco" }),
    field("movement", "30", { type: "number", defaultValue: "30" }),
    field("sleep", "8", { type: "number", defaultValue: "8" }),
    field("water", "8", { type: "number", defaultValue: "8" }),
  ]);
  assert.equal(drafts.capture(root(old), "profilo").captured, 1);
  const updated = form("profile-form", [
    field("name", "Altro nome salvato", { defaultValue: "Altro nome salvato" }),
    field("movement", "45", { type: "number", defaultValue: "45" }),
    field("sleep", "7", { type: "number", defaultValue: "7" }),
    field("water", "9", { type: "number", defaultValue: "9" }),
  ]);
  const updatedRoot = root(updated);
  assert.equal(drafts.restore(updatedRoot, "profilo").restored, 1);
  assert.deepEqual(
    updated.elements.map((control) => control.value),
    ["Nome in bozza", "45", "7", "9"],
  );
  assert.equal(drafts.capture(updatedRoot, "profilo").captured, 1);
});

test("A glucose draft stays dirty when a later render uses it as the default", () => {
  const drafts = createFormDrafts();
  const initial = form("glucose-form", [
    field("value", "115.4", { id: "glucose-value", type: "number" }),
  ]);
  assert.equal(drafts.capture(root(initial), "glucosio:nuovo").captured, 1);
  const draftRendered = form("glucose-form", [
    field("value", "115.4", {
      id: "glucose-value",
      type: "number",
      defaultValue: "115.4",
    }),
  ]);
  const draftRoot = root(draftRendered);
  drafts.restore(draftRoot, "glucosio:nuovo");
  assert.equal(drafts.capture(draftRoot, "glucosio:nuovo").captured, 1);
  const cleanRendered = form("glucose-form", [
    field("value", "", { id: "glucose-value", type: "number" }),
  ]);
  assert.equal(
    drafts.restore(root(cleanRendered), "glucosio:nuovo").restored,
    1,
  );
  assert.equal(cleanRendered.elements[0].value, "115.4");
});

test("Returning to the original baseline removes the draft across repeated captures", () => {
  const drafts = createFormDrafts();
  const initial = form("profile-form", [
    field("name", "Nome in bozza", { defaultValue: "Marco" }),
  ]);
  drafts.capture(root(initial), "profilo");
  const rendered = form("profile-form", [
    field("name", "Nome in bozza", { defaultValue: "Nome in bozza" }),
  ]);
  const container = root(rendered);
  drafts.restore(container, "profilo");
  drafts.capture(container, "profilo");
  rendered.elements[0].value = "Marco";
  assert.equal(drafts.capture(container, "profilo").captured, 0);
  assert.equal(drafts.capture(container, "profilo").captured, 0);
  const newer = form("profile-form", [
    field("name", "Nome salvato dopo", { defaultValue: "Nome salvato dopo" }),
  ]);
  assert.equal(drafts.restore(root(newer), "profilo").restored, 0);
  assert.equal(newer.elements[0].value, "Nome salvato dopo");
  assert.equal(newer.status.hidden, true);
});

test("Focus can recover without treating unchanged values as a draft", () => {
  const drafts = createFormDrafts();
  const original = field("name", "Marco", {
    defaultValue: "Marco",
    id: "profile-name",
    selectionStart: 1,
    selectionEnd: 3,
  });
  const oldRoot = root(form("profile-form", [original]));
  oldRoot.ownerDocument.activeElement = original;
  assert.equal(drafts.capture(oldRoot, "profilo").captured, 0);
  const replacement = field("name", "Marta", {
    defaultValue: "Marta",
    id: "profile-name",
  });
  const newForm = form("profile-form", [replacement]);
  const newRoot = root(newForm);
  const result = drafts.restore(newRoot, "profilo");
  assert.equal(result.restored, 0);
  assert.equal(result.focusRestored, true);
  assert.equal(replacement.value, "Marta");
  assert.equal(newRoot.ownerDocument.activeElement, replacement);
  assert.equal(newForm.status.hidden, true);
});
