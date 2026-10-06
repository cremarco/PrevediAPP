import {
  KEY,
  localDate,
  foods,
  quizSets,
  dayEntries,
  totalPoints,
  award,
  addEntry,
  claimReward,
  plateBalance,
  riskScore,
} from "../data.js";
import {
  routeNames,
  mainNav,
  wellnessNav,
  communityNav,
  dockNav,
  routeParents,
  exploreNav,
} from "./config.js";
import { icon, heading, card } from "./ui/components.js";
import { entryDialog, backupDialog, dialogHeading } from "./ui/dialogs.js";
import { createStore } from "./store.js";
import {
  initialSession,
  openQuiz,
  resumeQuiz,
  restartQuiz,
  advanceRisk,
  backRisk,
  initialRisk,
  riskQuestions,
} from "./session.js";
import { createTimer, formatTime } from "./timer.js";
import { createBreathingMotion } from "./breathing.js";
import { createWidgetMotion } from "./widget-motion.js";
import { createPineMotion } from "./pine-motion.js";
import { createConversation } from "./conversation.js";
import { resolveRoute, createScreenLoader } from "./router.js";
import { diaryCSV, download } from "./export.js";
import {
  validateEntry,
  updateEntry,
  removeRecord,
  restoreRecord,
  savePost,
  shiftDate,
  validDate,
} from "./records.js";
import { habitLabels, pantryPlate } from "./insights.js";
import {
  catalogFoods,
  foodCategories,
  recipes,
  recipeById,
  initialFridgeGame,
  answerFridgeGame,
} from "./nutrition-catalog.js";
import {
  exercises,
  sleepRoutine,
  meditations,
  safeSession,
  validExerciseIds,
  exerciseLabel,
  validExerciseMinutes,
  validRoutineIds,
} from "./guided-content.js";
import { groups, groupCategories, challenges } from "./social-catalog.js";
import {
  GLUCOSE_LIMIT,
  validateReading,
  normalizedReadings,
  glucoseReport,
  glucoseCSV,
} from "./glucose.js";

// DOM ownership, navigation and delegated events live here; screens remain pure renderers.
const $ = (selector) => document.querySelector(selector);
const elements = {
  main: $("#main"),
  desktopNav: $("#desktop-nav"),
  mobileNav: $("#mobile-nav"),
  dialog: $("#entry-dialog"),
  dialogContent: $("#dialog-content"),
  drawer: $("#app-drawer"),
  drawerTrigger: $("[data-drawer-trigger]"),
  breadcrumb: $("#breadcrumb"),
  date: $("#header-date"),
  headerInitial: $("#header-initial"),
  sidebarInitial: $("#sidebar-initial"),
  sidebarName: $("#sidebar-name"),
  notificationDot: $("#notification-dot"),
  storageNotice: $("#storage-notice"),
  storageMessage: $("#storage-message"),
  storageActions: $("#storage-actions"),
  storageRecover: $("#storage-recover"),
  toast: $("#toast"),
  toastMessage: $("#toast-message"),
  toastUndo: $("#toast-undo"),
  toastDay: $("#toast-day"),
};
const store = createStore(() => localStorage);
const ui = initialSession();
const loadScreen = createScreenLoader();
const headerFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Rome",
});
let view = "percorso";
let renderer;
let navigationVersion = 0;
let chromeRoute, chromeName, chromeDay;
let toastTimeout;
let chatResizeObserver;
let undoAction;
let pendingBackup;
let backupVersion = 0;

