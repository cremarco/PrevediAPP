import test from "node:test";
import assert from "node:assert/strict";
import { reply, guidedFallback } from "../assets/js/views/assistant.js";
import { entryDetails } from "../assets/js/ui/components.js";

test("Common meal requests reach the guided nutrition path", () => {
  for (const message of [
    "un’idea per cena?",
    "Cosa preparo per pranzo?",
    "idee per colazione",
    "una ricetta?",
  ])
    assert.match(reply(message), /Crea il piatto/);
});
test("Unsupported input offers predefined topics and medical terms keep their boundary", () => {
  assert.equal(reply("quanto costa un treno?"), guidedFallback);
  assert.match(reply("cena con valori glicemici alti"), /medico/);
  for (const message of [
    "Idee per uno spuntino",
    "Un po’ di movimento",
    "Una sera tranquilla",
    "Un momento di calma",
  ])
    assert.notEqual(reply(message), guidedFallback);
});
test("One-minute breathing and movement records use the singular", () => {
  assert.equal(
    entryDetails({ type: "mindful", minutes: 1 }),
    "1 minuto di respirazione",
  );
  assert.equal(entryDetails({ type: "movement", minutes: 1 }), "1 minuto");
  assert.equal(
    entryDetails({ type: "mindful", minutes: 3 }),
    "3 minuti di respirazione",
  );
});
