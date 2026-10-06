import { normalizedReadings } from "./js/glucose.js";
// Product data and pure domain rules. No personal data or network requests.
export const KEY = "prevediapp.v1";
const dayFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export const localDate = (date = new Date()) => dayFormatter.format(date);
export const initialState = () => ({
  version: 1,
  name: "",
  goals: { movement: 30, sleep: 8, water: 8 },
  entries: [],
  awards: [],
  claimed: [],
  joined: [],
  watered: [],
  likes: [],
  chat: [],
  fridge: [],
  posts: [],
  quizHistory: [],
  recipeFavorites: [],
  foodSearches: [],
  pantryExtras: [],
  joinedChallenges: [],
  sleepRoutine: [],
  sleepReminder: { enabled: false, time: "21:30" },
  glucoseReadings: [],
  decoration: "none",
  onboarded: false,
  notificationsRead: false,
  notificationsReadDate: "",
});
export const missions = [
  {
    id: "meal",
    icon: "chart-pie",
    title: "Un pasto, un passo avanti",
    description: "Aggiungi un pasto al tuo diario.",
    points: 20,
    route: "alimentazione",
    action: "Registra pasto",
  },
  {
    id: "movement",
    icon: "bolt",
    title: "Trova il tuo ritmo",
    description: "Dedica un po’ di tempo al movimento.",
    points: 25,
    route: "attivita",
    action: "Registra attività",
  },
  {
    id: "mindful",
    icon: "face-smile",
    title: "Un momento per te",
    description: "Completa una breve pausa di respirazione.",
    points: 15,
    route: "stress",
    action: "Fai una pausa",
  },
  {
    id: "sleep",
    icon: "moon",
    title: "Dai spazio al riposo",
    description: "Racconta come hai dormito.",
    points: 20,
    route: "sonno",
    action: "Registra sonno",
  },
];
export const foods = [
  { id: "broccoli", name: "Broccoli", group: "vegetables" },
  { id: "spinaci", name: "Spinaci", group: "vegetables" },
  { id: "pomodori", name: "Pomodori", group: "vegetables" },
  { id: "quinoa", name: "Quinoa", group: "carbs" },
  { id: "riso", name: "Riso integrale", group: "carbs" },
  { id: "pane", name: "Pane integrale", group: "carbs" },
  { id: "salmone", name: "Salmone", group: "protein" },
  { id: "pollo", name: "Pollo", group: "protein" },
  { id: "tofu", name: "Tofu", group: "protein" },
];
export const quizSets = {
  alimentazione: {
    title: "Mangia con equilibrio",
    questions: [
      {
        q: "Nel metodo del piatto, quanto spazio è dedicato alle verdure non amidacee?",
        a: ["Un quarto", "Metà del piatto", "Tutto il piatto"],
        correct: 1,
        why: "Il modello del piatto dedica metà alle verdure non amidacee, un quarto alle proteine e un quarto ai carboidrati.",
      },
      {
        q: "Quale alimento è una fonte di proteine vegetali?",
        a: ["Tofu", "Olio d’oliva", "Riso"],
        correct: 0,
        why: "Il tofu è un alimento a base di soia che apporta proteine vegetali.",
      },
      {
        q: "Quale scelta aggiunge varietà al pasto?",
        a: [
          "Eliminare sempre i carboidrati",
          "Combinare verdure, proteine e cereali",
          "Mangiare un solo alimento",
        ],
        correct: 1,
        why: "Combinare gruppi alimentari diversi aiuta a comporre un pasto vario. Le esigenze individuali vanno discusse con un professionista.",
      },
    ],
  },
  attivita: {
    title: "Muoviti, un passo alla volta",
    questions: [
      {
        q: "Quale attività può essere un buon punto di partenza?",
        a: [
          "Una camminata al proprio ritmo",
          "Allenarsi senza pause",
          "Solo sport agonistico",
        ],
        correct: 0,
        why: "Una camminata adattata alle proprie capacità è un modo accessibile per iniziare a muoversi.",
      },
      {
        q: "Come puoi spezzare il tempo trascorso seduto?",
        a: [
          "Restare seduto più a lungo",
          "Alzarti e muoverti quando puoi",
          "Saltare il pranzo",
        ],
        correct: 1,
        why: "Piccole pause di movimento possono aiutarti a ridurre lunghi periodi consecutivi da seduto.",
      },
      {
        q: "Come scegliere un’attività sostenibile?",
        a: [
          "Quella più intensa a ogni costo",
          "Quella che piace e si adatta alle proprie capacità",
          "Cambiarla ogni giorno per forza",
        ],
        correct: 1,
        why: "Piacere, accessibilità e gradualità aiutano a mantenere una routine. Adatta l’attività alle indicazioni del tuo curante.",
      },
    ],
  },
  sonno: {
    title: "Conosci il tuo riposo",
    questions: [
      {
        q: "Cosa può aiutare a costruire una routine serale?",
        a: [
          "Orari regolari",
          "Cambiare orario ogni sera",
          "Lavorare fino all’ultimo minuto",
        ],
        correct: 0,
        why: "Orari abbastanza regolari aiutano a rendere prevedibile il momento del riposo.",
      },
      {
        q: "Quale ambiente favorisce una pausa tranquilla?",
        a: [
          "Molto rumoroso",
          "Calmo e confortevole",
          "Con tutte le notifiche attive",
        ],
        correct: 1,
        why: "Un ambiente tranquillo e confortevole può facilitare il rilassamento.",
      },
      {
        q: "A cosa serve registrare il sonno?",
        a: [
          "A diagnosticare una malattia",
          "A riconoscere le proprie abitudini",
          "A sostituire una visita",
        ],
        correct: 1,
        why: "Il diario aiuta a osservare abitudini e sensazioni. Non è uno strumento diagnostico.",
      },
    ],
  },
  stress: {
    title: "Fai spazio a te",
    questions: [
      {
        q: "Durante una pausa di respirazione, come dovrebbe essere il respiro?",
        a: [
          "Naturale e confortevole",
          "Forzato il più possibile",
          "Sempre trattenuto",
        ],
        correct: 0,
        why: "Segui un respiro comodo, senza forzarlo. Puoi interrompere la pratica in qualsiasi momento.",
      },
      {
        q: "Quale gesto può creare una piccola pausa?",
        a: [
          "Rispondere a ogni notifica",
          "Ascoltare per un momento le proprie sensazioni",
          "Fare più cose insieme",
        ],
        correct: 1,
        why: "Fermarsi per osservare le sensazioni è un modo semplice per ritagliarsi un momento di attenzione.",
      },
      {
        q: "Se una pratica non ti fa stare bene, cosa puoi fare?",
        a: [
          "Insistere comunque",
          "Interromperla e scegliere un’alternativa",
          "Ignorare le sensazioni",
        ],
        correct: 1,
        why: "Puoi fermarti e trovare una pratica adatta a te. Il benessere personale viene prima di un obiettivo nell’app.",
      },
    ],
  },
};
export const rewards = [
  {
    id: "nest",
    name: "Un nido tra i rami",
    description: "Un piccolo rifugio per il tuo Alberello.",
    cost: 60,
    icon: "home",
    image: "assets/images/reward-nest-v2.webp",
  },
  {
    id: "mushrooms",
    name: "Un angolo di sottobosco",
    description: "Funghi e nuove storie ai piedi dell’albero.",
    cost: 100,
    icon: "gift",
    image: "assets/images/reward-mushrooms-v2.webp",
  },
  {
    id: "stars",
    name: "Una notte di stelle",
    description: "Una luce gentile nel tuo giardino.",
    cost: 160,
    icon: "sparkles",
    image: "assets/images/reward-stars-v2.webp",
  },
  {
    id: "birdhouse",
    name: "Casetta per uccellini",
    description: "Un nuovo rifugio virtuale per il bosco.",
    cost: 120,
    icon: "home",
    theme: "nature",
    image: "assets/images/reward-birdhouse-v2.webp",
    preview: true,
  },
  {
    id: "pinecones",
    name: "Pigne rugiadose",
    description: "Un dettaglio del bosco da portare nel giardino.",
    cost: 140,
    icon: "gift",
    theme: "nature",
    image: "assets/images/reward-pinecones-v2.webp",
    preview: true,
  },
  {
    id: "scarf",
    name: "Sciarpa invernale",
    description: "Un piccolo accessorio per la collezione d’inverno.",
    cost: 150,
    icon: "gift",
    theme: "winter",
    image: "assets/images/reward-scarf-v2.webp",
    preview: true,
  },
  {
    id: "ice",
    name: "Cristalli di ghiaccio",
    description: "Un bagliore d’inverno per il tuo giardino virtuale.",
    cost: 200,
    icon: "sparkles",
    theme: "winter",
    image: "assets/images/reward-ice-v2.webp",
    preview: true,
  },
  {
    id: "snow",
    name: "Manto di neve",
    description: "Una piccola scena d’inverno nel bosco.",
    cost: 180,
    icon: "cloud",
    theme: "winter",
    image: "assets/images/reward-snow-v2.webp",
    preview: true,
  },
  {
    id: "fox",
    name: "Volpe artica",
    description: "Una compagna virtuale per la collezione invernale.",
    cost: 250,
    icon: "heart",
    theme: "winter",
    image: "assets/images/reward-fox-v2.webp",
    preview: true,
  },
];
export function dayEntries(state, date = localDate()) {
  return state.entries.filter((e) => e.date === date);
}
export function missionDone(state, id, date = localDate()) {
  return dayEntries(state, date).some((e) => e.type === id);
}
export function totalPoints(state) {
  return state.awards.reduce((sum, a) => sum + a.points, 0);
}
export function availablePoints(state) {
  return (
    totalPoints(state) -
    state.claimed.reduce(
      (sum, id) => sum + (rewards.find((r) => r.id === id)?.cost || 0),
      0,
    )
  );
}
export function award(state, id, points, date = localDate()) {
  if (state.awards.some((a) => a.id === id && a.date === date)) return false;
  state.awards.push({ id, points, date });
  return true;
}
export function addEntry(state, entry, date = localDate()) {
  state.entries.push({
    ...entry,
    id: globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random(),
    date,
    createdAt: new Date().toISOString(),
  });
  const mission = missions.find((m) => m.id === entry.type);
  if (mission) award(state, "mission:" + entry.type, mission.points, date);
}
export function claimReward(state, id) {
  const reward = rewards.find((r) => r.id === id);
  if (
    !reward ||
    state.claimed.includes(id) ||
    availablePoints(state) < reward.cost
  )
    return false;
  state.claimed.push(id);
  state.decoration = id;
  return true;
}
export function plateBalance(items) {
  const groups = { vegetables: 0, carbs: 0, protein: 0 };
  items.forEach((id) => {
    const f = foods.find((f) => f.id === id);
    if (f) groups[f.group]++;
  });
  const n = Object.values(groups).reduce((a, b) => a + b, 0);
  return {
    groups,
    percent: Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [
        k,
        n ? Math.round((v / n) * 100) : 0,
      ]),
    ),
    balanced:
      n === 4 &&
      groups.vegetables === 2 &&
      groups.carbs === 1 &&
      groups.protein === 1,
  };
}
export function riskScore({
  age,
  sex,
  gestational,
  family,
  pressure,
  active,
  height,
  weight,
  asian,
}) {
  const bmi = weight / (height / 100) ** 2;
  if (
    !Number.isFinite(bmi) ||
    height < 100 ||
    height > 230 ||
    weight < 30 ||
    weight > 300
  )
    throw new Error("Inserisci altezza e peso validi.");
  const score =
    (age >= 60 ? 3 : age >= 50 ? 2 : age >= 40 ? 1 : 0) +
    (sex === "male" ? 1 : gestational ? 1 : 0) +
    (family ? 1 : 0) +
    (pressure ? 1 : 0) +
    (active ? 0 : 1) +
    (bmi >= 40 ? 3 : bmi >= 30 ? 2 : bmi >= (asian ? 23 : 25) ? 1 : 0);
  return { score, bmi, high: score >= 5 };
}
export function parseState(raw) {
  const blank = initialState();
  if (!raw) return blank;
  const value = JSON.parse(raw);
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.entries) ||
    !Array.isArray(value.awards)
  )
    throw new Error("Formato di salvataggio non valido.");
  const state = { ...blank, ...value };
  state.name = typeof state.name === "string" ? state.name.slice(0, 40) : "";
  for (const key of [
    "entries",
    "awards",
    "claimed",
    "joined",
    "watered",
    "likes",
    "chat",
    "fridge",
    "posts",
    "quizHistory",
  ])
    if (!Array.isArray(state[key])) state[key] = [];
  state.awards = state.awards.filter(
    (a) =>
      a &&
      typeof a.id === "string" &&
      typeof a.date === "string" &&
      Number.isFinite(a.points) &&
      a.points >= 0,
  );
  state.entries = state.entries.filter(
    (e) =>
      e &&
      typeof e.id === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
      ["meal", "movement", "sleep", "mindful", "water"].includes(e.type),
  );
  // Older valid v1 saves retain their fields; malformed optional records cannot crash a screen.
  state.chat = state.chat
    .filter(
      (m) =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.text === "string",
    )
    .slice(-40);
  state.posts = state.posts
    .filter(
      (post) =>
        post &&
        typeof post.id === "string" &&
        typeof post.text === "string" &&
        post.text.trim(),
    )
    .slice(-20)
    .map((post) => ({
      id: post.id,
      text: post.text.slice(0, 400),
      createdAt: typeof post.createdAt === "string" ? post.createdAt : "",
    }));
  state.quizHistory = state.quizHistory
    .filter(
      (item) =>
        item &&
        Object.hasOwn(quizSets, item.category) &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
        Number.isInteger(item.correct) &&
        item.correct >= 0 &&
        item.correct <= 3,
    )
    .slice(-200)
    .map((item) => ({
      category: item.category,
      date: item.date,
      correct: item.correct,
    }));
  for (const key of ["claimed", "joined", "watered", "likes", "fridge"])
    state[key] = [
      ...new Set(state[key].filter((id) => typeof id === "string")),
    ];
  state.claimed = state.claimed.filter((id) =>
    rewards.some((r) => r.id === id),
  );
  state.fridge = state.fridge.filter((id) => foods.some((f) => f.id === id));
  const ids = (value, allowed) =>
    Array.isArray(value)
      ? [...new Set(value)].filter((id) => allowed.includes(id))
      : [];
  state.joined = ids(state.joined, [
    "walkers",
    "cooks",
    "meditation",
    "breathing",
  ]);
  state.joinedChallenges = ids(state.joinedChallenges, [
    "mindful-week",
    "movement-week",
    "meal-week",
    "water-today",
  ]);
  state.recipeFavorites = ids(state.recipeFavorites, [
    "quinoa",
    "salmone",
    "hummus",
  ]);
  state.pantryExtras = ids(state.pantryExtras, [
    "mela-rossa",
    "mela-verde",
    "mirtilli",
    "ceci",
    "noci",
    "yogurt",
    "avena",
    "farro",
    "uova",
    "carote",
    "zucchine",
    "succo-mela",
  ]);
  state.sleepRoutine = ids(state.sleepRoutine, ["schermi", "luce", "lettura"]);
  state.foodSearches = Array.isArray(state.foodSearches)
    ? [
        ...new Set(
          state.foodSearches
            .filter((item) => typeof item === "string")
            .map((item) => item.trim().slice(0, 80))
            .filter(Boolean),
        ),
      ].slice(0, 8)
    : [];
  state.sleepReminder = {
    enabled: state.sleepReminder?.enabled === true,
    time: /^([01]\d|2[0-3]):[0-5]\d$/.test(state.sleepReminder?.time)
      ? state.sleepReminder.time
      : "21:30",
  };
  state.glucoseReadings = normalizedReadings(
    state.glucoseReadings,
    localDate(),
  );
  if (
    Object.hasOwn(value, "glucoseReadings") &&
    (!Array.isArray(value.glucoseReadings) ||
      value.glucoseReadings.length !== state.glucoseReadings.length)
  )
    throw new Error(
      "Le misurazioni salvate non sono leggibili. Conserva il file originale prima di recuperare il percorso.",
    );
  state.decoration = state.claimed.includes(state.decoration)
    ? state.decoration
    : "none";
  state.onboarded = state.onboarded === true;
  state.notificationsRead = state.notificationsRead === true;
  state.notificationsReadDate =
    typeof state.notificationsReadDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(state.notificationsReadDate)
      ? state.notificationsReadDate
      : "";
  const g = state.goals || {};
  state.goals = {
    movement: Math.max(5, Math.min(180, Number(g.movement) || 30)),
    sleep: Math.max(4, Math.min(12, Number(g.sleep) || 8)),
    water: Math.max(1, Math.min(20, Number(g.water) || 8)),
  };
  return state;
}