function storageBanner() {
  elements.storageNotice.hidden = !store.problem;
  elements.storageMessage.textContent = store.problem;
  elements.storageActions.hidden = !store.recoveryRequired;
  elements.storageRecover.hidden = store.recoveryReason !== "existing";
}
function persist() {
  const saved = store.save();
  storageBanner();
  return saved;
}
function toast(message, undo = null) {
  clearTimeout(toastTimeout);
  undoAction = undo;
  elements.toastDay.hidden = true;
  elements.toastUndo.hidden = !undo;
  elements.toastMessage.textContent = message;
  elements.toast.hidden = false;
  toastTimeout = setTimeout(
    () => {
      elements.toast.hidden = true;
      undoAction = null;
    },
    undo ? 12000 : 4500,
  );
}
function navLink([id, symbol, label], mobile = false) {
  const parent =
    view === "quiz" ? ui.quiz.category : routeParents[view] || view;
  const active =
    view === id ||
    parent === id ||
    (mobile &&
      id === "percorso" &&
      !["giardino", "assistente", "community", "profilo"].includes(parent));
  const current = active
    ? `aria-current="${view === id ? "page" : "location"}"`
    : "";
  return mobile
    ? `<button class="${active ? "dock-active text-primary" : ""}" data-action="navigate" data-route="${id}" ${current}>${icon(symbol)}<span class="dock-label">${label}</span></button>`
    : `<li><a href="#${id}" class="min-h-11 ${active ? "menu-active bg-primary text-primary-content" : ""}" ${current}>${icon(symbol)}${label}</a></li>`;
}
function exploreMenu() {
  const open =
    $("#explore-menu")?.open ||
    exploreNav.some(([id]) => id === view) ||
    view === "sessione";
  return `<li><details id="explore-menu" ${open ? "open" : ""}><summary class="min-h-11">${icon("magnifying-glass")}Esplora</summary><ul>${exploreNav.map((item) => navLink(item)).join("")}</ul></details></li>`;
}
function chrome() {
  const routeKey =
    view === "quiz"
      ? `quiz/${ui.quiz.category}`
      : view === "ricetta"
        ? `ricetta/${ui.discovery.recipe}`
        : view === "gruppo"
          ? `gruppo/${ui.social.groupId}`
          : view === "sessione"
            ? `sessione/${ui.guided.sessionId}`
            : view;
  if (chromeRoute !== routeKey) {
    elements.desktopNav.innerHTML = `<ul class="menu w-full gap-1 px-0">${mainNav.map((x) => navLink(x)).join("")}${exploreMenu()}<li class="menu-title mt-3 text-base-content/85">Il tuo benessere</li>${wellnessNav.map((x) => navLink(x)).join("")}<li class="menu-title mt-3 text-base-content/85">Insieme</li>${communityNav.map((x) => navLink(x)).join("")}</ul>`;
    elements.mobileNav.innerHTML = dockNav
      .map((x) => navLink(x, true))
      .join("");
    elements.breadcrumb.textContent = routeNames[view];
    document.title = `${routeNames[view]} · PREVEDIApp`;
    document.querySelectorAll('a[href="#profilo"]').forEach((element) => {
      if (
        element.closest("header") ||
        element.hasAttribute("data-profile-nav")
      ) {
        if (view === "profilo") element.setAttribute("aria-current", "page");
        else element.removeAttribute("aria-current");
      }
    });
    const notificationsLink = document.querySelector(
      'header a[href="#notifiche"]',
    );
    if (view === "notifiche")
      notificationsLink.setAttribute("aria-current", "page");
    else notificationsLink.removeAttribute("aria-current");
    chromeRoute = routeKey;
  }
  if (chromeName !== store.state.name) {
    const initial = (store.state.name || "P").slice(0, 1).toUpperCase();
    elements.headerInitial.textContent = initial;
    elements.sidebarInitial.textContent = initial;
    elements.sidebarName.textContent = store.state.name || "Il tuo spazio";
    chromeName = store.state.name;
  }
  const day = localDate();
  if (chromeDay !== day) {
    elements.date.textContent = headerFormatter.format(new Date());
    chromeDay = day;
  }
  elements.notificationDot.hidden =
    !!store.state.notificationsRead &&
    (!store.state.notificationsReadDate ||
      store.state.notificationsReadDate === day);
  storageBanner();
}
function rememberFocus() {
  const active = document.activeElement;
  if (active?.dataset?.action)
    return {
      action: active.dataset.action,
      id: active.dataset.id,
      index: active.dataset.index,
      duration: active.dataset.duration,
      text: active.dataset.text,
    };
  return active?.id ? { elementId: active.id } : null;
}
function restoreFocus(info) {
  if (!info) return;
  let target;
  if (info.elementId) target = document.getElementById(info.elementId);
  else {
    let selector = `[data-action="${CSS.escape(info.action)}"]`;
    for (const key of ["id", "index", "duration", "text"])
      if (info[key] !== undefined)
        selector += `[data-${key}="${CSS.escape(info[key])}"]`;
    target = document.querySelector(selector);
  }
  if (target && !target.disabled) target.focus({ preventScroll: true });
  else if (
    elements.main.contains(document.activeElement) ||
    document.activeElement === document.body
  )
    elements.main.focus({ preventScroll: true });
}
function focusStep(selector) {
  const target = $(selector);
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "center", behavior: "instant" });
}
function allowWrite() {
  store.prepareWrite();
  storageBanner();
  if (!store.recoveryRequired) return true;
  if (elements.dialog.open) {
    showDialogError(
      "Le modifiche sono sospese perché il salvataggio è protetto. La bozza resta in questa finestra. Puoi annullare per conservare il file originale e scegliere come recuperare il percorso.",
    );
    focusStep("#dialog-error");
  } else {
    toast(
      "Le modifiche sono sospese. Conserva il file originale e scegli come recuperare il percorso.",
    );
    focusStep("#storage-message");
  }
  return false;
}
function fitChatLog(log) {
  let pinned = true,
    width = log.clientWidth,
    height = log.clientHeight;
  log.scrollTop = log.scrollHeight;
  log.addEventListener(
    "scroll",
    () => {
      if (log.clientWidth === width && log.clientHeight === height)
        pinned = log.scrollHeight - log.clientHeight - log.scrollTop <= 24;
    },
    { passive: true },
  );
  chatResizeObserver = new ResizeObserver(() => {
    if (pinned) log.scrollTop = log.scrollHeight;
    width = log.clientWidth;
    height = log.clientHeight;
  });
  chatResizeObserver.observe(log);
}
function render(focus = false) {
  if (!renderer) {
    storageBanner();
    return;
  }
  const focusInfo = rememberFocus();
  chrome();
  chatResizeObserver?.disconnect();
  breathingMotion.clear();
  widgetMotion.clear();
  elements.main.innerHTML = renderer({
    state: store.state,
    ui,
    timer: timer.snapshot(),
    guidedTimer: guidedTimers.get(ui.guided.sessionId)?.snapshot(),
    fridgeTimer: fridgeTimer.snapshot(),
    chatBusy: conversation.busy,
    recoveryRequired: store.recoveryRequired,
    breathing: breathingMotion.settings(),
  });
  breathingMotion.mount();
  if (view === "assistente") fitChatLog($("#messages"));
  if (focus) {
    window.scrollTo({ top: 0, behavior: "instant" });
    elements.main.focus({ preventScroll: true });
  } else restoreFocus(focusInfo);
  syncPineDetails();
}
async function navigate() {
  const route = resolveRoute(location.hash);
  if (route.skipToMain) {
    elements.main.focus();
    return;
  }
  const request = ++navigationVersion;
  elements.dialog.close();
  elements.drawer.checked = false;
  syncDrawer();
  elements.main.setAttribute("aria-busy", "true");
  try {
    const nextRenderer = await loadScreen(route.view);
    if (request !== navigationVersion) return;
    view = route.view;
    renderer = nextRenderer;
    if (view === "quiz") openQuiz(ui, route.category);
    if (view === "ricetta") ui.discovery.recipe = recipeById(route.detail).id;
    if (view === "gruppo")
      ui.social.groupId =
        groups.find((group) => group.id === route.detail)?.id || groups[0].id;
    if (view === "sessione") ui.guided.sessionId = safeSession(route.detail).id;
    if (view === "impara")
      ui.learning.category = Object.hasOwn(quizSets, route.detail)
        ? route.detail
        : "all";
    render(true);
  } catch {
    if (request !== navigationVersion) return;
    view = route.view;
    renderer = () =>
      heading(
        routeNames[view],
        "Questa schermata non è disponibile. Riprova.",
      ) +
      card(
        "",
        '<button class="btn btn-primary" data-action="retry-screen">Riprova</button>',
      );
    render(true);
  } finally {
    if (request === navigationVersion)
      elements.main.removeAttribute("aria-busy");
  }
}
function openEntry(type, id = "") {
  const entry = id ? store.state.entries.find((item) => item.id === id) : null;
  if (id && !entry) return;
  if (entry) type = entry.type;
  if (
    ![
      "meal",
      "movement",
      "sleep",
      "water",
      ...(entry ? ["mindful"] : []),
    ].includes(type)
  )
    return;
  elements.dialogContent.innerHTML = entryDialog(
    type,
    view === "diario" ? ui.diary.date : localDate(),
    entry,
  );
  showDialog();
}
function openMeal(label, notes = "") {
  openEntry("meal");
  const form = $("#entry-form");
  if (!form) return;
  form.elements.label.value = label;
  form.elements.notes.value = notes;
  form.elements.label.focus();
}

function togglePreference(collection, id) {
  const selected = store.state[collection];
  store.state[collection] = selected.includes(id)
    ? selected.filter((item) => item !== id)
    : [...selected, id];
}
function updatePantry(id) {
  if (!catalogFoods().some((food) => food.id === id)) return false;
  togglePreference(
    foods.some((food) => food.id === id) ? "fridge" : "pantryExtras",
    id,
  );
  return true;
}
function captureGlucoseDraft() {
  const form = $("#glucose-form");
  if (form) {
    ui.glucose.draft = Object.fromEntries(new FormData(form));
    ui.glucose.detailsOpen = !!$("#glucose-details")?.open;
  }
}
function showGlucoseError(message) {
  const error = $("#glucose-error");
  if (!error) return;
  error.hidden = false;
  error.textContent = message;
}

function deleteWithUndo(collection, id, message) {
  const current = store.state;
  const removed = removeRecord(current[collection], id);
  if (!removed) return;
  persist();
  render();
  toast(message, () => {
    if (store.state !== current || !restoreRecord(current[collection], removed))
      return;
    persist();
    render();
    toast("Rimozione annullata.");
  });
  elements.toastUndo.focus({ preventScroll: true });
}

