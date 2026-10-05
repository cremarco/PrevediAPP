import { icon, esc, heading, avatar } from "../ui/components.js";

const welcome =
  "Ciao! Sono Pigna. Ti accompagno con idee semplici per alimentazione, movimento, riposo e pause di benessere. Da dove vuoi cominciare?";

export function assistant({ state, chatBusy }) {
  const bubble = (role, text) =>
    `<div class="chat ${role === "user" ? "chat-end" : "chat-start"}"><div class="chat-header mb-1 text-xs">${role === "user" ? "Tu" : "Pigna"}</div><div class="chat-bubble max-w-[min(90%,65ch)] whitespace-pre-wrap break-words text-sm leading-relaxed ${role === "user" ? "chat-bubble-primary" : "bg-secondary/10 text-base-content"}">${esc(text)}</div></div>`;
  const messages = `<div id="messages" class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-5" role="log" tabindex="0" aria-label="Conversazione con Pigna" aria-live="polite">${bubble("assistant", welcome)}${state.chat.map((m) => bubble(m.role, m.text)).join("")}${chatBusy ? '<div class="chat chat-start"><div class="chat-header text-xs">Pigna</div><div class="chat-bubble bg-secondary/10 text-base-content"><span class="loading loading-dots loading-sm" aria-hidden="true"></span><span class="sr-only">Pigna sta preparando un’idea…</span></div></div>' : ""}</div>`;
  const composer = `<form id="chat-form" class="shrink-0 border-t border-base-300 p-4 sm:px-6"><fieldset class="fieldset gap-2 p-0"><legend class="fieldset-legend pt-0 pb-2">Scrivi a Pigna</legend><label class="sr-only" for="chat-message">Scrivi a Pigna</label><div class="flex gap-2"><input id="chat-message" class="input border-secondary/75 placeholder:text-base-content/85 min-h-11 min-w-0 flex-1" name="message" placeholder="Chiedi un’idea a Pigna…" maxlength="500" required ${chatBusy ? "disabled" : ""}><button class="btn btn-primary btn-square min-h-11 min-w-11" aria-label="Invia messaggio" ${chatBusy ? "disabled" : ""}>${icon("paper-airplane")}</button></div></fieldset></form>`;
  const suggestions = [
    ["chart-pie", "Idee per uno spuntino"],
    ["bolt", "Un po’ di movimento"],
    ["moon", "Una sera tranquilla"],
    ["face-smile", "Un momento di calma"],
  ];
  return `${heading("Un piccolo consiglio, con Pigna.", "Idee per accompagnare il tuo percorso quotidiano.")}<div class="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_18rem]"><section class="card card-border min-w-0 bg-base-100" aria-labelledby="conversation-title"><div class="card-body h-[clamp(20rem,calc(100dvh-20rem),38rem)] gap-0 p-0 @4xl:h-[clamp(24rem,calc(100dvh-17rem),42rem)]"><div class="flex shrink-0 items-center gap-3 border-b border-base-300 px-4 py-4 sm:px-6">${avatar(icon("chat-bubble-left-right"), "bg-primary/15 text-primary")}<div class="min-w-0"><h2 id="conversation-title" class="card-title font-serif text-lg font-medium">Conversazione con Pigna</h2><p class="mt-1 text-xs text-base-content/85">Risposte guidate</p></div></div>${messages}${composer}</div></section><aside class="card card-border min-w-0 bg-accent/20" aria-labelledby="pigna-guide-title"><div class="card-body gap-5 p-5 sm:p-6"><div class="flex items-center gap-4"><figure class="shrink-0"><img src="assets/images/pigna.png" alt="Pigna, la compagna del tuo percorso" width="75" height="85" class="h-16 w-16 object-contain"></figure><h2 id="pigna-guide-title" class="card-title font-serif text-xl font-medium">Sono qui per te.</h2></div><p class="text-xs text-base-content/85">Risposte guidate, senza un servizio AI esterno. Nessuna indicazione medica personalizzata.</p><div class="card-actions grid w-full gap-2 min-[360px]:grid-cols-2 @4xl:grid-cols-1">${suggestions.map(([sym, t]) => `<button class="btn btn-outline h-auto min-h-12 w-full justify-start gap-3 px-3 py-3 text-left text-sm whitespace-normal" data-action="chat-suggestion" data-text="${t}" ${chatBusy ? "disabled" : ""}>${icon(sym)}<span class="min-w-0">${t}</span></button>`).join("")}</div><p class="text-xs text-base-content/85">La conversazione resta nel browser. Puoi cancellarla dal profilo.</p></div></aside></div>`;
}

export function reply(text) {
  const s = text.toLowerCase();
  if (/farmac|insulin|diagnos|mg\/|glicem|diabet|dolore|sintom/.test(s))
    return "Per valori di glicemia, sintomi, diagnosi o farmaci, parlane con il tuo medico. Qui posso aiutarti a usare il diario e trovare idee generali per il benessere, senza interpretare dati clinici.";
  if (/spuntin|mang|past|cibo|fame|nutriz/.test(s))
    return "Un’idea per uno spuntino? Puoi esplorare yogurt bianco, frutta di stagione o una piccola porzione di frutta a guscio, tenendo conto di allergie e delle tue esigenze.\n\nPer il prossimo pasto, prova il gioco “Crea il piatto” nella sezione Alimentazione.";
  if (/moviment|cammin|pass|sport|attivit/.test(s))
    return "Una passeggiata al tuo ritmo può essere un piccolo inizio. Scegli una durata adatta a te e alle indicazioni del tuo curante.\n\nNella sezione Attività fisica puoi registrare i minuti e seguire il tuo obiettivo personale.";
  if (/sonn|dorm|sera|ripos/.test(s))
    return "Per una sera tranquilla, puoi mettere in pausa le notifiche e ritagliarti un momento con un libro o un’attività che ti rilassa.\n\nDomattina, racconta come hai dormito nella sezione Sonno: il diario ti aiuterà a osservare le abitudini.";
  if (/stress|calm|respiro|respira|ansia/.test(s))
    return "Proviamo a fare spazio a un momento tranquillo? Scegli un posto comodo e osserva il tuo respiro senza forzarlo.\n\nTrovi una pausa guidata da 1, 3 o 5 minuti nella sezione Benessere. Puoi interromperla in qualsiasi momento.";
  if (/foglie|punt|giardin|alber/.test(s))
    return "Alberello cresce con le attività registrate. Ogni missione dà foglie una volta al giorno, e ogni 100 foglie raggiungi un livello.\n\nNel Giardino puoi usare le foglie per sbloccare ricompense virtuali.";
  return "Partiamo da un piccolo gesto: un pasto da raccontare, qualche minuto di movimento, una pausa o una notte di riposo.\n\nScegli uno dei suggerimenti, oppure apri il tuo percorso per trovare il prossimo passo.";
}
