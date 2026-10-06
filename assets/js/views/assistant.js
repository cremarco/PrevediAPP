import { icon, esc, heading, avatar } from "../ui/components.js";

const welcome =
  "Ciao! Sono Pigna. Ho risposte predefinite su quattro temi: alimentazione, attività fisica, sonno e stress e benessere. Scegli un tema vicino al campo di scrittura, oppure scrivimi su uno di questi argomenti.";

export const guidedFallback =
  "Questo messaggio non corrisponde alle mie risposte predefinite. Scegli un tema qui sotto: posso accompagnarti con idee generali e indicarti dove registrare le tue attività.";

const suggestions = [
  ["chart-pie", "Alimentazione", "Idee per uno spuntino"],
  ["bolt", "Attività fisica", "Un po’ di movimento"],
  ["moon", "Sonno", "Una sera tranquilla"],
  ["face-smile", "Stress e benessere", "Un momento di calma"],
];
const topicButtons = (busy, compact = false) =>
  `<div class="grid gap-2 ${compact ? "" : "min-[360px]:grid-cols-2"}">${suggestions.map(([symbol, label, text]) => `<button type="button" class="btn btn-outline h-auto min-h-11 justify-start gap-2 px-3 py-2 text-left text-sm whitespace-normal" data-action="chat-suggestion" data-text="${text}" ${busy ? "disabled" : ""}>${icon(symbol)}<span class="min-w-0">${label}</span></button>`).join("")}</div>`;

// Only the authored demo replies receive actions. Imported free text stays escaped.
const responseRoutes = new Map([
  [reply("cena"), ["piatto", "Crea il tuo piatto"]],
  [reply("spuntino"), ["piatto", "Crea il tuo piatto"]],
  [reply("frigo"), ["frigo", "Apri la tua dispensa"]],
  [reply("ricetta"), ["ricette", "Esplora le ricette"]],
  [reply("movimento"), ["attivita", "Registra il tuo movimento"]],
  [reply("sonno"), ["sonno", "Apri il diario del sonno"]],
  [reply("stress"), ["stress", "Inizia una pausa"]],
  [reply("foglie"), ["giardino", "Apri il tuo giardino"]],
  [reply("glicemia"), ["diario", "Apri il tuo diario"]],
]);
const responseAction = (text) => {
  const action = responseRoutes.get(text);
  return action
    ? `<div class="mt-4 whitespace-normal"><a class="btn btn-outline h-auto min-h-11 max-w-full py-2 whitespace-normal" href="#${action[0]}">${action[1]}${icon("arrow-right")}</a></div>`
    : "";
};

export function assistant({ state, chatBusy }) {
  const bubble = (role, text) =>
    `<div class="chat ${role === "user" ? "chat-end" : "chat-start"}"><div class="chat-header mb-1 text-xs">${role === "user" ? "Tu" : "Pigna"}</div><div class="chat-bubble max-w-[min(90%,65ch)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-relaxed ${role === "user" ? "chat-bubble-primary" : "bg-secondary/10 text-base-content"}">${esc(text)}${role === "assistant" ? responseAction(text) : ""}${role === "assistant" && text === guidedFallback ? `<div class="mt-4 whitespace-normal">${topicButtons(chatBusy, true)}</div>` : ""}</div></div>`;
  const messages = `<div id="messages" class="h-[clamp(12rem,calc(100dvh-32rem),24rem)] shrink-0 overflow-y-auto @4xl:h-[clamp(14rem,calc(100dvh-27rem),30rem)] overscroll-contain px-4 py-3 sm:px-6 sm:py-5" role="region" tabindex="0" aria-label="Cronologia della conversazione con Pigna" aria-busy="${!!chatBusy}">${bubble("assistant", welcome)}${state.chat.map((m) => bubble(m.role, m.text)).join("")}${chatBusy ? '<div class="chat chat-start"><div class="chat-header text-xs">Pigna</div><div class="chat-bubble bg-secondary/10 text-base-content"><span class="loading loading-dots loading-sm" aria-hidden="true"></span><span class="sr-only">Pigna sta preparando un’idea…</span></div></div>' : ""}</div>`;
  const composer = `<form id="chat-form" class="shrink-0 border-t border-base-300 p-4 sm:px-6"><p data-draft-status class="mb-3 text-sm text-base-content/90" hidden>Bozza ripresa. Il messaggio è ancora da inviare.</p><details class="collapse collapse-arrow mb-3 bg-base-200"><summary class="collapse-title min-h-11 py-3 text-sm font-semibold">Scegli uno dei 4 temi</summary><div class="collapse-content">${topicButtons(chatBusy)}<p class="mt-3 text-xs text-base-content/90">Risposte predefinite, senza AI esterna o indicazioni mediche personalizzate.</p></div></details><fieldset class="fieldset gap-2 p-0"><legend class="fieldset-legend pt-0 pb-2">Scrivi a Pigna</legend><label class="sr-only" for="chat-message">Scrivi a Pigna su uno dei quattro temi</label><div class="flex gap-2"><input id="chat-message" class="input border-secondary/75 placeholder:text-base-content/90 min-h-11 min-w-0 flex-1" name="message" placeholder="Scrivi sul tema che hai scelto…" maxlength="500" required aria-describedby="pigna-contract"><button class="btn btn-primary btn-square min-h-11 min-w-11" aria-label="Invia messaggio" ${chatBusy ? "disabled" : ""}>${icon("paper-airplane")}</button></div><p id="pigna-contract" class="text-xs text-base-content/90">Pigna riconosce parole chiave nei 4 temi. Le risposte sono predefinite.</p></fieldset></form>`;
  return `${heading("Un piccolo consiglio, con Pigna.", "Idee per accompagnare il tuo percorso quotidiano.")}<div class="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_18rem]"><section class="card card-border min-w-0 bg-base-100" aria-labelledby="conversation-title"><div class="card-body gap-0 p-0"><div class="flex shrink-0 items-center gap-3 border-b border-base-300 px-4 py-4 sm:px-6">${avatar(icon("chat-bubble-left-right"), "bg-primary/15 text-primary")}<div class="min-w-0"><h2 id="conversation-title" class="card-title font-serif text-lg font-medium">Conversazione con Pigna</h2><p class="mt-1 text-xs text-base-content/90">Risposte predefinite · 4 temi</p></div></div>${messages}${composer}</div></section><aside class="card card-border min-w-0 bg-accent/20" aria-labelledby="pigna-guide-title"><div class="card-body gap-5 p-5 sm:p-6"><div class="flex items-center gap-4"><figure class="shrink-0"><img src="assets/images/pigna.png" alt="Pigna, la compagna del tuo percorso" width="75" height="85" class="h-16 w-16 object-contain"></figure><h2 id="pigna-guide-title" class="card-title font-serif text-xl font-medium">Sono qui per te.</h2></div><p class="text-xs text-base-content/90">Risposte guidate, senza un servizio AI esterno. Nessuna indicazione medica personalizzata.</p><p class="text-xs text-base-content/90">Nel browser restano gli ultimi 40 messaggi, comprese le risposte. I precedenti vengono rimossi. Esporta la conversazione dal profilo se vuoi conservarla.</p><a class="btn btn-ghost min-h-11" href="#conosci-pigna">Conosci Pigna ${icon("arrow-right")}</a><a class="btn btn-outline min-h-11" href="#profilo">Gestisci la conversazione ${icon("arrow-right")}</a></div></aside></div>`;
}