async function previewBackup(file, input) {
  const request = ++backupVersion,
    route = navigationVersion;
  pendingBackup = null;
  const status = $("#backup-status");
  status.textContent = "Controllo della copia in corso…";
  input.disabled = true;
  try {
    const { readBackup, MAX_BACKUP_BYTES } = await import("./backup.js");
    if (file.size > MAX_BACKUP_BYTES)
      throw new Error("Scegli un file JSON inferiore a 2 MB.");
    const text = await file.text();
    if (request !== backupVersion || route !== navigationVersion) return;
    pendingBackup = readBackup(text);
    status.textContent =
      "Copia verificata. Conferma il ripristino nel riepilogo.";
    elements.dialogContent.innerHTML = backupDialog(pendingBackup, file.name);
    showDialog();
  } catch (error) {
    if (request === backupVersion && route === navigationVersion) {
      status.textContent =
        error.message || "Non riesco a leggere il file. Scegli un’altra copia.";
      pendingBackup = null;
    }
  } finally {
    input.disabled = false;
    input.value = "";
  }
}
function showDialogError(message) {
  let error = $("#dialog-error");
  if (!error) {
    error = document.createElement("p");
    error.id = "dialog-error";
    error.className = "alert alert-error alert-soft my-4";
    error.setAttribute("role", "alert");
    error.tabIndex = -1;
    elements.dialogContent.append(error);
  }
  error.textContent = message;
}
function exportFile(filename, content, type) {
  download(filename, content, type);
  toast("Esportazione pronta. Controlla la cartella Download.");
}
function exportCSV() {
  exportFile(
    `prevedi-diario-${localDate()}.csv`,
    diaryCSV(store.state.entries),
    "text/csv;charset=utf-8",
  );
}
function syncDrawer() {
  elements.drawerTrigger.setAttribute(
    "aria-expanded",
    String(elements.drawer.checked),
  );
}

const timer = createTimer({
  onTick(snapshot) {
    if (view !== "stress") return;
    const time = $("#timer-time");
    if (time) time.textContent = formatTime(snapshot.remaining);
    breathingMotion.update(snapshot);
    syncPineDetails();
  },
  onComplete(snapshot) {
    if (!allowWrite()) return;
    addEntry(store.state, {
      type: "mindful",
      label: "Pausa di respirazione",
      minutes: snapshot.duration / 60,
    });
    persist();
    if (
      ["stress", "percorso", "diario", "giardino", "progressi"].includes(view)
    )
      render();
    toast("Pausa completata e salvata nel diario. Prenditi il tuo tempo.");
  },
});
const breathingMotion = createBreathingMotion({
  document,
  mediaQuery: window.matchMedia("(prefers-reduced-motion: reduce)"),
  getSnapshot: () => timer.snapshot(),
  observe:
    typeof IntersectionObserver === "function"
      ? (callback) => new IntersectionObserver(callback, { threshold: 0.15 })
      : null,
});
const widgetMotion = createWidgetMotion({
  document,
  mediaQuery: window.matchMedia("(prefers-reduced-motion: reduce)"),
});
const PINE_PREFERENCE_KEY = "prevediapp.pine-motion.v1";
const pineMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
let pinePreferenceSaved = true;
const readPinePreference = () => {
  try {
    return window.localStorage.getItem(PINE_PREFERENCE_KEY) !== "false";
  } catch {
    return true;
  }
};
const pineMotion = createPineMotion({
  document,
  mediaQuery: pineMedia,
  enabled: readPinePreference(),
  observe:
    typeof IntersectionObserver === "function"
      ? (callback) => new IntersectionObserver(callback, { threshold: 0.15 })
      : null,
});
function syncPineDetails() {
  const timedTask =
    (view === "stress" && timer.snapshot().running) ||
    (view === "sessione" &&
      guidedTimers.get(ui.guided.sessionId)?.snapshot().running) ||
    (view === "frigo-sano" && fridgeTimer.snapshot().running);
  pineMotion.setSuspended(elements.dialog.open || Boolean(timedTask));
  pineMotion.mount();
  const settings = pineMotion.settings();
  const toggle = $("#pine-motion-toggle");
  if (toggle) {
    toggle.checked = settings.enabled;
    toggle.disabled = settings.reduced;
    if (settings.reduced || !pinePreferenceSaved)
      toggle.setAttribute("aria-describedby", "pine-motion-note");
    else toggle.removeAttribute("aria-describedby");
  }
  const note = $("#pine-motion-note");
  if (note) {
    note.hidden = !settings.reduced && pinePreferenceSaved;
    note.textContent = settings.reduced
      ? "Movimento ridotto attivo sul dispositivo."
      : pinePreferenceSaved
        ? ""
        : "Preferenza valida in questa sessione.";
  }
}
function showDialog() {
  pineMotion.setSuspended(true);
  elements.dialog.showModal();
}
pineMedia.addEventListener("change", syncPineDetails);
const guidedTimers = new Map(
  meditations.map((session) => {
    const duration = session.minutes * 60;
    const guidedTimer = createTimer({
      durations: [duration],
      initialDuration: duration,
      onTick(snapshot) {
        if (view !== "sessione" || ui.guided.sessionId !== session.id) return;
        const time = $("#guided-time");
        if (time) time.textContent = formatTime(snapshot.remaining);
        const progress = $("#guided-progress");
        if (progress) progress.value = snapshot.duration - snapshot.remaining;
        syncPineDetails();
      },
      onComplete(snapshot) {
        if (!allowWrite()) return;
        addEntry(store.state, {
          type: "mindful",
          label: session.title,
          minutes: snapshot.duration / 60,
        });
        persist();
        if (
          [
            "sessione",
            "stress",
            "percorso",
            "diario",
            "giardino",
            "progressi",
            "evoluzione",
            "ricompense",
            "sfide",
            "dettaglio-attivita",
            "diario-attivita",
          ].includes(view)
        )
          render();
        toast(`${session.title} completata e salvata nel diario.`);
      },
    });
    return [session.id, guidedTimer];
  }),
);
const fridgeTimer = createTimer({
  durations: [30],
  initialDuration: 30,
  onTick(snapshot) {
    if (view !== "frigo-sano") return;
    const time = $("#fridge-game-time");
    if (time) time.textContent = formatTime(snapshot.remaining);
    const progress = $("#fridge-game-progress");
    if (progress) progress.value = snapshot.remaining;
    syncPineDetails();
  },
  onComplete() {
    const game = ui.discovery.fridgeGame;
    if (!game.started || game.finished) return;
    game.finished = true;
    game.message = "Il tempo è finito. Puoi riprovare quando vuoi.";
    if (view === "frigo-sano") {
      render();
      focusStep("#fridge-question");
    }
  },
});
function pauseHealthTimers(except = null) {
  for (const current of [timer, ...guidedTimers.values()])
    if (current !== except && current.snapshot().running) current.toggle();
}
function pauseAllTimers() {
  pauseHealthTimers();
  if (fridgeTimer.snapshot().running) fridgeTimer.toggle();
}
function resetAllTimers() {
  timer.reset(60);
  for (const session of meditations)
    guidedTimers.get(session.id).reset(session.minutes * 60);
  fridgeTimer.reset(30);
  ui.discovery.fridgeGame = initialFridgeGame();
}
const conversation = createConversation({
  store,
  onError() {
    toast("Pigna non riesce a preparare la risposta. Riprova tra un momento.");
  },
  respond: async (text) => (await import("./views/assistant.js")).reply(text),
  onChange(change) {
    storageBanner();
    if (view === "assistente") {
      render();
      if (change === "replied") $("#chat-message")?.focus();
    }
  },
});

