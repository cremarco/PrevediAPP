import test from "node:test";
import assert from "node:assert/strict";
import { initialState, localDate } from "../assets/data.js";
import {
  initialRisk,
  initialSession,
  advanceRisk,
  backRisk,
  riskProgress,
  openQuiz,
  resumeQuiz,
  restartQuiz,
} from "../assets/js/session.js";
import { quiz, risk } from "../assets/js/views/learning.js";

test("Presented gestational question starts without an answer and cannot advance blank", () => {
  const session = initialRisk();
  advanceRisk(session, "45");
  advanceRisk(session, "female");
  assert.equal(session.step, 2);
  assert.equal(session.answers.gestational, "");
  const previous = structuredClone(session);
  assert.throws(() => advanceRisk(session, ""), /Scegli una risposta/);
  assert.deepEqual(session, previous);
  const screen = risk({ ui: { risk: session } });
  assert.doesNotMatch(screen, /name="answer"[^>]*checked/);
});

test("Skipped male answer is cleared when returning to the female branch", () => {
  const session = initialRisk();
  advanceRisk(session, "30");
  advanceRisk(session, "male");
  assert.equal(session.step, 3);
  assert.equal(session.answers.gestational, "no");
  assert.equal(session.gestationalSkipped, true);
  assert.deepEqual(riskProgress(session), { step: 3, total: 6 });
  backRisk(session);
  assert.equal(session.step, 1);
  advanceRisk(session, "female");
  assert.equal(session.step, 2);
  assert.equal(session.answers.gestational, "");
  assert.equal(session.gestationalSkipped, false);
  assert.deepEqual(riskProgress(session), { step: 3, total: 7 });
});

test("Explicit female answers survive back navigation but a changed branch needs a fresh answer", () => {
  const session = initialRisk();
  advanceRisk(session, "55");
  advanceRisk(session, "female");
  advanceRisk(session, "yes");
  backRisk(session);
  assert.equal(session.answers.gestational, "yes");
  backRisk(session);
  advanceRisk(session, "female");
  assert.equal(session.answers.gestational, "yes");
  backRisk(session);
  advanceRisk(session, "male");
  assert.equal(session.answers.gestational, "no");
  backRisk(session);
  advanceRisk(session, "female");
  assert.equal(session.answers.gestational, "");
});

test("Risk progress has no skipped number in either applicable branch", () => {
  for (const sex of ["male", "female"]) {
    const session = initialRisk();
    advanceRisk(session, "45");
    advanceRisk(session, sex);
    const positions = [riskProgress(session).step];
    if (sex === "female") {
      advanceRisk(session, "no");
      positions.push(riskProgress(session).step);
    }
    for (const answer of ["no", "no", "yes"]) {
      advanceRisk(session, answer);
      positions.push(riskProgress(session).step);
    }
    const total = sex === "male" ? 6 : 7;
    assert.deepEqual(
      positions,
      Array.from({ length: total - 2 }, (_, index) => index + 3),
    );
    assert.equal(riskProgress(session).total, total);
    assert.match(
      risk({ ui: { risk: session } }),
      new RegExp(`Passo ${total} di ${total}`),
    );
  }
});

test("Quiz navigation preserves checked answers and accumulated score until explicit restart", () => {
  const ui = initialSession();
  const current = openQuiz(ui, "alimentazione");
  assert.equal(current.paused, false);
  Object.assign(current, { index: 1, choice: 2, checked: true, correct: 1 });
  openQuiz(ui, "sonno");
  assert.equal(ui.quiz.paused, false);
  openQuiz(ui, "alimentazione");
  assert.equal(ui.quiz, current);
  assert.equal(ui.quiz.paused, true);
  assert.equal(ui.quiz.index, 1);
  assert.equal(ui.quiz.choice, 2);
  assert.equal(ui.quiz.checked, true);
  assert.equal(ui.quiz.correct, 1);
  const screen = quiz({ state: initialState(), ui });
  assert.match(screen, /Riprendi il quiz/);
  assert.match(screen, /La risposta è già verificata/);
  resumeQuiz(ui);
  assert.equal(ui.quiz.paused, false);
  assert.equal(ui.quiz.checked, true);
  assert.equal(ui.quiz.correct, 1);
  const replacement = restartQuiz(ui);
  assert.notEqual(replacement, current);
  assert.equal(replacement.index, 0);
  assert.equal(replacement.correct, 0);
  assert.equal(ui.quizzes.alimentazione, replacement);
});

test("Quizzes remain independent and revisiting a completed attempt does not restart it", () => {
  const ui = initialSession();
  openQuiz(ui, "stress");
  Object.assign(ui.quiz, { choice: 0, checked: true, correct: 1 });
  const stress = ui.quiz;
  openQuiz(ui, "attivita");
  Object.assign(ui.quiz, { finished: true, index: 2, correct: 2 });
  const completed = ui.quiz;
  openQuiz(ui, "stress");
  assert.equal(ui.quiz, stress);
  restartQuiz(ui);
  openQuiz(ui, "attivita");
  assert.equal(ui.quiz, completed);
  assert.equal(ui.quiz.finished, true);
  assert.equal(ui.quiz.paused, false);
});

test("Quiz copy distinguishes a collected daily reward and one correct answer", () => {
  const state = initialState();
  const ui = initialSession();
  assert.match(quiz({ state, ui }), /\+20 foglie al termine/);
  state.awards.push({
    id: "quiz:alimentazione",
    date: localDate(),
    points: 20,
  });
  const replay = quiz({ state, ui });
  assert.match(replay, /Foglie di oggi già raccolte/);
  assert.doesNotMatch(replay, /\+20 foglie al termine/);
  Object.assign(ui.quiz, { finished: true, correct: 1 });
  const result = quiz({ state, ui });
  assert.match(result, /1 risposta corretta su 3/);
  assert.doesNotMatch(result, /1 risposte corrette/);
  assert.match(result, /senza un altro premio oggi/);
  assert.match(result, /id="quiz-result" tabindex="-1"/);
});
