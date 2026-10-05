# Verifica daisyUI · PREVEDIApp

La versione precedente usava daisyUI per alcuni pulsanti, campi, barre e dialoghi, ma costruiva pannelli, navigazione, badge, chat e selezioni con CSS proprio. La richiesta dell’utente è stata applicata a tutte le 17 schermate: i componenti visibili ora usano le strutture e le varianti di daisyUI 5.7.47. Tailwind gestisce impaginazione, spazi, dimensioni e adattamento responsive.

## Componenti adottati

| Uso nell’app | Componenti daisyUI e parti effettive |
| --- | --- |
| Pannelli e destinazioni di benessere | `card`, `card-border`, `card-body`, `card-title`, `card-actions`, `card-side` |
| Navigazione desktop e mobile espansa | `drawer`, `drawer-toggle`, `drawer-content`, `drawer-side`, `drawer-overlay`; `menu`, `menu-title`, `menu-active` |
| Intestazione | `navbar`, `navbar-start`, `navbar-end` |
| Navigazione inferiore | `dock`, `dock-label`, `dock-active` sui pulsanti |
| Pulsanti e azioni | `btn` con una sola variante per categoria; `btn-primary`, `btn-outline`, `btn-ghost`, `btn-soft`, `btn-active`, `btn-circle`, `btn-square` |
| Foglie, livello, missioni, ingredienti | `badge` con varianti semantiche `badge-soft`, `badge-primary`, `badge-accent`, `badge-success`, `badge-ghost` |
| Profilo, persone e simboli nei registri | `avatar`, `avatar-placeholder`, con un `div` diretto al loro interno; i ritratti della community usano `avatar` con `img` |
| Diario, missioni, ricompense, community | `list`, `list-row`, `list-col-wrap` |
| Conversazione con Pigna | `chat`, `chat-start`, `chat-end`, `chat-header`, `chat-bubble`; `loading loading-dots` durante la risposta |
| Numeri del percorso e proporzioni del piatto | `stats`, `stat`, `stat-title`, `stat-value`, `stat-desc` |
| Moduli, filtri e test CDC | `fieldset`, `fieldset-legend`, `label`, `input`, `select`, `radio`, `checkbox` |
| Registrazioni e conferma cancellazione | `modal`, `modal-box`, `modal-backdrop`, `modal-action` su un `dialog` HTML nativo |
| Avvisi ed esiti | `alert`, varianti di stato `alert-soft`; `toast` con un `alert` interno |
| Progressi e obiettivi | `progress progress-primary`, valori calcolati dai dati locali |
| Acqua e durata della respirazione | `join`, `join-item`; contatore acqua come `input` di sola lettura |
| Notifiche, separatori, fonti e fondo pagina | `indicator`/`indicator-item`, `divider`, `link`, `footer` |

Il piatto usa `stats` per il modello 50/25/25 e `progress` per le porzioni realmente selezionate. Il movimento settimanale usa `list` e `progress` per ciascun giorno. Le precedenti figure disegnate con CSS sono state sostituite per rispettare la richiesta di usare componenti della libreria.

## Personalizzazione Terra

Il tema è definito con il plugin ufficiale `daisyui/theme` in `src/styles.css`, applicato tramite `data-theme="terra"`. Include tutti i colori, i colori del testo abbinato, i raggi, le dimensioni, il bordo, la profondità e il rumore richiesti dalla libreria.

- Primary: `#4A7C59`.
- Secondary: `#6B6358`.
- Accent: `#C4A66A`.
- Neutral e testo principale: `#4A4E4A`.
- Superfici: `base-100`, `base-200`, `base-300`.
- Esiti: colori semantici `info`, `success`, `warning`, `error`.

Le superfici tonalizzate usano opacità dei colori semantici, ad esempio `bg-primary/10`. Gli SVG sono Heroicons outline. Nunito Sans e Literata e le immagini del prototipo restano locali.

## CSS residuo

Non ci sono classi CSS personalizzate per pannelli, pulsanti, input, navigazione, badge o messaggi. Il file sorgente contiene soltanto plugin/tema, caricamento dei font, tipografia di base, selezione/focus/cursore, animazione della respirazione applicata a un `avatar` e riduzione del movimento. È passato da circa 32 KB a 3,3 KB.

## Verifica

- Build Tailwind/daisyUI completata; sei test delle regole applicative superati.
- Tutte le 17 schermate controllate a 1440 px e 390 px: nessun overflow orizzontale osservato.
- Controllati nel DOM: parti delle card, figlio diretto degli avatar, pulsanti `btn`, controlli nativi con classi daisyUI e liste `menu`.
- Registrazione del sonno dal modal e persistenza dopo ricarica verificate su un’origine di test separata.
- Apertura del drawer da tastiera, chiusura dopo la navigazione e dock verificati.
- Selezione e feedback del quiz, porzioni del piatto (anche ingredienti ripetuti), salvataggio del piatto e risposta della chat verificati; la chat porta in vista l’ultimo messaggio.
- Il detector Impeccable non ha segnalato problemi nei sorgenti esaminati.
- La revisione del contrasto ha portato i testi secondari e i segnaposto a `text-base-content/85`; i badge soft usano testo `base-content` o `accent-content`. I rapporti calcolati sulle superfici controllate sono almeno 4,74:1 per questi testi abilitati. Le etichette disabilitate mantengono gli stati nativi della libreria.

Le verifiche nel browser coprono i componenti e i flussi indicati, senza equivalere a una certificazione di accessibilità o a test esaustivi di tutti i browser.

Riferimenti: [daisyUI 5](https://daisyui.com/docs/use/), [temi personalizzati](https://daisyui.com/docs/themes/), [card](https://daisyui.com/components/card/), [drawer](https://daisyui.com/components/drawer/), [dock](https://daisyui.com/components/dock/), [chat](https://daisyui.com/components/chat/).