const actions = {
  "retry-screen": () => navigate(),
  navigate: (el) => {
    location.hash = el.dataset.route;
  },
  "open-entry": (el) => openEntry(el.dataset.type),
  "edit-entry": (el) => openEntry("", el.dataset.id),
  "close-dialog": () => $("#entry-dialog").close(),
  "delete-entry": (el) =>
    deleteWithUndo(
      "entries",
      el.dataset.id,
      "Registrazione rimossa dal diario.",
    ),
  "undo-delete": () => undoAction?.(),
  "open-saved-day": (el) => {
    if (!validDate(el.dataset.date)) return;
    ui.diary.date = el.dataset.date;
    ui.diary.filter = "all";
    if (view === "diario") render(true);
    else location.hash = "diario";
    elements.toast.hidden = true;
  },
  "diary-day": (el) => {
    const offset = Number(el.dataset.offset);
    if (![-1, 1].includes(offset)) return;
    const date = shiftDate(ui.diary.date, offset);
    if (date > localDate()) return;
    ui.diary.date = date;
    render();
  },
  "diary-clear-filter": () => {
    ui.diary.filter = "all";
    render();
    focusStep("#diary-filter");
  },
  "diary-today": () => {
    ui.diary.date = localDate();
    render();
  },
  "water-plus": () => {
    if (
      dayEntries(store.state).filter((e) => e.type === "water").length >= 30
    ) {
      toast("Hai già registrato 30 bicchieri oggi.");
      return;
    }
    addEntry(store.state, { type: "water" });
    persist();
    render();
    toast("Un bicchiere aggiunto al diario.");
  },
  "water-minus": () => {
    const list = dayEntries(store.state).filter((e) => e.type === "water");
    if (list.length) {
      store.state.entries = store.state.entries.filter(
        (e) => e.id !== list.at(-1).id,
      );
      persist();
      render();
      if (list.length === 1) $("[data-action=water-plus]")?.focus();
      toast("Un bicchiere rimosso dal diario.");
    }
  },
  "plate-add": (el) => {
    if (
      ui.plate.items.length < 4 &&
      foods.some((food) => food.id === el.dataset.id)
    ) {
      const origin = widgetMotion.capture(el);
      const index = ui.plate.items.length;
      ui.plate.items.push(el.dataset.id);
      ui.plate.message = "";
      render();
      widgetMotion.transfer(
        origin,
        `[data-plate-slot][data-item-index="${index}"] [data-food-art]`,
      );
      if (ui.plate.items.length === 4) focusStep("[data-action=plate-check]");
    }
  },
  "plate-target": (el) => {
    const group = el.dataset.group;
    if (!["all", "vegetables", "carbs", "protein"].includes(group)) return;
    ui.plate.target = group === "all" ? null : group;
    render();
    focusStep("#plate-foods-target [data-action=plate-add]:not(:disabled)");
  },
  "plate-remove": (el) => {
    const index = Number(el.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= ui.plate.items.length)
      return;
    ui.plate.items.splice(index, 1);
    ui.plate.message = "";
    render();
  },
  "plate-reset": () => {
    ui.plate.items = [];
    ui.plate.message = "";
    ui.plate.target = null;
    render();
  },
  "plate-check": () => {
    ui.plate.message = plateBalance(ui.plate.items).balanced
      ? "Il tuo piatto segue il modello: due porzioni di verdure, una di carboidrati e una di proteine."
      : "Manca un po’ di equilibrio: prova due porzioni di verdure, una di carboidrati e una di proteine. Rimuovi un ingrediente e riprova.";
    render();
    widgetMotion.pulse("[data-plate-feedback]");
  },
  "plate-save": () => {
    if (!plateBalance(ui.plate.items).balanced) return;
    addEntry(store.state, {
      type: "meal",
      label: ui.plate.items
        .map((id) => foods.find((f) => f.id === id).name)
        .join(", "),
      meal: ui.plate.meal,
    });
    persist();
    ui.plate.items = [];
    ui.plate.message = "";
    ui.plate.target = null;
    location.hash = "alimentazione";
    toast("Piatto aggiunto al diario. Alberello ti ringrazia!");
  },
  "fridge-toggle": (el) => {
    const id = el.dataset.id;
    if (!foods.some((food) => food.id === id)) return;
    const removing = store.state.fridge.includes(id);
    const origin = widgetMotion.capture(
      removing ? $(`[data-fridge-item="${id}"]`) || el : el,
    );
    store.state.fridge = removing
      ? store.state.fridge.filter((x) => x !== id)
      : [...store.state.fridge, id];
    persist();
    render();
    widgetMotion.transfer(
      origin,
      removing
        ? `[data-market-food="${id}"] [data-food-art]`
        : `[data-fridge-item="${id}"] [data-food-art]`,
    );
  },
  "recipe-favorite": (el) => {
    if (!recipes.some((recipe) => recipe.id === el.dataset.id)) return;
    togglePreference("recipeFavorites", el.dataset.id);
    persist();
    render();
  },
  "recipe-save": (el) => {
    const recipe = recipes.find((item) => item.id === el.dataset.id);
    if (!recipe) return;
    openMeal(
      recipe.name,
      "Idea dalla ricetta del prototipo, adattata al mio pasto.",
    );
  },
  "recipe-pantry": (el) => {
    const recipe = recipes.find((item) => item.id === el.dataset.id);
    if (!recipe) return;
    for (const id of recipe.pantry) {
      const collection = foods.some((food) => food.id === id)
        ? "fridge"
        : "pantryExtras";
      if (
        catalogFoods().some((food) => food.id === id) &&
        !store.state[collection].includes(id)
      )
        store.state[collection].push(id);
    }
    persist();
    render();
    toast("Ingredienti aggiunti alla dispensa locale.");
  },
  "recipe-clear-filter": () => {
    ui.discovery.recipeQuery = "";
    ui.discovery.recipeFilter = "all";
    render();
    focusStep("#recipe-search");
  },
  "food-add": (el) => {
    const food = catalogFoods().find((item) => item.id === el.dataset.id);
    if (food) openMeal(food.name);
  },
  "market-toggle": (el) => {
    if (!updatePantry(el.dataset.id)) return;
    persist();
    render();
  },
  "food-clear-filter": () => {
    ui.discovery.query = "";
    ui.discovery.category = "all";
    render();
    focusStep("#food-query");
  },
  "food-clear-recent": () => {
    store.state.foodSearches = [];
    persist();
    render();
    focusStep("#food-query");
  },
  "food-recent": (el) => {
    if (typeof el.dataset.text !== "string") return;
    ui.discovery.query = el.dataset.text.trim().slice(0, 80);
    render();
    focusStep("#food-query");
  },
  "pantry-plate": () => {
    const suggestion = pantryPlate(store.state.fridge);
    if (suggestion.missing.length) return;
    ui.plate.items = suggestion.items;
    ui.plate.message = "";
    ui.plate.meal = "Pranzo";
    location.hash = "piatto";
  },
  claim: (el) => {
    if (claimReward(store.state, el.dataset.id)) {
      persist();
      render();
      toast("Una nuova ricompensa nel tuo giardino!");
    }
  },
  decorate: (el) => {
    if (
      el.dataset.id === "none" ||
      store.state.claimed.includes(el.dataset.id)
    ) {
      store.state.decoration = el.dataset.id;
      persist();
      render();
    }
  },
  "timer-duration": (el) => {
    timer.setDuration(Number(el.dataset.duration));
    render();
  },
  "timer-toggle": () => {
    const firstStart = !timer.snapshot().started;
    if (!timer.snapshot().running) pauseHealthTimers(timer);
    timer.toggle();
    render();
    if (firstStart && timer.snapshot().running) focusStep("#breathing-phase");
  },
  "timer-reset": () => {
    timer.reset();
    render();
  },
  "guided-toggle": (el) => {
    const selected = guidedTimers.get(el.dataset.id);
    if (!selected) return;
    if (!selected.snapshot().running) pauseHealthTimers(selected);
    selected.toggle();
    render();
  },
  "guided-reset": (el) => {
    const session = meditations.find((item) => item.id === el.dataset.id);
    if (!session) return;
    guidedTimers.get(session.id).reset(session.minutes * 60);
    render();
  },
  "fridge-game-start": () => {
    ui.discovery.fridgeGame = initialFridgeGame();
    ui.discovery.fridgeGame.started = true;
    fridgeTimer.reset(30);
    fridgeTimer.toggle();
    render();
    focusStep("#fridge-question");
  },
  "fridge-game-answer": (el) => {
    const origin = widgetMotion.capture(el);
    const index = ui.discovery.fridgeGame.correct;
    if (!answerFridgeGame(ui.discovery.fridgeGame, el.dataset.id)) return;
    if (ui.discovery.fridgeGame.finished) fridgeTimer.reset(30);
    render();
    if (ui.discovery.fridgeGame.correct > index)
      widgetMotion.transfer(
        origin,
        `[data-fridge-game-pick="${index}"] [data-food-art]`,
      );
    else widgetMotion.pulse("[data-fridge-game-feedback]");
    focusStep("#fridge-question");
  },
  "fridge-game-stop": () => {
    if (!ui.discovery.fridgeGame.started || ui.discovery.fridgeGame.finished)
      return;
    ui.discovery.fridgeGame.finished = true;
    ui.discovery.fridgeGame.message =
      "Hai interrotto il gioco. Puoi riprovare quando vuoi.";
    fridgeTimer.reset(30);
    render();
    focusStep("#fridge-question");
  },
  "wake-toggle": (el) => {
    const id = el.dataset.id;
    if (!exercises.some((exercise) => exercise.id === id)) return;
    ui.guided.exerciseIds = ui.guided.exerciseIds.includes(id)
      ? ui.guided.exerciseIds.filter((item) => item !== id)
      : [...ui.guided.exerciseIds, id];
    render();
  },
  "wake-save": () => {
    const selected = validExerciseIds(ui.guided.exerciseIds);
    const field = $("#wake-minutes");
    const minutes = validExerciseMinutes(field?.value);
    if (!selected.length) return;
    if (minutes === null) {
      field?.setCustomValidity(
        "Inserisci i minuti effettivi, da 1 a 180, senza decimali.",
      );
      field?.reportValidity();
      return;
    }
    addEntry(store.state, {
      type: "movement",
      label: `Risveglio muscolare: ${exerciseLabel(selected)}`,
      minutes,
    });
    persist();
    ui.guided.exerciseIds = [];
    ui.guided.exerciseMinutes = minutes;
    render();
    focusStep("#wake-minutes");
    toast("Routine registrata nel diario con i minuti che hai indicato.");
  },
  "routine-toggle": (el) => {
    if (!sleepRoutine.some((item) => item.id === el.dataset.id)) return;
    store.state.sleepRoutine = validRoutineIds(store.state.sleepRoutine);
    togglePreference("sleepRoutine", el.dataset.id);
    persist();
    render();
  },
  "sleep-reminder": () => {
    const field = $("#sleep-reminder-time");
    const time = field?.value;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) {
      field?.setCustomValidity("Scegli un orario per il promemoria.");
      field?.reportValidity();
      return;
    }
    store.state.sleepReminder = {
      enabled: !store.state.sleepReminder.enabled,
      time,
    };
    store.state.notificationsRead = false;
    store.state.notificationsReadDate = "";
    persist();
    render();
    toast("Preferenza del promemoria serale aggiornata.");
  },
  "mindfulness-filter": (el) => {
    const category = el.dataset.id;
    if (
      !["tutte", ...meditations.map((session) => session.category)].includes(
        category,
      )
    )
      return;
    ui.guided.category = category;
    render();
  },
  "join-group": (el) => {
    const id = el.dataset.id;
    if (!groups.some((group) => group.id === id)) return;
    store.state.joined = store.state.joined.includes(id)
      ? store.state.joined.filter((x) => x !== id)
      : [...store.state.joined, id];
    persist();
    render();
    toast("Preferenza aggiornata nella community dimostrativa.");
  },
  "group-clear-filter": () => {
    ui.social.query = "";
    ui.social.category = "all";
    render();
    focusStep("#group-search");
  },
  "challenge-join": (el) => {
    if (!challenges.some((challenge) => challenge.id === el.dataset.id)) return;
    togglePreference("joinedChallenges", el.dataset.id);
    persist();
    render();
    toast("Preferenza aggiornata nelle tue sfide locali.");
  },
  "glucose-edit": (el) => {
    const reading = store.state.glucoseReadings.find(
      (item) => item.id === el.dataset.id,
    );
    if (!reading) return;
    ui.glucose.editing = reading.id;
    ui.glucose.draft = { ...reading };
    render();
    focusStep("#glucose-value");
  },
  "glucose-cancel": () => {
    ui.glucose.editing = "";
    delete ui.glucose.draft;
    render();
    focusStep("#glucose-value");
  },
  "glucose-delete": (el) => {
    if (ui.glucose.editing === el.dataset.id) {
      ui.glucose.editing = "";
      delete ui.glucose.draft;
    }
    deleteWithUndo(
      "glucoseReadings",
      el.dataset.id,
      "Misurazione rimossa dal registro.",
    );
  },
  "glucose-export": () => {
    const report = glucoseReport(
      store.state.glucoseReadings,
      ui.glucose.period,
    );
    if (!report.count) return;
    exportFile(
      `prevedi-glucosio-${report.from}-${report.to}.csv`,
      glucoseCSV(report.records),
      "text/csv;charset=utf-8",
    );
  },
  "water-tree": (el) => {
    const key = localDate() + ":" + el.dataset.id;
    if (!store.state.watered.includes(key)) {
      store.state.watered.push(key);
      persist();
      render();
      toast("Un piccolo incoraggiamento nel giardino dimostrativo.");
    }
  },
  "like-post": (el) => {
    const id = el.dataset.id;
    store.state.likes = store.state.likes.includes(id)
      ? store.state.likes.filter((x) => x !== id)
      : [...store.state.likes, id];
    persist();
    render();
  },
  "edit-post": (el) => {
    const post = store.state.posts.find((item) => item.id === el.dataset.id);
    if (!post) return;
    ui.community.editing = post.id;
    ui.community.draft = post.text;
    render();
    $("#community-text").focus();
    $("#community-text").scrollIntoView({
      block: "center",
      behavior: "instant",
    });
  },
  "cancel-post-edit": () => {
    ui.community.editing = "";
    ui.community.draft = "";
    render();
  },
  "delete-post": (el) => {
    if (ui.community.editing === el.dataset.id)
      Object.assign(ui.community, { editing: "", draft: "" });
    deleteWithUndo(
      "posts",
      el.dataset.id,
      "Messaggio rimosso dalla demo locale.",
    );
  },
  "chat-suggestion": (el) => conversation.send(el.dataset.text),
  "quiz-choose": (el) => {
    if (ui.quiz.checked) return;
    ui.quiz.choice = Number(el.dataset.index);
    render();
  },
  "quiz-check": () => {
    if (ui.quiz.choice === null || ui.quiz.checked) return;
    ui.quiz.checked = true;
    if (
      ui.quiz.choice ===
      quizSets[ui.quiz.category].questions[ui.quiz.index].correct
    )
      ui.quiz.correct++;
    render();
    document
      .querySelector("[data-action=quiz-next]")
      ?.focus({ preventScroll: true });
  },
  "quiz-next": () => {
    if (!ui.quiz.checked || ui.quiz.finished) return;
    if (ui.quiz.index < 2) {
      ui.quiz.index++;
      ui.quiz.choice = null;
      ui.quiz.checked = false;
    } else {
      ui.quiz.finished = true;
      store.state.quizHistory.push({
        category: ui.quiz.category,
        date: localDate(),
        correct: ui.quiz.correct,
      });
      store.state.quizHistory = store.state.quizHistory.slice(-200);
      const added = award(store.state, "quiz:" + ui.quiz.category, 20);
      persist();
      if (added) toast("Quiz completato. Hai raccolto 20 foglie!");
    }
    render();
    focusStep(ui.quiz.finished ? "#quiz-result" : "#quiz-question");
  },
  "quiz-resume": () => {
    resumeQuiz(ui);
    render();
    focusStep("#quiz-question");
  },
  "quiz-restart": () => {
    restartQuiz(ui);
    render();
    focusStep("#quiz-question");
  },
  "risk-back": () => {
    backRisk(ui.risk);
    render();
    focusStep("#risk-question");
  },
  "risk-restart": () => {
    ui.risk = initialRisk();
    render();
    focusStep("#risk-question");
  },
  "export-json": () =>
    exportFile(
      `prevedi-${store.recoveryRequired ? "originale-da-recuperare" : "percorso"}-${localDate()}.json`,
      store.recoveryRaw ?? JSON.stringify(store.state, null, 2),
      "application/json",
    ),
  "recover-storage": () => {
    if (!store.recover()) {
      storageBanner();
      toast(
        "Il browser non permette il recupero. Conserva la copia originale prima di chiudere.",
      );
      return;
    }
    conversation.cancelPending();
    resetAllTimers();
    Object.assign(ui, initialSession());
    if (view === "quiz") openQuiz(ui, resolveRoute(location.hash).category);
    render(true);
    toast("Percorso ritrovato e recuperato in questo browser.");
  },
  "export-csv": exportCSV,
  "clear-chat": () => {
    elements.dialogContent.innerHTML = `${dialogHeading("Cancellare la conversazione?")}<p>I messaggi con Pigna verranno rimossi da questo browser. Il diario e i progressi restano disponibili.</p><div class="modal-action"><button class="btn btn-ghost" data-action="close-dialog">Annulla</button><button class="btn btn-error" data-action="clear-chat-confirmed">Cancella la conversazione</button></div>`;
    showDialog();
  },
  "clear-chat-confirmed": () => {
    conversation.clear();
    elements.dialog.close();
    toast("La conversazione è stata cancellata.");
  },
  "restore-backup": () => {
    if (!pendingBackup) return;
    if (!store.replace(pendingBackup)) {
      storageBanner();
      showDialogError(
        "Ripristino non riuscito: il browser non permette il salvataggio. I dati precedenti sono ancora protetti. Puoi annullare e conservare una copia.",
      );
      return;
    }
    conversation.cancelPending();
    resetAllTimers();
    Object.assign(ui, initialSession());
    elements.dialog.close();
    storageBanner();
    render(true);
    toast("Copia ripristinata. Ritrovi il tuo percorso in questo browser.");
  },
  "confirm-reset": () => {
    $("#dialog-content").innerHTML =
      `<div class="flex items-start justify-between gap-3 mb-4"><h2 id="dialog-title">Ricominciare il percorso?</h2><button class="btn btn-ghost btn-circle shrink-0" data-action="close-dialog" aria-label="Chiudi">${icon("x-mark")}</button></div><p>Tutti i dati di PREVEDIApp saranno rimossi da questo browser. Puoi esportare una copia prima di proseguire.</p><div class="modal-action flex-wrap"><button class="btn btn-outline" data-action="export-json">Esporta una copia</button><button class="btn btn-error" data-action="reset-confirmed">Cancella i dati</button></div><form method="dialog" class="mt-3"><button class="btn btn-ghost w-full">Annulla</button></form>`;
    showDialog();
  },
  "reset-confirmed": () => {
    if (!store.reset()) {
      storageBanner();
      showDialogError(
        "Non riesco a cancellare i dati salvati. I dati precedenti restano disponibili. Puoi annullare, conservare una copia e riprovare quando il browser permette il salvataggio.",
      );
      return;
    }
    conversation.cancelPending();
    try {
      window.localStorage.removeItem(PINE_PREFERENCE_KEY);
      pinePreferenceSaved = true;
    } catch {
      pinePreferenceSaved = false;
    }
    pineMotion.setEnabled(true);
    resetAllTimers();
    Object.assign(ui, initialSession());
    elements.dialog.close();
    location.hash = "profilo";
    render();
    toast("Il percorso è pronto per un nuovo inizio.");
  },
  "read-notifications": () => {
    store.state.notificationsRead = true;
    store.state.notificationsReadDate = localDate();
    persist();
    render();
    toast("Promemoria segnati come letti.");
  },
};

