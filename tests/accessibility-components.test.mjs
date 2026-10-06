import test from "node:test";
import assert from "node:assert/strict";
import { initialState, quizSets, rewards } from "../assets/data.js";
import { initialSession, riskQuestions } from "../assets/js/session.js";
import { recipes } from "../assets/js/nutrition-catalog.js";
import { quiz, risk } from "../assets/js/views/learning.js";
import {
  fridgeGame,
  recipeList,
  learningHub,
} from "../assets/js/views/food-discovery.js";
import { rewardCollections } from "../assets/js/views/forest-discovery.js";
import { garden, dashboard } from "../assets/js/views/journey.js";
import {
  ingredientPicker,
  plateBoard,
} from "../assets/js/ui/nutrition-widgets.js";
import { practiceSteps, pauseSummary } from "../assets/js/ui/guided-widgets.js";
import { esc, entryList } from "../assets/js/ui/components.js";

test("Quiz verification explains the correct answer and identifies each checked option without color", () => {
  const state = initialState(),
    ui = initialSession(),
    question = quizSets[ui.quiz.category].questions[0];
  ui.quiz.choice = (question.correct + 1) % question.a.length;
  ui.quiz.checked = true;
  const html = quiz({ state, ui });
  assert.ok(
    html.includes(
      `La risposta corretta è: ${esc(question.a[question.correct])}.`,
    ),
  );
  assert.match(html, /risposta scelta, non corretta/);
  assert.match(html, /risposta corretta<\/span>/);
  assert.match(html, /role="group" aria-labelledby="quiz-question"/);
  assert.match(html, /aria-valuetext="1 di 3 risposte verificate"/);
});

test("Fridge game offers an untimed mode and removes countdown semantics during that mode", () => {
  const ui = initialSession();
  const intro = fridgeGame({ ui });
  assert.match(intro, /data-action="fridge-game-start" data-mode="timed"/);
  assert.match(intro, /data-action="fridge-game-start" data-mode="untimed"/);
  assert.match(intro, /role="timer" aria-live="off"/);
  assert.match(intro, /aria-valuetext="30 secondi rimasti"/);
  Object.assign(ui.discovery.fridgeGame, { started: true, untimed: true });
  const untimed = fridgeGame({ ui });
  assert.match(untimed, /Senza limite di tempo/);
  assert.match(untimed, /3 tentativi rimasti/);
  assert.doesNotMatch(untimed, /id="fridge-game-(time|progress)"/);
  assert.match(untimed, /role="group" aria-labelledby="fridge-question"/);
  ui.discovery.fridgeGame.finished = true;
  assert.match(
    fridgeGame({ ui }),
    /data-action="fridge-game-start" data-mode="untimed"/,
  );
});

test("Repeated discovery and reward actions keep their specific subject in the accessible name", () => {
  const state = initialState(),
    ui = initialSession();
  const recipeHtml = recipeList({ state, ui });
  for (const recipe of recipes)
    assert.ok(
      recipeHtml.includes(
        `Vedi ricetta<span class="sr-only">: ${esc(recipe.name)}`,
      ),
    );
  for (const set of Object.values(quizSets))
    assert.ok(
      learningHub({ state, ui }).includes(
        `il quiz<span class="sr-only">: ${esc(set.title)}`,
      ),
    );
  const rewardsHtml = rewardCollections({ state, ui });
  for (const reward of rewards)
    assert.ok(
      rewardsHtml.includes(
        `aria-label="Sblocca la ricompensa: ${esc(reward.name)}"`,
      ),
    );
  state.claimed = [rewards[0].id];
  state.decoration = rewards[0].id;
  assert.ok(
    garden({ state }).includes(
      `aria-label="In uso ${esc(rewards[0].name)}" aria-pressed="true"`,
    ),
  );
});

test("Plate filters describe the target and mismatched portions retain their actual food group", () => {
  const picker = ingredientPicker([], "protein");
  assert.match(
    picker,
    /aria-pressed="true" aria-controls="plate-foods-target"/,
  );
  assert.match(
    picker,
    /id="plate-foods-target"[^>]*role="group" aria-label="Ingredienti del gruppo proteine"/,
  );
  assert.match(
    plateBoard(["pollo", "salmone", "quinoa", "broccoli"]),
    /Rimuovi una porzione di Salmone dal settore Verdure 2, porzione del gruppo proteine/,
  );
});

test("Routine progress and risk question help expose completion and required field meaning", () => {
  assert.equal(
    (practiceSteps({ phase: "complete" }).match(/ · completato/g) || []).length,
    4,
  );
  const ui = initialSession();
  ui.risk.step = 1;
  assert.match(risk({ ui }), /aria-describedby="risk-required risk-note"/);
  assert.match(risk({ ui }), /id="risk-note"/);
  ui.risk.step = riskQuestions.findIndex((question) => question.key === "body");
  const html = risk({ ui });
  assert.match(html, /id="risk-height"/);
  assert.match(html, /id="risk-weight"/);
  assert.match(html, /Altezza e peso sono obbligatori/);
  assert.match(
    dashboard({ state: initialState() }),
    /piccoli passi completati oggi"/,
  );
});

test("Diary actions name implicit entries and a running pause summary keeps its timer out of a live status", () => {
  const entries = entryList([
    { id: "water-1", type: "water", date: "2026-10-06" },
    { id: "sleep-1", type: "sleep", date: "2026-10-06", hours: 7 },
  ]);
  assert.match(
    entries,
    /aria-label="Modifica Un bicchiere d’acqua, 1 bicchiere del 2026-10-06"/,
  );
  assert.match(entries, /aria-label="Elimina Il mio riposo, 7 ore/);
  const summary = pauseSummary({
    route: "meditazione",
    title: "La tua pausa",
    running: true,
    remaining: 45,
  });
  assert.match(summary, /role="note" data-pause-summary-route=/);
  assert.match(summary, /role="timer" aria-live="off"/);
  assert.doesNotMatch(summary, /role="status"/);
});
