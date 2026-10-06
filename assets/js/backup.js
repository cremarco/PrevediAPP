import { initialState, parseState, availablePoints } from "../data.js";
import { validateReading, GLUCOSE_LIMIT } from "./glucose.js";
import { validateEntry, validDate } from "./records.js";

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

export function readBackup(text) {
  if (
    typeof text !== "string" ||
    new TextEncoder().encode(text).length > MAX_BACKUP_BYTES
  )
    throw new Error("Scegli una copia JSON di PREVEDIApp inferiore a 2 MB.");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(
      "Il file non contiene un JSON leggibile. Scegli una copia esportata da PREVEDIApp.",
    );
  }
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.entries) ||
    !Array.isArray(value.awards)
  )
    throw new Error("Questo file non è una copia di PREVEDIApp versione 1.");
  const ids = new Set();
  for (const entry of value.entries) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !entry.id ||
      ids.has(entry.id)
    )
      throw new Error(
        "La copia contiene registrazioni non valide o duplicate.",
      );
    ids.add(entry.id);
    validateEntry(entry);
  }
  const awards = new Set();
  for (const award of value.awards) {
    const key = `${award?.date}:${award?.id}`;
    if (
      !award ||
      typeof award.id !== "string" ||
      !validDate(award.date) ||
      !Number.isFinite(award.points) ||
      award.points < 0 ||
      awards.has(key)
    )
      throw new Error("La copia contiene progressi non validi o duplicati.");
    awards.add(key);
  }
  if (Object.hasOwn(value, "glucoseReadings")) {
    if (
      !Array.isArray(value.glucoseReadings) ||
      value.glucoseReadings.length > GLUCOSE_LIMIT
    )
      throw new Error(
        "La copia contiene misurazioni non valide o supera il limite di 200.",
      );
    const readingIds = new Set();
    for (const reading of value.glucoseReadings) {
      if (
        !reading ||
        typeof reading.id !== "string" ||
        readingIds.has(reading.id)
      )
        throw new Error(
          "La copia contiene misurazioni duplicate o senza identità.",
        );
      readingIds.add(reading.id);
      validateReading(reading);
    }
  }
  const known = Object.fromEntries(
    Object.keys(initialState())
      .filter((key) => Object.hasOwn(value, key))
      .map((key) => [key, value[key]]),
  );
  const state = parseState(JSON.stringify(known));
  state.entries = state.entries.map((entry) => ({
    id: entry.id,
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "",
    ...validateEntry(entry),
  }));
  if (availablePoints(state) < 0)
    throw new Error("Foglie e ricompense di questa copia non sono coerenti.");
  return state;
}