const writeActions = new Set([
  "open-entry",
  "edit-entry",
  "delete-entry",
  "undo-delete",
  "water-plus",
  "water-minus",
  "plate-save",
  "fridge-toggle",
  "recipe-favorite",
  "recipe-save",
  "recipe-pantry",
  "food-add",
  "market-toggle",
  "food-clear-recent",
  "claim",
  "decorate",
  "timer-toggle",
  "guided-toggle",
  "wake-save",
  "routine-toggle",
  "sleep-reminder",
  "join-group",
  "challenge-join",
  "glucose-edit",
  "glucose-delete",
  "water-tree",
  "like-post",
  "edit-post",
  "delete-post",
  "chat-suggestion",
  "clear-chat",
  "clear-chat-confirmed",
  "read-notifications",
]);

document.addEventListener("keydown", (event) => {
  if (
    event.target.matches("[data-drawer-trigger]") &&
    ["Enter", " "].includes(event.key)
  ) {
    event.preventDefault();
    event.target.click();
  }
  if (event.key === "Escape" && elements.drawer.checked) {
    elements.drawer.checked = false;
    syncDrawer();
    elements.drawerTrigger.focus();
  }
});
document.addEventListener("click", (event) => {
  if (event.target.closest('.drawer-side a[href^="#"]')) {
    elements.drawer.checked = false;
    syncDrawer();
  }
  const control = event.target.closest("[data-action]");
  if (
    control &&
    !control.disabled &&
    Object.hasOwn(actions, control.dataset.action)
  ) {
    const writes =
      writeActions.has(control.dataset.action) ||
      (control.dataset.action === "quiz-next" && ui.quiz.index === 2);
    if (writes && !allowWrite()) {
      event.preventDefault();
      return;
    }
    actions[control.dataset.action](control);
  }
});
document.addEventListener("change", (event) => {
  if (event.target.id === "pine-motion-toggle") {
    pineMotion.setEnabled(event.target.checked);
    try {
      window.localStorage.setItem(
        PINE_PREFERENCE_KEY,
        String(event.target.checked),
      );
      pinePreferenceSaved = true;
    } catch {
      pinePreferenceSaved = false;
    }
    syncPineDetails();
  }
  if (event.target.id === "breathing-motion")
    breathingMotion.setEnabled(event.target.checked);
  if (event.target.id === "app-drawer") syncDrawer();
  if (event.target.id === "diary-date") {
    ui.diary.date =
      validDate(event.target.value) && event.target.value <= localDate()
        ? event.target.value
        : localDate();
    render();
  }
  if (event.target.id === "diary-filter") {
    ui.diary.filter = event.target.value;
    render();
  }
  if (
    event.target.id === "progress-category" &&
    Object.hasOwn(habitLabels, event.target.value)
  ) {
    ui.progress.category = event.target.value;
    render();
  }
  if (event.target.id === "progress-period") {
    ui.progress.period = Number(event.target.value) === 30 ? 30 : 7;
    render();
  }
  if (event.target.id === "food-category") {
    ui.discovery.category = Object.hasOwn(foodCategories, event.target.value)
      ? event.target.value
      : "all";
    render();
  }
  if (event.target.id === "recipe-filter") {
    ui.discovery.recipeFilter = [
      "all",
      "Vegetale",
      "Pesce",
      "Preferite",
    ].includes(event.target.value)
      ? event.target.value
      : "all";
    render();
  }
  if (event.target.id === "group-category") {
    ui.social.category = Object.hasOwn(groupCategories, event.target.value)
      ? event.target.value
      : "all";
    render();
  }
  if (event.target.id === "reward-theme") {
    ui.forest.theme = ["all", "nature", "winter"].includes(event.target.value)
      ? event.target.value
      : "all";
    render();
  }
  if (event.target.id === "glucose-period") {
    captureGlucoseDraft();
    ui.glucose.period = Number(event.target.value) === 30 ? 30 : 7;
    render();
  }
  if (event.target.id === "sleep-reminder-time") {
    const field = event.target;
    field.setCustomValidity("");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(field.value)) {
      field.setCustomValidity("Scegli un orario per il promemoria.");
      field.reportValidity();
      return;
    }
    if (!allowWrite()) {
      event.preventDefault();
      field.value = store.state.sleepReminder.time;
      return;
    }
    store.state.sleepReminder = {
      ...store.state.sleepReminder,
      time: field.value,
    };
    store.state.notificationsRead = false;
    store.state.notificationsReadDate = "";
    persist();
    render();
  }
  if (event.target.id === "plate-meal") ui.plate.meal = event.target.value;
  if (event.target.id === "backup-file" && event.target.files[0])
    previewBackup(event.target.files[0], event.target);
});

