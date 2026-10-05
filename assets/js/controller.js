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
    view === "quiz"
      ? ui.quiz.category
      : ["piatto", "frigo"].includes(view)
        ? "alimentazione"
        : ["rischio", "notifiche", "informazioni"].includes(view)
          ? "percorso"
          : view;
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
function chrome() {
  const routeKey = view === "quiz" ? `quiz/${ui.quiz.category}` : view;
  if (chromeRoute !== routeKey) {
    elements.desktopNav.innerHTML = `<ul class="menu w-full gap-1 px-0">${mainNav.map((x) => navLink(x)).join("")}<li class="menu-title mt-3 text-base-content/85">Il tuo benessere</li>${wellnessNav.map((x) => navLink(x)).join("")}<li class="menu-title mt-3 text-base-content/85">Insieme</li>${communityNav.map((x) => navLink(x)).join("")}</ul>`;
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
    };
  return active?.id ? { elementId: active.id } : null;
}
function restoreFocus(info) {
  if (!info) return;
  let target;
  if (info.elementId) target = document.getElementById(info.elementId);
  else {
    let selector = `[data-action="${CSS.escape(info.action)}"]`;
    for (const key of ["id", "index", "duration"])
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
  elements.main.innerHTML = renderer({
    state: store.state,
    ui,
    timer: timer.snapshot(),
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
  elements.dialog.showModal();
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
    elements.dialog.showModal();
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
    if (ui.plate.items.length < 4) {
      ui.plate.items.push(el.dataset.id);
      ui.plate.message = "";
      render();
      if (ui.plate.items.length === 4) focusStep("[data-action=plate-check]");
    }
  },
  "plate-remove": (el) => {
    ui.plate.items.splice(Number(el.dataset.index), 1);
    ui.plate.message = "";
    render();
  },
  "plate-reset": () => {
    ui.plate.items = [];
    ui.plate.message = "";
    render();
  },
  "plate-check": () => {
    ui.plate.message = plateBalance(ui.plate.items).balanced
      ? "Il tuo piatto segue il modello: due porzioni di verdure, una di carboidrati e una di proteine."
      : "Manca un po’ di equilibrio: prova due porzioni di verdure, una di carboidrati e una di proteine. Rimuovi un ingrediente e riprova.";
    render();
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
    location.hash = "alimentazione";
    toast("Piatto aggiunto al diario. Alberello ti ringrazia!");
  },
  "fridge-toggle": (el) => {
    const id = el.dataset.id;
    store.state.fridge = store.state.fridge.includes(id)
      ? store.state.fridge.filter((x) => x !== id)
      : [...store.state.fridge, id];
    persist();
    render();
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
    timer.toggle();
    render();
  },
  "timer-reset": () => {
    timer.reset();
    render();
  },
  "join-group": (el) => {
    const id = el.dataset.id;
    store.state.joined = store.state.joined.includes(id)
      ? store.state.joined.filter((x) => x !== id)
      : [...store.state.joined, id];
    persist();
    render();
    toast("Preferenza aggiornata nella community dimostrativa.");
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
    timer.reset(60);
    Object.assign(ui, initialSession());
    if (view === "quiz") openQuiz(ui, resolveRoute(location.hash).category);
    render(true);
    toast("Percorso ritrovato e recuperato in questo browser.");
  },
  "export-csv": exportCSV,
  "clear-chat": () => {
    elements.dialogContent.innerHTML = `${dialogHeading("Cancellare la conversazione?")}<p>I messaggi con Pigna verranno rimossi da questo browser. Il diario e i progressi restano disponibili.</p><div class="modal-action"><button class="btn btn-ghost" data-action="close-dialog">Annulla</button><button class="btn btn-error" data-action="clear-chat-confirmed">Cancella la conversazione</button></div>`;
    elements.dialog.showModal();
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
    timer.reset(60);
    Object.assign(ui, initialSession());
    elements.dialog.close();
    storageBanner();
    render(true);
    toast("Copia ripristinata. Ritrovi il tuo percorso in questo browser.");
  },
  "confirm-reset": () => {
    $("#dialog-content").innerHTML =
      `<div class="flex items-start justify-between gap-3 mb-4"><h2 id="dialog-title">Ricominciare il percorso?</h2><button class="btn btn-ghost btn-circle shrink-0" data-action="close-dialog" aria-label="Chiudi">${icon("x-mark")}</button></div><p>Tutti i dati di PREVEDIApp saranno rimossi da questo browser. Puoi esportare una copia prima di proseguire.</p><div class="modal-action flex-wrap"><button class="btn btn-outline" data-action="export-json">Esporta una copia</button><button class="btn btn-error" data-action="reset-confirmed">Cancella i dati</button></div><form method="dialog" class="mt-3"><button class="btn btn-ghost w-full">Annulla</button></form>`;
    $("#entry-dialog").showModal();
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
    timer.reset(60);
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
  "claim",
  "decorate",
  "timer-toggle",
  "join-group",
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
    if (writes && !allowWrite()) return;
    actions[control.dataset.action](control);
  }
});
document.addEventListener("change", (event) => {
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
  if (event.target.id === "plate-meal") ui.plate.meal = event.target.value;
  if (event.target.id === "backup-file" && event.target.files[0])
    previewBackup(event.target.files[0], event.target);
});

document.addEventListener("submit", (e) => {
  if (
    ["entry-form", "community-form", "profile-form", "chat-form"].includes(
      e.target.id,
    ) &&
    !allowWrite()
  ) {
    e.preventDefault();
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
});
elements.dialog.addEventListener("close", () => {
  pendingBackup = null;
  backupVersion++;
});
window.addEventListener("hashchange", navigate);
window.addEventListener("storage", (event) => {
  if (event.key !== KEY && event.key !== null) return;
  if (store.sync(event.newValue)) {
    conversation.cancelPending();
    elements.dialog.close();
    render();
    toast("Percorso aggiornato dall’altra scheda.");
  } else {
    conversation.cancelPending();
    if (timer.snapshot().running) timer.toggle();
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
