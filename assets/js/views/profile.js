import {
  localDate,
  missions,
  missionDone,
  rewards,
  availablePoints,
} from "../../data.js";
import {
  icon,
  esc,
  heading,
  avatar,
  card,
  link,
  resourceMenu,
  field,
  illustration,
} from "../ui/components.js";

export function profile({ state, recoveryRequired = false }) {
  const form = `<div class="flex items-center gap-3">${avatar(esc((state.name || "P").slice(0, 1).toUpperCase()))}<div class="min-w-0 flex-1"><h2 class="card-title break-words font-serif text-xl font-medium [overflow-wrap:anywhere]">${esc(state.name) || "Piacere di conoscerti."}</h2><p class="mt-1 text-xs text-base-content/85">Un percorso di piccoli passi, fatto per te.</p></div><figure class="shrink-0">${illustration("diario", "size-16 sm:size-24")}</figure></div><form id="profile-form" class="grid gap-4"><fieldset class="fieldset gap-4"><legend class="fieldset-legend">Il tuo profilo</legend>${field("Come ti chiami?", `<input class="input border-secondary/75 placeholder:text-base-content/85 w-full" name="name" value="${esc(state.name)}" placeholder="Il tuo nome" maxlength="40" required autocomplete="given-name">`)}</fieldset><fieldset class="fieldset gap-4"><legend class="fieldset-legend font-serif text-lg font-medium">I tuoi obiettivi personali</legend><p class="text-xs text-base-content/85">Scegli obiettivi adatti a te e alle indicazioni del tuo curante. Sono promemoria personali, non prescrizioni.</p>${field("Movimento giornaliero (minuti)", `<input class="input border-secondary/75 placeholder:text-base-content/85 w-full" type="number" name="movement" min="5" max="180" step="5" value="${state.goals.movement}" required>`)}<div class="grid grid-cols-2 gap-4">${field("Riposo (ore)", `<input class="input border-secondary/75 placeholder:text-base-content/85 w-full" type="number" name="sleep" min="4" max="12" step="0.5" value="${state.goals.sleep}" required>`)}${field("Acqua (bicchieri)", `<input class="input border-secondary/75 placeholder:text-base-content/85 w-full" type="number" name="water" min="1" max="20" step="1" value="${state.goals.water}" required>`)}</div></fieldset><div class="card-actions"><button class="btn btn-primary" type="submit">${icon("check")}Salva il mio profilo</button></div></form>`;
  const data = `${resourceMenu([
    [
      "rischio",
      "clipboard-document-check",
      "Test del rischio CDC",
      "Un questionario educativo, non diagnostico",
    ],
    [
      "informazioni",
      "information-circle",
      "Informazioni e fonti",
      "Come funziona PREVEDIApp",
    ],
  ])}<div class="divider my-0"></div><div><h3>I dati restano qui</h3><p class="mt-2 text-sm text-base-content/85">Profilo, diario e chat sono salvati in questo browser e per questo indirizzo del sito. Non vengono sincronizzati con altri browser o dispositivi. Cancellare i dati del browser rimuove anche il percorso.</p></div><div class="card-actions flex-col"><button class="btn btn-outline w-full h-auto min-h-11 py-2 whitespace-normal" data-action="export-json">${icon("arrow-down-tray")}${recoveryRequired ? "Conserva la copia originale da recuperare" : "Esporta tutti i miei dati"}</button><button class="btn btn-ghost w-full h-auto min-h-11 py-2 whitespace-normal" data-action="clear-chat" ${state.chat.length ? "" : "disabled"}>Cancella la conversazione con Pigna</button></div><div class="divider my-0"></div><fieldset class="fieldset min-w-0 gap-3"><legend class="fieldset-legend font-serif text-lg font-medium">Ripristina una copia</legend><p id="backup-help" class="text-xs text-base-content/85">Scegli un JSON esportato da PREVEDIApp, fino a 2 MB. Prima della sostituzione vedrai un riepilogo e potrai annullare. La copia originale illeggibile serve a conservare il file per un recupero; non è una copia JSON già verificata.</p><label class="label text-sm text-base-content" for="backup-file">Copia del percorso (JSON)</label><input id="backup-file" type="file" accept=".json,application/json" class="file-input border-secondary/75 w-full min-w-0" aria-describedby="backup-help backup-status"><p id="backup-status" role="status" aria-live="polite" class="text-sm"></p></fieldset><div class="divider my-0"></div><fieldset class="fieldset gap-3"><legend class="fieldset-legend font-serif text-lg font-medium">Ricomincia il percorso</legend><p class="text-xs text-base-content/85">${recoveryRequired ? "Sostituisci la copia protetta con un percorso vuoto. Conserva prima il file originale se vuoi tentare un recupero." : "Rimuovi profilo, diario e progressi da questo browser. Prima puoi esportarne una copia."}</p><button class="btn btn-outline btn-error w-full" data-action="confirm-reset">${icon("trash")}Cancella i dati locali</button></fieldset>`;
  return `${heading("Il tuo spazio, il tuo ritmo.", "Personalizza il percorso e gestisci i dati di questo browser.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", form)}${card("Le tue informazioni", data)}</div>`;
}

