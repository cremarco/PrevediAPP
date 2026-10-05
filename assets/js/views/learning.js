import { localDate, quizSets } from "../../data.js";
import {
  icon,
  esc,
  heading,
  avatar,
  card,
  field,
  illustration,
} from "../ui/components.js";

import { riskQuestions, riskProgress } from "../session.js";

export function quiz({ state, ui }) {
  const {
    category: quizCategory,
    index: quizIndex,
    choice: quizChoice,
    checked: quizChecked,
    correct: quizCorrect,
    finished: quizFinished,
    paused: quizPaused,
  } = ui.quiz;
  const set = quizSets[quizCategory],
    q = set.questions[quizIndex];
  const rewardedToday = state.awards.some(
    (award) =>
      award.id === "quiz:" + quizCategory && award.date === localDate(),
  );
  if (quizFinished)
    return `<div class="mx-auto max-w-3xl">${heading("Un’idea nuova da portare con te.", "Il tuo quiz è completo.")}${card("", `<div class="flex flex-col items-center gap-5 py-4 text-center"><figure>${illustration("diario", "size-28 sm:size-36")}</figure><h2 id="quiz-result" tabindex="-1">${quizCorrect === set.questions.length ? "Hai coltivato nuove conoscenze." : "Ogni domanda è un’occasione."}</h2><p>${quizCorrect} ${quizCorrect === 1 ? "risposta corretta" : "risposte corrette"} su ${set.questions.length}.</p>${rewardedToday ? `<p class="text-sm text-base-content/85">Le 20 foglie di oggi per questo quiz sono nel giardino. Puoi riprovare per imparare, senza un altro premio oggi.</p>` : ""}</div>`, `<a class="btn btn-primary" href="#${quizCategory}">Torna al tuo percorso ${icon("arrow-right")}</a><button class="btn btn-ghost" data-action="quiz-restart">Riprova il quiz</button><a class="btn btn-outline" href="#progressi">Le mie scoperte</a>`)}</div>`;
  if (quizPaused)
    return `<div class="mx-auto max-w-3xl">${heading(set.title, "Il tuo tentativo ti aspetta.")}${card("Riprendi la tua scoperta.", `<p>Ti eri fermato alla domanda ${quizIndex + 1} di ${set.questions.length}. ${quizChecked ? "La risposta è già verificata: potrai continuare da qui." : "Le risposte già verificate e il tuo avanzamento sono conservati."}</p><p class="text-sm text-base-content/85">Il tentativo resta disponibile durante la navigazione in questa scheda. Ricaricare o chiudere la pagina lo interrompe.</p>`, `<button class="btn btn-primary" data-action="quiz-resume">Riprendi il quiz ${icon("arrow-right")}</button><button class="btn btn-outline" data-action="quiz-restart">Ricomincia</button><a class="btn btn-ghost" href="#${quizCategory}">Esci dal quiz</a>`)}</div>`;
  const options = q.a
    .map((a, i) => {
      let skin =
        quizChoice === i ? "btn-outline btn-primary btn-active" : "btn-outline";
      if (quizChecked && i === q.correct)
        skin =
          "btn-success btn-soft disabled:bg-success/10 disabled:text-success";
      else if (quizChecked && quizChoice === i)
        skin = "btn-error btn-soft disabled:bg-error/10 disabled:text-error";
      return `<button class="btn h-auto min-h-16 w-full justify-start gap-3 px-4 py-4 text-left font-normal whitespace-normal ${skin}" data-action="quiz-choose" data-index="${i}" aria-pressed="${quizChoice === i}" ${quizChecked ? "disabled" : ""}><span class="badge badge-ghost shrink-0">${String.fromCharCode(65 + i)}</span><span class="flex-1">${a}</span>${quizChecked && i === q.correct ? icon("check") : ""}</button>`;
    })
    .join("");
  const body = `<div class="flex flex-wrap items-center justify-between gap-3 text-sm"><span id="quiz-step">Domanda ${quizIndex + 1} di ${set.questions.length}</span><a class="link link-hover" href="#${quizCategory}">Esci dal quiz</a></div><progress class="progress progress-primary w-full" value="${quizIndex}" max="${set.questions.length}" aria-label="Avanzamento del quiz"></progress><h2 id="quiz-question" tabindex="-1" aria-describedby="quiz-step">${q.q}</h2><div class="grid gap-3">${options}</div>${quizChecked ? `<div class="alert alert-soft ${quizChoice === q.correct ? "alert-success" : "alert-info"}" role="status">${icon(quizChoice === q.correct ? "check" : "information-circle")}<div><strong class="block mb-2">${quizChoice === q.correct ? "Esatto, proprio così." : "Una nuova cosa da scoprire."}</strong>${q.why}</div></div>` : ""}`;
  const actions = `<span class="badge badge-soft badge-accent h-auto min-h-6 whitespace-normal py-1 text-accent-content mr-auto">${icon("star", "size-4")}${rewardedToday ? "Foglie di oggi già raccolte" : "+20 foglie al termine"}</span><button class="btn btn-primary h-auto min-h-11 py-2 whitespace-normal" data-action="${quizChecked ? "quiz-next" : "quiz-check"}" ${quizChoice === null ? "disabled" : ""}>${quizChecked ? (quizIndex === set.questions.length - 1 ? "Concludi il quiz" : "Prossima domanda") : "Verifica risposta"}${icon("arrow-right")}</button>`;
  return `<div class="mx-auto max-w-3xl">${heading(set.title, "Tre domande, una piccola scoperta.")}${card("", body, actions)}</div>`;
}