document.addEventListener("submit", (e) => {
  if (
    [
      "entry-form",
      "community-form",
      "profile-form",
      "chat-form",
      "glucose-form",
    ].includes(e.target.id) &&
    !allowWrite()
  ) {
    e.preventDefault();
    if (e.target.id === "glucose-form") {
      captureGlucoseDraft();
      showGlucoseError(
        "Le modifiche sono sospese perché il salvataggio è protetto. La bozza resta disponibile: scegli come recuperare il percorso.",
      );
    }
    return;
  }
  if (e.target.id === "food-search-form") {
    e.preventDefault();
    const query = String(new FormData(e.target).get("query") || "")
      .trim()
      .slice(0, 80);
    ui.discovery.query = query;
    store.prepareWrite();
    if (query && !store.recoveryRequired) {
      store.state.foodSearches = [
        query,
        ...store.state.foodSearches.filter((item) => item !== query),
      ].slice(0, 8);
      persist();
    }
    render();
    focusStep("#food-query");
    return;
  }
  if (e.target.id === "recipe-search-form") {
    e.preventDefault();
    ui.discovery.recipeQuery = String(new FormData(e.target).get("query") || "")
      .trim()
      .slice(0, 80);
    render();
    focusStep("#recipe-search");
    return;
  }
  if (e.target.id === "groups-search-form") {
    e.preventDefault();
    const data = new FormData(e.target);
    ui.social.query = String(data.get("query") || "")
      .trim()
      .slice(0, 80);
    ui.social.category = Object.hasOwn(groupCategories, data.get("category"))
      ? data.get("category")
      : "all";
    render();
    focusStep("#group-search");
    return;
  }
  if (e.target.id === "garden-friends-form") {
    e.preventDefault();
    ui.social.friendsQuery = String(new FormData(e.target).get("query") || "")
      .trim()
      .slice(0, 80);
    render();
    focusStep("#garden-friends-query");
    return;
  }
  if (e.target.id === "glucose-form") {
    e.preventDefault();
    captureGlucoseDraft();
    try {
      const reading = validateReading(
        Object.fromEntries(new FormData(e.target)),
        localDate(),
      );
      const readings = store.state.glucoseReadings;
      if (ui.glucose.editing) {
        const index = readings.findIndex(
          (item) => item.id === ui.glucose.editing,
        );
        if (index < 0)
          throw new Error(
            "La misurazione da modificare non è più presente. Annulla la modifica e riprova.",
          );
        readings[index] = {
          ...reading,
          id: readings[index].id,
          createdAt: readings[index].createdAt,
        };
      } else {
        if (readings.length >= GLUCOSE_LIMIT)
          throw new Error(
            "Hai raggiunto il limite di 200 misurazioni. Esporta una copia e rimuovi una voce prima di aggiungerne altre.",
          );
        readings.push({
          ...reading,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        });
      }
      const editing = !!ui.glucose.editing;
      store.state.glucoseReadings = normalizedReadings(readings, localDate());
      persist();
      ui.glucose.editing = "";
      delete ui.glucose.draft;
      render();
      focusStep("#glucose-value");
      toast(
        editing
          ? "Misurazione aggiornata nel registro."
          : "Misurazione salvata nel registro.",
      );
    } catch (error) {
      showGlucoseError(error.message);
    }
    return;
  }
  if (e.target.id === "entry-form") {
    e.preventDefault();
    const form = e.target,
      data = new FormData(form),
      before = totalPoints(store.state);
    try {
      const entry = validateEntry({
        ...Object.fromEntries(data),
        type: form.dataset.type,
      });
      if (form.dataset.id) updateEntry(store.state, form.dataset.id, entry);
      else addEntry(store.state, entry, entry.date);
      persist();
      if (view === "diario") {
        ui.diary.date = entry.date;
        ui.diary.filter = "all";
      }
      elements.dialog.close();
      render();
      const added = totalPoints(store.state) - before;
      const dateLabel = new Intl.DateTimeFormat("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Rome",
      }).format(new Date(`${entry.date}T12:00:00Z`));
      toast(
        form.dataset.id
          ? "Registrazione aggiornata. Le foglie restano invariate."
          : added
            ? `Salvato nel diario. +${added} foglie per il tuo Alberello!`
            : "Salvato nel tuo diario.",
      );
      if (entry.date !== localDate()) {
        elements.toastMessage.textContent += ` Giorno: ${dateLabel}.`;
        elements.toastDay.dataset.date = entry.date;
        elements.toastDay.hidden = false;
      }
    } catch (error) {
      $("#entry-error").textContent = error.message;
    }
    return;
  }
  if (e.target.id === "community-form") {
    e.preventDefault();
    try {
      const editing = !!ui.community.editing;
      savePost(
        store.state,
        new FormData(e.target).get("text"),
        ui.community.editing,
      );
      Object.assign(ui.community, { editing: "", draft: "" });
      persist();
      render();
      $("#community-text").focus();
      toast(
        editing
          ? "Messaggio aggiornato nella demo locale."
          : "Messaggio salvato nella demo, solo sul tuo dispositivo.",
      );
    } catch (error) {
      $("#community-error").textContent = error.message;
    }
    return;
  }
  if (e.target.id === "profile-form") {
    e.preventDefault();
    const data = new FormData(e.target),
      name = data.get("name").trim();
    if (!name) {
      e.target.elements.name.setCustomValidity("Inserisci il tuo nome.");
      e.target.elements.name.reportValidity();
      return;
    }
    store.state.name = name.slice(0, 40);
    store.state.goals = {
      movement: Number(data.get("movement")),
      sleep: Number(data.get("sleep")),
      water: Number(data.get("water")),
    };
    store.state.onboarded = true;
    persist();
    render();
    toast("Il tuo profilo è stato salvato. Il percorso è tuo!");
  }
  if (e.target.id === "chat-form") {
    e.preventDefault();
    conversation.send(new FormData(e.target).get("message"));
  }
  if (e.target.id === "risk-form") {
    e.preventDefault();
    const data = new FormData(e.target),
      q = riskQuestions[ui.risk.step];
    if (q.key === "body") {
      ui.risk.answers.height = data.get("height");
      ui.risk.answers.weight = data.get("weight");
      ui.risk.answers.asian = data.has("asian");
      try {
        ui.risk.result = riskScore({
          age: Number(ui.risk.answers.age),
          sex: ui.risk.answers.sex,
          gestational: ui.risk.answers.gestational === "yes",
          family: ui.risk.answers.family === "yes",
          pressure: ui.risk.answers.pressure === "yes",
          active: ui.risk.answers.active === "yes",
          height: Number(ui.risk.answers.height),
          weight: Number(ui.risk.answers.weight),
          asian: ui.risk.answers.asian,
        });
      } catch (error) {
        $("#risk-error").textContent = error.message;
        return;
      }
    } else {
      try {
        advanceRisk(ui.risk, data.get("answer"));
      } catch (error) {
        $("#risk-error").textContent = error.message;
        return;
      }
    }
    render();
    focusStep(ui.risk.result ? "#risk-result" : "#risk-question");
  }
});

