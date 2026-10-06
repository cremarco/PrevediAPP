import { localDate } from "../data.js";
import { shiftDate, validDate } from "./records.js";

// Stitch's group and challenge concepts stay local; there are no real members or scores.
export const groupCategories = {
  all: "Tutti i temi",
  alimentazione: "Alimentazione",
  attivita: "Movimento",
  stress: "Mindfulness",
  sonno: "Sonno",
};

export const groups = [
  {
    id: "walkers",
    name: "Un passo nel verde",
    category: "attivita",
    icon: "bolt",
    description:
      "Idee per camminare e ritrovare un po’ di movimento, al tuo ritmo.",
    prompts: [
      "Scegli un percorso che ti piace e una durata adatta a te.",
      "Racconta nel diario il movimento che hai fatto, anche se è stato breve.",
    ],
    resources: [
      ["attivita", "bolt", "Il tuo movimento", "Registra le attività di oggi"],
      ["risveglio", "sun", "Risveglio muscolare", "Esplora una routine dolce"],
    ],
  },
  {
    id: "cooks",
    name: "Il piatto delle idee",
    category: "alimentazione",
    icon: "chart-pie",
    description:
      "Ingredienti di stagione, ricette e piccoli esperimenti in cucina.",
    prompts: [
      "Prova ad abbinare ingredienti di gruppi diversi nel gioco del piatto.",
      "Conserva una nota sul pasto che ti è piaciuto nel tuo diario.",
    ],
    resources: [
      [
        "ricette",
        "book-open",
        "Ricette salutari",
        "Trova un’idea per il pasto",
      ],
      ["piatto", "chart-pie", "Crea il piatto", "Esplora le proporzioni"],
    ],
  },
  {
    id: "meditation",
    name: "Meditazione del Bosco",
    category: "stress",
    icon: "face-smile",
    description:
      "Spunti per fare spazio alla calma e osservare le proprie sensazioni.",
    prompts: [
      "Trova un luogo comodo e un momento in cui non devi correre.",
      "Scegli una pausa breve e interrompila quando vuoi.",
    ],
    resources: [
      [
        "meditazione",
        "face-smile",
        "Meditazione e mindfulness",
        "Scegli una pausa guidata",
      ],
      ["stress", "moon", "Respira con Pigna", "Un ritmo confortevole per te"],
    ],
  },
  {
    id: "breathing",
    name: "Respirazione mattutina",
    category: "stress",
    icon: "sun",
    description: "Un piccolo momento di attenzione per cominciare la giornata.",
    prompts: [
      "Osserva il tuo respiro naturale, senza forzarlo o trattenerlo.",
      "Una pausa completata si ritrova nel diario, insieme agli altri piccoli gesti.",
    ],
    resources: [
      [
        "stress",
        "face-smile",
        "Una pausa con Pigna",
        "Uno, tre o cinque minuti",
      ],
      [
        "diario",
        "calendar-days",
        "Il tuo diario",
        "Ritrova le pause registrate",
      ],
    ],
  },
];

const searchable = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("it-IT");

export function filterGroups(query = "", category = "all") {
  const search = searchable(
    typeof query === "string" ? query.trim().slice(0, 80) : "",
  );
  const selected = Object.hasOwn(groupCategories, category) ? category : "all";
  return groups.filter(
    (group) =>
      (selected === "all" || group.category === selected) &&
      searchable(
        `${group.name} ${group.description} ${group.category} ${groupCategories[group.category]}`,
      ).includes(search),
  );
}

export const challenges = [
  {
    id: "mindful-week",
    title: "Sette giorni di mindfulness",
    description:
      "Racconta una pausa per te in ciascuno degli ultimi sette giorni.",
    type: "mindful",
    target: 7,
    unit: "giorni",
    measure: "days",
    period: 7,
    route: "meditazione",
    icon: "face-smile",
    scene: "stress",
  },
  {
    id: "movement-week",
    title: "Risveglio muscolare",
    description:
      "Trova un momento di movimento in tre giorni, con l’attività che preferisci.",
    type: "movement",
    target: 3,
    unit: "giorni",
    measure: "days",
    period: 7,
    route: "risveglio",
    icon: "bolt",
    scene: "attivita",
  },
  {
    id: "meal-week",
    title: "Cucina creativa e sana",
    description:
      "Registra cinque pasti negli ultimi sette giorni. Puoi accompagnarli con una nota.",
    type: "meal",
    target: 5,
    unit: "pasti",
    measure: "entries",
    period: 7,
    route: "ricette",
    icon: "chart-pie",
    scene: "alimentazione",
  },
  {
    id: "water-today",
    title: "Un sorso alla volta",
    description:
      "Osserva i bicchieri registrati oggi rispetto al tuo obiettivo personale.",
    type: "water",
    unit: "bicchieri",
    measure: "entries",
    period: 1,
    route: "alimentazione",
    icon: "beaker",
    scene: "alimentazione",
  },
];

/** Count actual records in the displayed period; joining never creates progress. */
export function challengeProgress(state, id, today = localDate()) {
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge || !validDate(today)) return null;
  const start = shiftDate(today, 1 - challenge.period);
  const seen = new Set();
  const entries = (Array.isArray(state.entries) ? state.entries : []).filter(
    (entry) => {
      if (
        !entry ||
        entry.type !== challenge.type ||
        typeof entry.id !== "string" ||
        !entry.id ||
        seen.has(entry.id) ||
        !validDate(entry.date) ||
        entry.date < start ||
        entry.date > today ||
        (["movement", "mindful"].includes(entry.type) &&
          (!Number.isFinite(Number(entry.minutes)) ||
            Number(entry.minutes) <= 0))
      )
        return false;
      seen.add(entry.id);
      return true;
    },
  );
  const current =
    challenge.measure === "days"
      ? new Set(entries.map((entry) => entry.date)).size
      : entries.length;
  const configured = Number(state.goals?.water);
  const target =
    challenge.type === "water"
      ? Math.max(
          1,
          Math.min(
            20,
            Number.isFinite(configured) && configured > 0
              ? Math.ceil(configured)
              : 8,
          ),
        )
      : challenge.target;
  return {
    id,
    current,
    target,
    percent: Math.min(100, Math.round((current / target) * 100)),
    done: current >= target,
    unit: challenge.unit,
    period: challenge.period,
    route: challenge.route,
    detail: challenge.period === 1 ? "oggi" : "negli ultimi 7 giorni",
  };
}

export const communityPeople = [
  {
    id: "anna",
    name: "Anna",
    description: "Una passeggiata alla volta",
    avatar: "assets/images/avatar-anna.webp",
  },
  {
    id: "marco",
    name: "Marco",
    description: "Nuove idee in cucina",
    avatar: "assets/images/avatar-marco.webp",
  },
  {
    id: "elena",
    name: "Elena",
    description: "Un momento di calma ogni giorno",
    avatar: "assets/images/avatar-elena.webp",
  },
];
