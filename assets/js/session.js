import { initialFridgeGame } from "./nutrition-catalog.js";
import { localDate } from "../data.js";

export const riskQuestions = [
  {
    key: "age",
    q: "Qual è la tua fascia d’età?",
    options: [
      ["30", "Meno di 40 anni"],
      ["45", "40–49 anni"],
      ["55", "50–59 anni"],
      ["65", "60 anni o più"],
    ],
  },
  {
    key: "sex",
    q: "Quale categoria del test CDC ti rappresenta?",
    options: [
      ["male", "Uomo"],
      ["female", "Donna"],
    ],
    note: "Il questionario originale usa queste due categorie per il punteggio. Non è uno strumento personalizzato per ogni situazione.",
  },
  {
    key: "gestational",
    q: "Hai mai avuto una diagnosi di diabete gestazionale?",
    options: [
      ["yes", "Sì"],
      ["no", "No / non applicabile"],
    ],
  },
  {
    key: "family",
    q: "Un genitore, fratello o sorella ha il diabete?",
    options: [
      ["yes", "Sì"],
      ["no", "No"],
    ],
  },
  {
    key: "pressure",
    q: "Ti è mai stata diagnosticata la pressione alta?",
    options: [
      ["yes", "Sì"],
      ["no", "No"],
    ],
  },
  {
    key: "active",
    q: "Fai attività fisica?",
    options: [
      ["yes", "Sì"],
      ["no", "No"],
    ],
  },
  {
    key: "body",
    q: "Quali sono la tua altezza e il tuo peso?",
    note: "Servono a calcolare l’indice di massa corporea per il punteggio CDC. Le risposte non vengono conservate nel diario.",
  },
];

export const initialRiskAnswers = () => ({
  age: "",
  sex: "",
  gestational: "",
  family: "",
  pressure: "",
  active: "",
  height: "",
  weight: "",
  asian: false,
});
export const initialQuiz = (category = "alimentazione") => ({
  category,
  index: 0,
  choice: null,
  checked: false,
  correct: 0,
  finished: false,
  paused: false,
});
export const initialRisk = () => ({
  step: 0,
  result: null,
  gestationalSkipped: false,
  answers: initialRiskAnswers(),
});

// Incomplete quizzes belong to this tab, independently of the current route.
export function openQuiz(ui, category) {
  const quiz = ui.quizzes[category] ?? initialQuiz(category);
  quiz.paused =
    !quiz.finished && (quiz.index > 0 || quiz.choice !== null || quiz.checked);
  ui.quizzes[category] = quiz;
  ui.quiz = quiz;
  return quiz;
}

export function resumeQuiz(ui) {
  ui.quiz.paused = false;
  return ui.quiz;
}

export function restartQuiz(ui) {
  const quiz = initialQuiz(ui.quiz.category);
  ui.quizzes[quiz.category] = quiz;
  ui.quiz = quiz;
  return quiz;
}

// Preserve the provenance of the skipped answer, so a later branch change
// cannot turn a system-assigned "no" into an apparent personal answer.
export function advanceRisk(risk, answer) {
  const question = riskQuestions[risk.step];
  if (!question?.options?.some(([value]) => value === answer))
    throw new Error("Scegli una risposta prima di continuare.");
  risk.answers[question.key] = answer;
  if (question.key === "sex") {
    if (answer === "male") {
      risk.answers.gestational = "no";
      risk.gestationalSkipped = true;
    } else {
      if (risk.gestationalSkipped) risk.answers.gestational = "";
      risk.gestationalSkipped = false;
    }
  } else if (question.key === "gestational") {
    risk.gestationalSkipped = false;
  }
  risk.step++;
  if (risk.step === 2 && risk.answers.sex === "male") risk.step++;
  return risk;
}

export function backRisk(risk) {
  if (risk.step > 0) risk.step--;
  if (risk.step === 2 && risk.answers.sex === "male") risk.step--;
  return risk;
}

export function riskProgress(risk) {
  const steps = riskQuestions.filter(
    (question) => question.key !== "gestational" || risk.answers.sex !== "male",
  );
  return {
    step: steps.indexOf(riskQuestions[risk.step]) + 1,
    total: steps.length,
  };
}

export const initialSession = () => {
  const quiz = initialQuiz();
  return {
    diary: { date: localDate(), filter: "all" },
    discovery: {
      query: "",
      category: "all",
      recipe: "quinoa",
      recipeQuery: "",
      recipeFilter: "all",
      fridgeGame: initialFridgeGame(),
    },
    guided: {
      exerciseIds: [],
      exerciseMinutes: 5,
      routine: [],
      sessionId: "pace",
      category: "tutte",
    },
    social: {
      query: "",
      category: "all",
      groupId: "walkers",
      friendsQuery: "",
    },
    forest: { theme: "all" },
    learning: { category: "all" },
    glucose: { period: 7, editing: "" },
    plate: { items: [], message: "", meal: "Pranzo" },
    progress: { category: "movement", period: 7 },
    community: { editing: "", draft: "" },
    quiz,
    quizzes: { [quiz.category]: quiz },
    risk: initialRisk(),
  };
};