export function notifications({ state }) {
  const pending = missions.filter((mission) => !missionDone(state, mission.id));
  const unlocked = rewards.filter(
    (reward) =>
      !state.claimed.includes(reward.id) &&
      availablePoints(state) >= reward.cost,
  );
  const items = pending.map((mission) => [
    mission.icon,
    mission.title,
    mission.description,
    mission.route,
    mission.action,
  ]);
  unlocked.forEach((reward) =>
    items.push([
      reward.icon,
      `${reward.name} è disponibile.`,
      `Hai abbastanza foglie per questa ricompensa virtuale: ${reward.cost} foglie.`,
      "giardino",
      "Scegli la ricompensa",
    ]),
  );
  if (!pending.length)
    items.unshift([
      "check",
      "Hai coltivato i quattro gesti di oggi.",
      "Le attività sono nel diario. Puoi ritrovarle e modificarle quando vuoi.",
      "diario",
      "Apri il diario",
    ]);
  const rows = `<p class="text-sm text-base-content/85">Questi promemoria seguono le attività registrate oggi e le ricompense che puoi sbloccare.</p><ul class="list">${items.map(([symbol, title, text, route, label]) => `<li class="list-row items-start px-0">${avatar(icon(symbol))}<div><h3>${title}</h3><p class="mt-2 text-sm text-base-content/85">${text}</p>${link(route, label)}</div></li>`).join("")}</ul>`;
  const read =
    state.notificationsRead &&
    (!state.notificationsReadDate ||
      state.notificationsReadDate === localDate());
  return `${heading("Le novità del tuo percorso.", "Promemoria dentro l’app, senza notifiche sul dispositivo.", `<button class="btn btn-outline" data-action="read-notifications" ${read ? "disabled" : ""}>${icon("check")}${read ? "Lette per oggi" : "Segna come lette"}</button>`)}${card("I tuoi piccoli passi di oggi", rows)}`;
}

