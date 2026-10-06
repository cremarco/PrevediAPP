// Drafts live only in this page. App routes provide the scope; the DOM is injected.
const formFields = new Map([
  ["profile-form", new Set(["name", "movement", "sleep", "water"])],
  ["chat-form", new Set(["message"])],
  ["glucose-form", new Set(["date", "time", "value", "context", "notes"])],
  ["community-form", new Set(["text"])],
  [
    "entry-form",
    new Set(["meal", "label", "minutes", "hours", "quality", "date", "notes"]),
  ],
  // Radio answers keep the risk flow's own branching and provenance rules.
  ["risk-form", new Set(["height", "weight", "asian"])],
]);
const inputTypes = new Set([
  "text",
  "number",
  "date",
  "time",
  "checkbox",
  "radio",
]);

function formsWithin(root) {
  if (!root) return [];
  const forms = Array.from(root.querySelectorAll?.("form") || []);
  if (root.tagName?.toLowerCase() === "form") forms.unshift(root);
  return forms.filter((form) => formFields.has(form.id));
}

function fieldsWithin(form) {
  const names = formFields.get(form.id);
  const identities = new Map();
  return Array.from(form.elements || [])
    .filter((field) => {
      const tag = field.tagName?.toLowerCase();
      return (
        names.has(field.name) &&
        !field.disabled &&
        !field.matches?.(":disabled") &&
        (tag === "select" ||
          tag === "textarea" ||
          (tag === "input" && inputTypes.has(field.type || "text")))
      );
    })
    .map((field) => {
      const type = field.type || field.tagName.toLowerCase();
      const base = field.id
        ? `id:${field.id}`
        : `name:${field.name}:${type}${["radio", "checkbox"].includes(type) ? `:${field.value}` : ""}`;
      const occurrence = identities.get(base) || 0;
      identities.set(base, occurrence + 1);
      return { field, key: `${base}:${occurrence}` };
    });
}

function readValue(field) {
  if (["checkbox", "radio"].includes(field.type))
    return { checked: field.checked };
  if (field.tagName.toLowerCase() === "select" && field.multiple)
    return {
      selected: Array.from(field.options)
        .filter((option) => option.selected)
        .map((option) => option.value),
    };
  return { value: field.value };
}

function readDefault(field) {
  if (["checkbox", "radio"].includes(field.type))
    return { checked: field.defaultChecked };
  if (field.tagName.toLowerCase() === "select") {
    const options = Array.from(field.options);
    const selected = options.filter((option) => option.defaultSelected);
    return field.multiple
      ? { selected: selected.map((option) => option.value) }
      : { value: (selected.at(-1) || options[0])?.value || "" };
  }
  return { value: field.defaultValue };
}

function sameValue(first, second) {
  if (Object.hasOwn(first, "checked")) return first.checked === second.checked;
  if (first.selected)
    return (
      first.selected.length === second.selected?.length &&
      first.selected.every((value, index) => value === second.selected[index])
    );
  return first.value === second.value;
}

function writeValue(field, saved) {
  if (Object.hasOwn(saved, "checked")) {
    const changed = field.checked !== saved.checked;
    field.checked = saved.checked;
    return changed;
  }
  if (saved.selected) {
    let changed = false;
    for (const option of Array.from(field.options)) {
      const selected = saved.selected.includes(option.value);
      if (option.selected !== selected) changed = true;
      option.selected = selected;
    }
    return changed;
  }
  const changed = field.value !== saved.value;
  field.value = saved.value;
  return changed;
}

function readSelection(field) {
  if (typeof field.selectionStart !== "number") return null;
  return {
    start: field.selectionStart,
    end: field.selectionEnd,
    direction: field.selectionDirection || "none",
  };
}

export function createFormDrafts() {
  const scopes = new Map();
  let nodeBaselines = new WeakMap();

  return {
    capture(root, scope) {
      const snapshot = scopes.get(scope) || new Map();
      const result = { captured: 0, forms: [] };
      for (const form of formsWithin(root)) {
        const fields = fieldsWithin(form);
        // A disabled composer must not replace a draft during its demo reply.
        if (!fields.length) continue;
        const previous = snapshot.get(form.id);
        const values = new Map(previous?.values);
        const baselines = new Map(previous?.baselines);
        let focused = null;
        for (const { field, key } of fields) {
          // A dirty field keeps its original baseline across renderer defaults
          // that already contain the draft. Untouched new DOM uses fresh defaults.
          const baseline = previous?.values.has(key)
            ? previous.baselines.get(key)
            : nodeBaselines.get(field) || readDefault(field);
          nodeBaselines.set(field, baseline);
          const value = readValue(field);
          if (sameValue(value, baseline)) {
            values.delete(key);
            baselines.delete(key);
          } else {
            values.set(key, value);
            baselines.set(key, baseline);
          }
          if (field === root.ownerDocument?.activeElement)
            focused = { key, selection: readSelection(field) };
        }
        if (values.size || focused)
          snapshot.set(form.id, { values, baselines, focused });
        else snapshot.delete(form.id);
        result.captured += values.size;
        if (values.size) result.forms.push(form.id);
      }
      if (snapshot.size) scopes.set(scope, snapshot);
      else scopes.delete(scope);
      return result;
    },

    restore(root, scope) {
      const snapshot = scopes.get(scope);
      const result = { restored: 0, forms: [], focusRestored: false };
      if (!snapshot) return result;
      for (const form of formsWithin(root)) {
        const saved = snapshot.get(form.id);
        if (!saved) continue;
        let changed = 0;
        for (const { field, key } of fieldsWithin(form)) {
          const value = saved.values.get(key);
          if (value && writeValue(field, value)) changed++;
          if (saved.focused?.key === key && typeof field.focus === "function") {
            field.focus({ preventScroll: true });
            const selection = saved.focused.selection;
            if (selection && typeof field.setSelectionRange === "function") {
              try {
                field.setSelectionRange(
                  selection.start,
                  selection.end,
                  selection.direction,
                );
              } catch {
                // Some native input types do not support a text selection.
              }
            }
            result.focusRestored = true;
          }
        }
        if (changed) {
          form.dataset.draftRestored = "true";
          const status = form.querySelector?.("[data-draft-status]");
          if (status) status.hidden = false;
          result.restored += changed;
          result.forms.push(form.id);
        }
      }
      return result;
    },

    clear(scope, formId) {
      if (scope === undefined) {
        scopes.clear();
        nodeBaselines = new WeakMap();
        return;
      }
      if (formId === undefined) {
        scopes.delete(scope);
        return;
      }
      const snapshot = scopes.get(scope);
      snapshot?.delete(formId);
      if (!snapshot?.size) scopes.delete(scope);
    },
  };
}
