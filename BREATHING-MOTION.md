# Guida alla respirazione

Aggiornamento del 6 ottobre 2026. Il componente usa le parti native daisyUI `radial-progress`, `avatar`, `join`, `toggle` e pulsanti; Pigna è l’immagine esistente. Palette Terra e Heroicons rimangono quelli del prototipo.

L’avatar cresce e si raccoglie in un ciclo visivo di otto secondi, con quattro secondi per ogni metà, come il ritmo della guida precedente. «Inspira» e «Espira» restano ferme sotto il cerchio, con i secondi della fase; il bordo mostra l’avanzamento della pausa intera. Il movimento può essere spento con il toggle Animazione: testo, timer e registrazione funzionano anche senza il movimento. Il ritmo è una guida visiva facoltativa, da seguire soltanto se confortevole; non impone trattenimenti del respiro.

## Continuità e accessibilità

Il timer conserva i millisecondi rimanenti anche in pausa. La stessa funzione `breathingState()` determina la fase del rendering iniziale e degli aggiornamenti: tornare sulla pagina o ridisegnare la card non ricomincia dalla prima fase. Premere pausa dopo la scadenza completa la sessione una sola volta, senza riattivarla. Il progresso circolare ha nome, valore e testo numerico accessibili; solo il cambio della fase viene annunciato dal relativo status.

Una Web Animation modifica esclusivamente transform e opacity dell’avatar; le parole e le dimensioni della card rimangono ferme. Si arresta fuori vista e quando la scheda è nascosta, mantenendo il tempo della sessione. Le preferenze di movimento ridotto disabilitano l’espansione e mantengono le indicazioni testuali. Un observer obsoleto non può cambiare lo stato di un’animazione successiva.

## Codice e riferimenti

- `assets/js/timer.js`: tempo preciso, pausa/ripresa, scadenza e cancellazione.
- `assets/js/breathing.js`: stato di fase puro e gestione dell’animazione, visibilità e preferenze.
- `assets/js/controller.js`: montaggio/smontaggio durante il rendering e aggiornamenti del timer.
- `assets/js/views/wellness.js`: struttura nativa daisyUI e controlli.
- `tests/breathing.test.mjs`: verifiche dei confini temporali e del ciclo di vita.

La gestione del movimento usa le API di riproduzione, pausa e tempo corrente illustrate nella [documentazione MDN sulle Web Animations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API). Il comportamento per il movimento ridotto segue la [tecnica W3C C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html), conservando il feedback utile mentre elimina l’espansione.