export function info() {
  return `${heading("Un percorso trasparente.", "Come funziona l’app e da dove vengono i contenuti.")}<article class="card card-border max-w-4xl bg-base-100"><div class="card-body gap-7 p-5 sm:p-6"><section class="max-w-[72ch]"><h2>PREVEDIApp</h2><p class="mt-3">Un prototipo interattivo di benessere ricostruito dal progetto Stitch “Percorso Benessere Prediabete”. Il tema Terra e Alberello provengono dal prototipo; Pigna è un’illustrazione realizzata per questa versione.</p></section><section class="max-w-[72ch]"><h2>I dati, in questo browser</h2><p class="mt-3">L’app è statica: non ha account o un server per i dati personali. Nome, obiettivi, diario, progressi, ricompense, chat e interazioni dimostrative restano nel browser, associati all’indirizzo del sito.</p><ul class="mt-3 list-disc space-y-3 pl-5"><li>Un altro browser, dispositivo o indirizzo del sito ha un percorso separato.</li><li>Dal profilo puoi esportare un JSON e ripristinarlo in un altro browser. Prima della sostituzione puoi controllare il riepilogo e annullare.</li><li>Se un salvataggio è illeggibile, l’app protegge il file originale. Conservane una copia, ripristina un JSON verificato oppure scegli esplicitamente un nuovo percorso.</li></ul><a class="btn btn-ghost mt-3 min-h-11 px-0" href="#profilo">Gestisci i tuoi dati ${icon("arrow-right")}</a></section><section class="max-w-[72ch]"><h2>Diario e cronologia</h2><ul class="mt-3 list-disc space-y-3 pl-5"><li>Nel diario puoi correggere data e contenuto, aggiungere note e annullare una rimozione entro 12 secondi.</li><li>La chat conserva gli ultimi 40 messaggi, comprese le risposte. I messaggi precedenti vengono rimossi.</li><li>I quiz conservano gli ultimi 200 tentativi complessivi. Conteggi e migliori risultati si riferiscono a questo storico; le categorie completate restano riconoscibili dalle foglie assegnate.</li><li>Un quiz interrotto si può riprendere per categoria finché questa scheda resta aperta. Le risposte del test del rischio rimangono soltanto in memoria durante la sessione.</li></ul><p class="mt-3">Esporta una copia prima di cancellare i dati del browser o se vuoi conservare la cronologia prima che raggiunga il limite.</p></section><section class="max-w-[72ch]"><h2>Attività e foglie</h2><p class="mt-3">Le quattro missioni assegnano rispettivamente 20, 25, 15 e 20 foglie alla prima registrazione del giorno. Ogni categoria di quiz assegna 20 foglie una volta al giorno.</p><p class="mt-3">Ripetere una missione o eliminare e reinserire una voce non assegna foglie aggiuntive. Il livello aumenta ogni 100 foglie; le ricompense consumano foglie disponibili senza ridurre la crescita raggiunta.</p></section><section class="max-w-[72ch]"><h2>Contenuti educativi</h2><p class="mt-3">Le informazioni generali non sono diagnosi, prescrizioni o raccomandazioni mediche personalizzate. Il test CDC è una traduzione educativa di uno strumento statunitense e non una validazione clinica di questa app. Per interpretare valori, sintomi o fattori di rischio rivolgiti al tuo medico.</p><ul class="mt-3 list-disc space-y-4 pl-5"><li><a class="link link-hover" href="https://www.cdc.gov/diabetes/widgets/risktest/how-your-test-is-scored.html" target="_blank" rel="noopener noreferrer">CDC · Punteggio del test del rischio</a>: fascia d’età, sesso e diabete gestazionale, familiarità, pressione, attività e BMI. Il test usa una soglia di 5 punti.</li><li><a class="link link-hover" href="https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html" target="_blank" rel="noopener noreferrer">CDC · Metodo del piatto</a>: metà verdure non amidacee, un quarto proteine e un quarto alimenti con carboidrati.</li></ul></section><section class="max-w-[72ch]"><h2>Pigna e la community</h2><p class="mt-3">Pigna riconosce parole chiave e usa risposte predefinite su alimentazione, attività fisica, sonno e stress e benessere. Non è collegata a un modello AI, a un professionista sanitario o a un servizio clinico.</p><p class="mt-3">La community usa persone, gruppi e messaggi dimostrativi. Nessuna interazione viene inviata ad altre persone.</p></section><section class="max-w-[72ch]"><h2>Accessibilità</h2><p class="mt-3">Le azioni sono utilizzabili da tastiera, i moduli hanno etichette, gli esiti sono annunciati e il movimento segue la preferenza di riduzione delle animazioni. Il piatto funziona con pulsanti, senza richiedere trascinamenti.</p></section><a class="btn btn-ghost mt-1 min-h-11 self-start" href="#percorso">Torna al tuo percorso ${icon("arrow-right")}</a></div></article>`;
}
