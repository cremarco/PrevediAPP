import { localDate } from "../data.js";

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function shiftDate(value, offset) {
  if (!validDate(value)) throw new Error("Scegli un giorno valido.");
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function validateEntry(input, today = localDate()) {
  if (!validDate(input.date) || input.date > today)
    throw new Error("Scegli una data valida, oggi o precedente.");
  const entry = {
    type: input.type,
    date: input.date,
    notes: String(input.notes || "")
      .trim()
      .slice(0, 300),
  };
  if (entry.type === "meal") {
    entry.label = String(input.label || "")
      .trim()
      .slice(0, 160);
    if (!entry.label)
      throw new Error("Descrivi il pasto con almeno una parola.");
    entry.meal = String(input.meal || "Pasto").slice(0, 40);
  } else if (["movement", "mindful"].includes(entry.type)) {
    entry.minutes = Number(input.minutes);
    if (
      !Number.isFinite(entry.minutes) ||
      entry.minutes < 0.1 ||
      entry.minutes > 600
    )
      throw new Error("Inserisci una durata tra 0,1 e 600 minuti.");
    entry.label = String(
      input.label ||
        (entry.type === "mindful" ? "Pausa di respirazione" : "Altra attività"),
    ).slice(0, 160);
  } else if (entry.type === "sleep") {
    entry.hours = Number(input.hours);
    if (!Number.isFinite(entry.hours) || entry.hours < 0.5 || entry.hours > 24)
      throw new Error("Inserisci un numero di ore tra 0,5 e 24.");
    entry.label = "Il mio riposo";
    entry.quality = String(input.quality || "").slice(0, 60);
  } else if (entry.type === "water") entry.label = "Un bicchiere d’acqua";
  else throw new Error("Questa attività non è riconosciuta.");
  return entry;
}

export function updateEntry(state, id, input) {
  const index = state.entries.findIndex((entry) => entry.id === id);
  if (index < 0)
    throw new Error(
      "La registrazione non è più disponibile. Riapri il diario.",
    );
  const current = state.entries[index];
  const changes = validateEntry({ ...input, type: current.type });
  // Editing never creates a new award; identity and original time remain stable.
  state.entries[index] = { ...current, ...changes };
  return state.entries[index];
}

export function removeRecord(records, id) {
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) return null;
  return { record: records.splice(index, 1)[0], index };
}

export function restoreRecord(records, removed) {
  if (!removed || records.some((record) => record.id === removed.record.id))
    return false;
  records.splice(Math.min(removed.index, records.length), 0, removed.record);
  return true;
}

export function savePost(state, text, id = "") {
  const body = String(text || "").trim();
  if (!body || body.length > 400)
    throw new Error("Scrivi un messaggio da 1 a 400 caratteri.");
  if (id) {
    const post = state.posts.find((item) => item.id === id);
    if (!post) throw new Error("Il messaggio non è più disponibile.");
    post.text = body;
    return post;
  }
  if (state.posts.length >= 20)
    throw new Error(
      "La demo conserva fino a 20 messaggi. Rimuovine uno per aggiungerne un altro.",
    );
  const post = {
    id: crypto.randomUUID(),
    text: body,
    createdAt: new Date().toISOString(),
  };
  state.posts.push(post);
  return post;
}
