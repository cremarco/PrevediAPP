// Content adapted from the exported Stitch pages, using the app's local services.
// Timed sessions use the second Mindfulness variant (10, 15 and 5 minutes).
const catalogue = (items) =>
  Object.freeze(items.map((item) => Object.freeze(item)));

export const exercises = catalogue([
  {
    id: "collo",
    label: "Rotazioni del collo",
    description: "Scegli movimenti piccoli e comodi, senza forzare.",
    icon: "user",
  },
  {
    id: "braccia",
    label: "Allungamento braccia",
    description: "Dedica un momento alla parte superiore del corpo.",
    icon: "sun",
  },
  {
    id: "gambe",
    label: "Piegamenti leggeri",
    description: "Muoviti al tuo ritmo, nel modo che ti è confortevole.",
    icon: "bolt",
  },
  {
    id: "respiro",
    label: "Respirazione profonda",
    description: "Osserva un respiro naturale, senza trattenerlo o forzarlo.",
    icon: "face-smile",
  },
]);

export const sleepRoutine = catalogue([
  {
    id: "schermi",
    label: "Mettere in pausa gli schermi",
    description: "Scegli un momento per lasciare da parte telefono e tablet.",
    icon: "moon",
  },
  {
    id: "luce",
    label: "Preparare un ambiente tranquillo",
    description: "Sistema luce, suoni e spazio secondo le tue preferenze.",
    icon: "sun",
  },
  {
    id: "lettura",
    label: "Fare spazio a un gesto rilassante",
    description: "Un libro, una pausa o un’attività che ti piace.",
    icon: "book-open",
  },
]);

export const meditations = catalogue([
  {
    id: "pace",
    title: "Pace Interiore",
    minutes: 10,
    category: "guidata",
    categoryLabel: "Riflessione",
    description:
      "Un tempo tranquillo da dedicare a te, con piccoli spunti scritti.",
    prompt:
      "Trova una posizione comoda. Nota come ti senti, senza cercare di cambiare nulla.",
    closing:
      "Se la mente si distrae, puoi tornare con calma a ciò che stai osservando.",
    icon: "heart",
  },
  {
    id: "bosco",
    title: "Bosco Incantato",
    minutes: 15,
    category: "natura",
    categoryLabel: "Natura",
    description:
      "Una pausa per osservare l’ambiente o immaginare un luogo familiare.",
    prompt:
      "Scegli un dettaglio intorno a te: un colore, una forma o un suono presente nella stanza.",
    closing:
      "Dedica qualche istante a quel dettaglio. Puoi scegliere un altro punto quando vuoi.",
    icon: "sun",
  },
  {
    id: "respiro",
    title: "Respiro Profondo",
    minutes: 5,
    category: "respiro",
    categoryLabel: "Respiro",
    description: "Cinque minuti per seguire il tuo respiro, al tuo ritmo.",
    prompt:
      "Osserva il respiro così com’è. Non serve rallentarlo, renderlo più profondo o trattenerlo.",
    closing:
      "Puoi interrompere la pausa in qualsiasi momento e riprendere quando ti va.",
    icon: "face-smile",
  },
]);

const validIds = (values, items) =>
  Array.isArray(values)
    ? [...new Set(values)].filter((id) => items.some((item) => item.id === id))
    : [];

export const validExerciseIds = (values) => validIds(values, exercises);
export const validRoutineIds = (values) => validIds(values, sleepRoutine);
export const exerciseLabel = (values) =>
  validExerciseIds(values)
    .map((id) => exercises.find((exercise) => exercise.id === id).label)
    .join(", ");

export const validExerciseMinutes = (value) => {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 180
    ? minutes
    : null;
};

export const safeSession = (id) =>
  meditations.find((session) => session.id === id) || meditations[0];
