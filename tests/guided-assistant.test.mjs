import test from "node:test";
import assert from "node:assert/strict";
import {
  assistant,
  reply,
  guidedFallback,
} from "../assets/js/views/assistant.js";
import { entryDetails } from "../assets/js/ui/components.js";

test("Common meal requests reach the guided nutrition path", () => {
  for (const message of [
    "un’idea per cena?",
    "Cosa preparo per pranzo?",
    "idee per colazione",
    "Un piatto più vario",
    "come compongo i miei piatti?",
  ]) {
    const response = reply(message);
    assert.match(response, /Crea il piatto/);
    const html = assistant({
      state: { chat: [{ role: "assistant", text: response }] },
      chatBusy: false,
    });
    assert.match(html, /href="#piatto"/);
  }
});
test("Pantry requests explain the existing ingredient and plate actions", () => {
  for (const message of ["Come uso il frigo?", "Usa la mia dispensa"]) {
    const response = reply(message);
    assert.match(response, /tocca gli ingredienti/);
    assert.match(response, /Usa la mia dispensa/);
    assert.match(response, /Scegli liberamente/);
    assert.match(response, /restano in questo browser/);
    const html = assistant({
      state: { chat: [{ role: "assistant", text: response }] },
      chatBusy: false,
    });
    assert.match(html, /href="#frigo"/);
  }
});
test("Recipe requests explain search, the temporary checklist and the diary form", () => {
  for (const message of ["una ricetta?", "Come apro le ricette?"]) {
    const response = reply(message);
    assert.match(response, /pagina Ricette/);
    assert.match(response, /Vedi ricetta/);
    assert.match(response, /spuntare i passi/);
    assert.match(response, /si azzerano alla ricarica/);
    assert.match(response, /Racconta questo pasto/);
    assert.match(response, /non aggiungono automaticamente/);
    const html = assistant({
      state: { chat: [{ role: "assistant", text: response }] },
      chatBusy: false,
    });
    assert.match(html, /href="#ricette"/);
  }
});
test("Medical words take priority over plate, pantry and recipe requests", () => {
  const medicalResponse = reply("glicemia");
  for (const message of [
    "Un piatto più vario per la glicemia",
    "Come uso il frigo con i farmaci?",
    "La mia dispensa e l’insulina",
    "Una ricetta per il diabete",
  ]) {
    assert.equal(reply(message), medicalResponse);
    const html = assistant({
      state: { chat: [{ role: "assistant", text: reply(message) }] },
      chatBusy: false,
    });
    assert.doesNotMatch(html, /href="#(?:piatto|frigo|ricette)"/);
  }
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
    "1 minuto di pausa",
  );
  assert.equal(entryDetails({ type: "movement", minutes: 1 }), "1 minuto");
  assert.equal(
    entryDetails({ type: "mindful", minutes: 3 }),
    "3 minuti di pausa",
  );
});
