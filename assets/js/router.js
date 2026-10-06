import { routeNames } from "./config.js";

const quizCategories = new Set([
  "alimentazione",
  "attivita",
  "sonno",
  "stress",
]);

export function resolveRoute(hash) {
  const [requested, category] = hash.replace(/^#/, "").split("/");
  const view = Object.hasOwn(routeNames, requested) ? requested : "percorso";
  const detailed = ["ricetta", "gruppo", "sessione", "impara"].includes(view);
  const detail = /^[a-z0-9][a-z0-9-]{0,39}$/.test(category || "")
    ? category
    : "";
  return {
    ...(detailed ? { detail } : {}),
    view,
    category: quizCategories.has(category) ? category : "alimentazione",
    skipToMain: hash === "#main",
  };
}

// Explicit imports let esbuild create route chunks and preserve relative GitHub Pages URLs.
const loaders = {
  inizio: () => import("./views/guided.js").then((m) => m.onboarding),
  "conosci-pigna": () => import("./views/guided.js").then((m) => m.pignaIntro),
  "guida-alimentazione": () =>
    import("./views/food-discovery.js").then((m) => m.dietaryGuide),
  ricette: () => import("./views/food-discovery.js").then((m) => m.recipeList),
  ricetta: () =>
    import("./views/food-discovery.js").then((m) => m.recipeDetail),
  "ricerca-alimento": () =>
    import("./views/food-discovery.js").then((m) => m.foodSearch),
  mercato: () =>
    import("./views/food-discovery.js").then(
      (m) => (ctx) => m.foodSearch(ctx, true),
    ),
  giochi: () => import("./views/food-discovery.js").then((m) => m.foodGames),
  "frigo-sano": () =>
    import("./views/food-discovery.js").then((m) => m.fridgeGame),
  impara: () => import("./views/food-discovery.js").then((m) => m.learningHub),
  "dettaglio-attivita": () =>
    import("./views/guided.js").then((m) => m.movementDetail),
  "diario-attivita": () =>
    import("./views/explore.js").then((m) => m.movementDiary),
  risveglio: () => import("./views/guided.js").then((m) => m.wakeup),
  "luce-blu": () => import("./views/guided.js").then((m) => m.sleepGuide),
  benessere: () => import("./views/guided.js").then((m) => m.benessereHub),
  meditazione: () => import("./views/guided.js").then((m) => m.mindfulness),
  sessione: () =>
    import("./views/guided.js").then(
      (m) => (ctx) => m.guidedSession(ctx, ctx.ui.guided.sessionId),
    ),
  gruppi: () =>
    import("./views/social-discovery.js").then((m) => m.groupsCatalog),
  gruppo: () =>
    import("./views/social-discovery.js").then((m) => m.groupDetail),
  sfide: () => import("./views/social-discovery.js").then((m) => m.challenges),
  "giardino-community": () =>
    import("./views/social-discovery.js").then((m) => m.communityGarden),
  evoluzione: () =>
    import("./views/forest-discovery.js").then((m) => m.evolution),
  ricompense: () =>
    import("./views/forest-discovery.js").then((m) => m.rewardCollections),
  glucosio: () => import("./views/glucose.js").then((m) => m.glucose),
  percorso: () => import("./views/journey.js").then((m) => m.dashboard),
  giardino: () => import("./views/journey.js").then((m) => m.garden),
  progressi: () => import("./views/journey.js").then((m) => m.progress),
  alimentazione: () =>
    import("./views/wellness.js").then(
      (m) => (ctx) => m.wellness(ctx, "alimentazione"),
    ),
  attivita: () =>
    import("./views/wellness.js").then(
      (m) => (ctx) => m.wellness(ctx, "attivita"),
    ),
  sonno: () =>
    import("./views/wellness.js").then(
      (m) => (ctx) => m.wellness(ctx, "sonno"),
    ),
  stress: () => import("./views/wellness.js").then((m) => m.stress),
  diario: () => import("./views/wellness.js").then((m) => m.diary),
  piatto: () => import("./views/nutrition.js").then((m) => m.plate),
  frigo: () => import("./views/nutrition.js").then((m) => m.fridge),
  community: () => import("./views/community.js").then((m) => m.community),
  assistente: () => import("./views/assistant.js").then((m) => m.assistant),
  quiz: () => import("./views/learning.js").then((m) => m.quiz),
  rischio: () => import("./views/learning.js").then((m) => m.risk),
  profilo: () => import("./views/profile.js").then((m) => m.profile),
  notifiche: () => import("./views/profile.js").then((m) => m.notifications),
  informazioni: () => import("./views/profile.js").then((m) => m.info),
};

/** Cache successful loaders, but allow retry after a transient load failure. */
export function createScreenLoader(sources = loaders) {
  const cache = new Map();
  return function loadScreen(view) {
    if (!cache.has(view)) {
      const promise = sources[view]().catch((error) => {
        cache.delete(view);
        throw error;
      });
      cache.set(view, promise);
    }
    return cache.get(view);
  };
}
