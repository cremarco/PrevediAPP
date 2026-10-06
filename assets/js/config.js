// Route names and navigation are one shared contract.
export const routeNames = {
  percorso: "Il mio percorso",
  inizio: "Iniziamo insieme",
  "conosci-pigna": "Conosci Pigna",
  "guida-alimentazione": "Mangia con equilibrio",
  ricette: "Ricette e benessere",
  ricetta: "La tua ricetta",
  "ricerca-alimento": "Cerca un alimento",
  mercato: "Il mercato del bosco",
  giochi: "Gioca e impara",
  "frigo-sano": "Frigo Sano",
  impara: "Le tue scoperte",
  "dettaglio-attivita": "Dettaglio attività fisica",
  "diario-attivita": "Diario attività fisica",
  risveglio: "Risveglio muscolare",
  "luce-blu": "La tua routine serale",
  benessere: "Benessere e riposo",
  meditazione: "Meditazione e mindfulness",
  sessione: "La tua pausa",
  gruppi: "Gruppi della community",
  gruppo: "Il tuo gruppo",
  sfide: "Sfide della community",
  "giardino-community": "Giardino della community",
  evoluzione: "Evoluzione di Alberello",
  ricompense: "Le tue ricompense",
  glucosio: "Registro del glucosio",
  alimentazione: "Alimentazione",
  attivita: "Attività fisica",
  sonno: "Sonno",
  stress: "Stress e benessere",
  diario: "Il mio diario",
  giardino: "Il mio giardino",
  assistente: "Parla con Pigna",
  community: "Community",
  progressi: "I miei progressi",
  profilo: "Il mio profilo",
  quiz: "Gioca e impara",
  piatto: "Crea il piatto",
  frigo: "Il frigo della salute",
  rischio: "Test del rischio",
  notifiche: "Notifiche",
  informazioni: "Informazioni e fonti",
};
export const mainNav = [
  ["percorso", "home", "Il mio percorso"],
  ["giardino", "sun", "Il mio giardino"],
  ["diario", "calendar-days", "Il mio diario"],
  ["progressi", "chart-bar", "I miei progressi"],
];
export const wellnessNav = [
  ["alimentazione", "chart-pie", "Alimentazione"],
  ["attivita", "bolt", "Attività fisica"],
  ["sonno", "moon", "Sonno"],
  ["stress", "face-smile", "Stress e benessere"],
];
export const communityNav = [
  ["community", "user-group", "Community"],
  ["assistente", "chat-bubble-left-right", "Parla con Pigna"],
];
export const dockNav = [
  ["percorso", "home", "Percorso"],
  ["giardino", "sun", "Giardino"],
  ["assistente", "chat-bubble-left-right", "Pigna"],
  ["community", "user-group", "Community"],
  ["profilo", "user", "Profilo"],
];
export const wellnessPalette = {
  alimentazione: {
    surface: "bg-primary/15",
    avatar: "bg-primary/15 text-primary",
    icon: "text-primary",
  },
  attivita: {
    surface: "bg-accent/25",
    avatar: "bg-accent/25 text-secondary",
    icon: "text-secondary",
  },
  sonno: {
    surface: "bg-info/15",
    avatar: "bg-info/15 text-info",
    icon: "text-info",
  },
  stress: {
    surface: "bg-secondary/15",
    avatar: "bg-secondary/15 text-secondary",
    icon: "text-secondary",
  },
};
export const entryCategory = {
  meal: "alimentazione",
  movement: "attivita",
  sleep: "sonno",
  mindful: "stress",
  water: "alimentazione",
};

export const routeParents = Object.fromEntries([
  ...[
    "piatto",
    "frigo",
    "guida-alimentazione",
    "ricette",
    "ricetta",
    "ricerca-alimento",
    "mercato",
    "giochi",
    "frigo-sano",
  ].map((id) => [id, "alimentazione"]),
  ...["dettaglio-attivita", "diario-attivita", "risveglio"].map((id) => [
    id,
    "attivita",
  ]),
  ["luce-blu", "sonno"],
  ...["benessere", "meditazione", "sessione"].map((id) => [id, "stress"]),
  ...["gruppi", "gruppo", "sfide", "giardino-community"].map((id) => [
    id,
    "community",
  ]),
  ...["ricompense", "evoluzione"].map((id) => [id, "giardino"]),
  ...[
    "inizio",
    "conosci-pigna",
    "rischio",
    "notifiche",
    "informazioni",
    "impara",
    "glucosio",
  ].map((id) => [id, "percorso"]),
]);
export const exploreNav = [
  ["inizio", "sun", "Iniziamo insieme"],
  ["impara", "book-open", "Le tue scoperte"],
  ["benessere", "face-smile", "Benessere e riposo"],
  ["ricompense", "gift", "Le tue ricompense"],
  ["glucosio", "chart-bar", "Registro del glucosio"],
];