export function reply(text) {
  const s = text.toLowerCase();
  if (/farmac|insulin|diagnos|mg\/|glicem|diabet|dolore|sintom/.test(s))
    return "Per valori di glicemia, sintomi, diagnosi o farmaci, parlane con il tuo medico. Qui posso aiutarti a usare il diario e trovare idee generali per il benessere, senza interpretare dati clinici.";
  if (/ricett/.test(s))
    return "Nella pagina Ricette, cerca per nome o usa il filtro e apri “Vedi ricetta”. Nella preparazione puoi spuntare i passi che hai completato; le spunte restano solo in questa scheda e si azzerano alla ricarica.\n\nPer registrare il pasto, scegli “Racconta questo pasto”, completa il modulo e salva nel diario. Le spunte non aggiungono automaticamente una registrazione.";
  if (/frigo|dispens/.test(s))
    return "Nel Frigo, tocca gli ingredienti del mercato per aggiungerli alla tua dispensa o rimuoverli. Quando hai ingredienti dei tre gruppi del gioco, usa “Usa la mia dispensa” per aprire un piatto da verificare. Puoi anche scegliere “Scegli liberamente” e comporre le quattro porzioni.\n\nLe scelte della dispensa restano in questo browser.";
  if (/cena|pranz|colazion|aliment|piatt/.test(s))
    return "Per trovare un’idea per il pasto, puoi esplorare il gioco “Crea il piatto” nella sezione Alimentazione. Scegli gli ingredienti, verifica la composizione e salva il pasto nel diario.\n\nÈ un’attività educativa: considera le tue esigenze e le indicazioni del tuo curante.";
  if (/spuntin|mang|past|cibo|fame|nutriz/.test(s))
    return "Un’idea per uno spuntino? Puoi esplorare yogurt bianco, frutta di stagione o una piccola porzione di frutta a guscio, tenendo conto di allergie e delle tue esigenze.\n\nPer il prossimo pasto, prova il gioco “Crea il piatto” nella sezione Alimentazione.";
  if (/moviment|cammin|pass|sport|attivit/.test(s))
    return "Una passeggiata al tuo ritmo può essere un piccolo inizio. Scegli una durata adatta a te e alle indicazioni del tuo curante.\n\nNella sezione Attività fisica puoi registrare i minuti e seguire il tuo obiettivo personale.";
  if (/sonn|dorm|sera|ripos/.test(s))
    return "Per una sera tranquilla, puoi mettere in pausa le notifiche e ritagliarti un momento con un libro o un’attività che ti rilassa.\n\nDomattina, racconta come hai dormito nella sezione Sonno: il diario ti aiuterà a osservare le abitudini.";
  if (/stress|calm|respiro|respira|ansia/.test(s))
    return "Proviamo a fare spazio a un momento tranquillo? Scegli un posto comodo e osserva il tuo respiro senza forzarlo.\n\nTrovi una pausa guidata da 1, 3 o 5 minuti nella sezione Stress e benessere. Puoi interromperla in qualsiasi momento.";
  if (/foglie|punt|giardin|alber/.test(s))
    return "Alberello cresce con le attività registrate. Ogni missione dà foglie una volta al giorno, e ogni 100 foglie raggiungi un livello.\n\nNel Giardino puoi usare le foglie per sbloccare ricompense virtuali.";
  return guidedFallback;
}
