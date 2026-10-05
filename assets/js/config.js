// Route names and navigation are one shared contract.
export const routeNames = {
  percorso: "Il mio percorso",
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
