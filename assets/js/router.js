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
  return {
    view,
    category: quizCategories.has(category) ? category : "alimentazione",
    skipToMain: hash === "#main",
  };
}

// Explicit imports let esbuild create route chunks and preserve relative GitHub Pages URLs.
const loaders = {
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
