// Content adapted from the exported Stitch pages, using the app's local services.
// Timed sessions use the second Mindfulness variant (10, 15 and 5 minutes).
const catalogue = (items) =>
  Object.freeze(items.map((item) => Object.freeze(item)));

export const exercises = catalogue([
  {
    id: "collo",
    label: "Rotazioni del collo",
    description: "Scegli movimenti piccoli e comodi, senza forzare.",
    cue: "Scegli movimenti piccoli e comodi, senza forzare. Osserva il gesto al tuo ritmo e fermati quando vuoi.",
    pause:
      "Lascia il movimento e ritrova una posizione comoda. Non serve completare il gesto.",
    icon: "user",
  },
  {
    id: "braccia",
    label: "Allungamento braccia",
    description: "Dedica un momento alla parte superiore del corpo.",
    cue: "Dedica un momento alla parte superiore del corpo. Scegli un gesto che ti è familiare e comodo, senza forzare.",
    pause:
      "Lascia le braccia in una posizione comoda. Il prossimo gesto può aspettare.",
    icon: "sun",
  },
  {
    id: "gambe",
    label: "Piegamenti leggeri",
    description: "Muoviti al tuo ritmo, nel modo che ti è confortevole.",
    cue: "Muoviti al tuo ritmo, nel modo che ti è confortevole. Puoi scegliere un movimento piccolo o saltare questo gesto.",
    pause:
      "Interrompi il movimento e ritrova una posizione comoda. Riprendi soltanto quando ti va.",
    icon: "bolt",
  },
  {
    id: "respiro",
    label: "Respirazione profonda",
    description: "Osserva un respiro naturale, senza trattenerlo o forzarlo.",
    cue: "Osserva un respiro naturale, senza trattenerlo o forzarlo. Non serve renderlo più profondo.",
    pause: "Il tuo respiro può restare così com’è. Prenditi il tempo che vuoi.",
    icon: "face-smile",
  },
]);

export const sleepRoutine = catalogue([
  {
    id: "schermi",
    label: "Mettere in pausa gli schermi",
    description: "Scegli un momento per lasciare da parte telefono e tablet.",
    cue: "Scegli un momento per lasciare da parte telefono e tablet. Puoi adattare questo gesto alla tua sera.",
    pause: "Non c’è fretta. Il gesto resta qui quando vorrai riprendere.",
    icon: "moon",
  },
  {
    id: "luce",
    label: "Preparare un ambiente tranquillo",
    description: "Sistema luce, suoni e spazio secondo le tue preferenze.",
    cue: "Osserva la stanza e sistema luce, suoni e spazio secondo le tue preferenze.",
    pause: "Ritrova una posizione comoda nello spazio che hai scelto.",
    icon: "sun",
  },
  {
    id: "lettura",
    label: "Fare spazio a un gesto rilassante",
    description: "Un libro, una pausa o un’attività che ti piace.",
    cue: "Scegli un libro, una pausa o un’attività che ti piace. Dedicale il tempo che vuoi, senza una durata da raggiungere.",
    pause: "Puoi lasciare l’attività e riprendere quando ti va.",
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
    preparation:
      "Trova una posizione comoda. Puoi tenere gli occhi aperti e interrompere quando vuoi.",
    stages: Object.freeze([
      Object.freeze({
        at: 0,
        title: "Nota come ti senti",
        text: "Nota come ti senti, senza cercare di cambiare nulla.",
      }),
      Object.freeze({
        at: 0.4,
        title: "Torna con calma",
        text: "Se la mente si distrae, puoi tornare con calma a ciò che stai osservando.",
      }),
      Object.freeze({
        at: 0.8,
        title: "Un istante per te",
        text: "Dedica un istante a come ti senti. Alla fine potrai tornare alle tue attività al tuo ritmo.",
      }),
    ]),
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
    preparation:
      "Trova una posizione comoda e osserva l’ambiente intorno a te. Non serve immaginare un luogo diverso.",
    stages: Object.freeze([
      Object.freeze({
        at: 0,
        title: "Scegli un dettaglio",
        text: "Scegli un dettaglio intorno a te: un colore, una forma o un suono presente nella stanza.",
      }),
      Object.freeze({
        at: 0.4,
        title: "Resta a osservare",
        text: "Dedica qualche istante a quel dettaglio. Puoi scegliere un altro punto quando vuoi.",
      }),
      Object.freeze({
        at: 0.8,
        title: "Ritrova l’ambiente",
        text: "Nota di nuovo lo spazio intorno a te. Alla fine potrai tornare alle tue attività al tuo ritmo.",
      }),
    ]),
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
    preparation:
      "Trova una posizione comoda. Segui il tuo respiro così com’è, senza rallentarlo o trattenerlo.",
    stages: Object.freeze([
      Object.freeze({
        at: 0,
        title: "Osserva il respiro",
        text: "Osserva il respiro così com’è. Non serve rallentarlo, renderlo più profondo o trattenerlo.",
      }),
      Object.freeze({
        at: 0.4,
        title: "Al tuo ritmo",
        text: "Puoi continuare a osservare il respiro naturale o interrompere la pausa quando ti va.",
      }),
      Object.freeze({
        at: 0.8,
        title: "Riparti con calma",
        text: "Nota come ti senti e lascia il respiro al suo ritmo. Alla fine potrai tornare alle tue attività.",
      }),
    ]),
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