document.addEventListener("input", (event) => {
  if (event.target.name === "name") event.target.setCustomValidity("");
  if (event.target.id === "community-text") {
    ui.community.draft = event.target.value;
    $("#community-count").textContent =
      `${event.target.value.length}/400 caratteri`;
    $("#community-error").textContent = "";
  }
  if (event.target.id === "food-query")
    ui.discovery.query = event.target.value.slice(0, 80);
  if (event.target.id === "recipe-search")
    ui.discovery.recipeQuery = event.target.value.slice(0, 80);
  if (event.target.id === "group-search")
    ui.social.query = event.target.value.slice(0, 80);
  if (event.target.id === "garden-friends-query")
    ui.social.friendsQuery = event.target.value.slice(0, 80);
  if (event.target.id === "wake-minutes") {
    event.target.setCustomValidity("");
    ui.guided.exerciseMinutes = event.target.value;
  }
  if (event.target.id === "sleep-reminder-time")
    event.target.setCustomValidity("");
  if (event.target.closest("#glucose-form")) {
    captureGlucoseDraft();
    const error = $("#glucose-error");
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
  }
});
elements.dialog.addEventListener("close", () => {
  pendingBackup = null;
  backupVersion++;
  syncPineDetails();
});
window.addEventListener("hashchange", navigate);
window.addEventListener("storage", (event) => {
  if (event.key === PINE_PREFERENCE_KEY || event.key === null) {
    pineMotion.setEnabled(event.newValue !== "false");
    pinePreferenceSaved = true;
    syncPineDetails();
    if (event.key === PINE_PREFERENCE_KEY) return;
  }
  if (event.key !== KEY && event.key !== null) return;
  if (store.sync(event.newValue)) {
    conversation.cancelPending();
    resetAllTimers();
    elements.dialog.close();
    render();
    toast("Percorso aggiornato dall’altra scheda.");
  } else {
    conversation.cancelPending();
    pauseAllTimers();
    render();
    storageBanner();
  }
});
let currentDay = localDate();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && localDate() !== currentDay) {
    currentDay = localDate();
    ui.diary.date = currentDay;
    render();
  }
});
// Shell icons are static; do not replace their DOM on every activity update.
document.querySelectorAll("[data-icon]").forEach((element) => {
  element.innerHTML = icon(element.dataset.icon);
});
navigate();
