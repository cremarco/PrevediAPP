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
  gestational: "no",
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
});
export const initialRisk = () => ({
  step: 0,
  result: null,
  answers: initialRiskAnswers(),
});
export const initialSession = () => ({
  diary: { date: localDate(), filter: "all" },
  plate: { items: [], message: "", meal: "Pranzo" },
  progress: { category: "movement", period: 7 },
  community: { editing: "", draft: "" },
  quiz: initialQuiz(),
  risk: initialRisk(),
});