export function risk({ ui }) {
  const { step: riskStep, result: riskResult, answers: riskAnswers } = ui.risk;
  if (riskResult) {
    const body = `${avatar(icon("information-circle"))}<h2 id="risk-result" tabindex="-1">${riskResult.high ? "Il test segnala un rischio aumentato." : "Il punteggio è inferiore alla soglia di rischio aumentato."}</h2><p>Punteggio: <strong>${riskResult.score}</strong>. La soglia del test CDC è 5. ${riskResult.high ? "Parlane con il tuo medico, che può valutare un esame della glicemia." : "Un punteggio inferiore a 5 non esclude il prediabete. Se hai dubbi o altri fattori di rischio, parlane con il medico."}</p><div class="alert alert-warning alert-soft text-warning-content" role="note">${icon("information-circle")}<span>Questo questionario educativo non è una diagnosi. È una traduzione del test statunitense CDC; non è stato validato come strumento clinico per questa app o per la popolazione italiana.</span></div><a class="link link-hover text-sm" href="https://www.cdc.gov/diabetes/widgets/risktest/how-your-test-is-scored.html" target="_blank" rel="noopener noreferrer">Metodo e punteggio del test CDC</a>`;
    return `<div class="mx-auto max-w-3xl">${heading("Il tuo risultato orientativo.", "Un punto di partenza per una conversazione con il medico.")}${card("", body, `<button class="btn btn-outline" data-action="risk-restart">Ripeti il test</button><a href="#percorso" class="btn btn-primary">Il mio percorso</a>`)}</div>`;
  }
  const q = riskQuestions[riskStep];
  const progress = riskProgress(ui.risk);
  const bodyFields =
    q.key === "body"
      ? `<div class="grid gap-4 sm:grid-cols-2">${field("Altezza (cm)", `<input class="input border-secondary/75 placeholder:text-base-content/85 w-full" name="height" type="number" min="100" max="230" step="1" value="${esc(riskAnswers.height)}" required inputmode="decimal">`)}${field("Peso (kg)", `<input class="input border-secondary/75 placeholder:text-base-content/85 w-full" name="weight" type="number" min="30" max="300" step="0.1" value="${esc(riskAnswers.weight)}" required inputmode="decimal">`)}</div><label class="label mt-3 gap-3 whitespace-normal text-sm text-base-content"><input class="checkbox checkbox-primary border-secondary/75 checked:border-primary shrink-0" type="checkbox" name="asian" ${riskAnswers.asian ? "checked" : ""}><span>Sono di origine asiatica <span class="text-xs text-base-content/85">(soglia BMI CDC specifica)</span></span></label>`
      : q.options
          .map(
            ([value, label]) =>
              `<label class="label cursor-pointer gap-3 rounded-field border border-base-300 p-4 whitespace-normal text-base-content has-checked:border-primary has-checked:bg-primary/5"><input class="radio radio-primary border-secondary/75 checked:border-primary shrink-0" type="radio" name="answer" value="${value}" ${riskAnswers[q.key] === value ? "checked" : ""} required><span>${label}</span></label>`,
          )
          .join("");
  const body = `<div class="flex flex-wrap items-center justify-between gap-3 text-sm"><span id="risk-step">Passo ${progress.step} di ${progress.total}</span><a href="#profilo" class="link link-hover">Esci dal test</a></div><progress class="progress progress-primary w-full" value="${progress.step - 1}" max="${progress.total}" aria-label="Avanzamento del test"></progress><form id="risk-form"><fieldset class="fieldset gap-4"><legend id="risk-question" tabindex="-1" aria-describedby="risk-step" class="fieldset-legend pb-5 font-serif text-xl font-medium whitespace-normal">${q.q}</legend>${bodyFields}${q.note ? `<p class="text-xs text-base-content/85">${q.note}</p>` : ""}</fieldset><p class="alert alert-error alert-soft mt-4 empty:hidden" id="risk-error" role="alert"></p><div class="card-actions mt-6 justify-between"><button type="button" class="btn btn-outline" data-action="risk-back" ${riskStep === 0 ? "disabled" : ""}>${icon("arrow-left")}Indietro</button><button class="btn btn-primary">${riskStep === riskQuestions.length - 1 ? "Mostra il risultato" : "Continua"}${icon("arrow-right")}</button></div></form><p class="text-xs text-base-content/85">Il test non fornisce una diagnosi. <a class="link link-hover" href="#informazioni">Informazioni e fonti</a></p>`;
  return `<div class="mx-auto max-w-3xl">${heading("Conosci il test del rischio.", "Fino a 7 passi · circa 2 minuti · risposte conservate solo durante il test")}${card("", body)}</div>`;
}
