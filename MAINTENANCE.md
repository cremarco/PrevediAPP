# Manutenzione di PREVEDIApp

Refactoring ed estensione del prototipo del 5 ottobre 2026. JavaScript nativo a moduli; HTML, Tailwind 4 e componenti daisyUI 5 con tema Terra e Heroicons.

## Dove intervenire

| File / cartella | Responsabilità |
| --- | --- |
| `index.html` | Shell statica, navigazione e dialogo nativo |
| `assets/app.js` | Punto di ingresso, importa il controller |
| `assets/js/controller.js` | Eventi delegati, coordinamento di azioni, rendering, focus e sincronizzazione |
| `assets/js/config.js` | Nomi delle route, navigazioni e ruoli cromatici delle categorie |
| `assets/js/router.js` | Validazione delle route e caricamento su richiesta delle schermate |
| `assets/js/views/` | Sette moduli per percorso, benessere, alimentazione, community, Pigna, apprendimento e profilo |
| `assets/js/ui/components.js` | Helper HTML condivisi con struttura daisyUI nativa |
| `assets/js/ui/dialogs.js` | Registrazione, modifica e riepilogo di ripristino con dialogo nativo |
| `assets/js/records.js` | Validazione di date/voci, modifica atomica, rimozione/annullamento e messaggi locali |
| `assets/js/insights.js` | Report 7/30 giorni, riepilogo quiz, tappe e piatto dalla dispensa |
| `assets/js/backup.js` | Validazione della copia JSON, limite 2 MB e importazione dei soli campi noti |
| `assets/js/store.js` | Lettura, salvataggio, errori e sincronizzazione dei dati |
| `assets/js/session.js` | Stato transitorio di filtri, piatto, quiz e test |
| `assets/js/timer.js` | Orologio della respirazione e ciclo dei callback |
| `assets/js/conversation.js` | Invio, risposta differita e cancellazione delle operazioni Pigna |
| `assets/js/export.js` | CSV, Blob e download |
| `assets/data.js` | Dati del prodotto, schema v1 e regole di punti, ricompense, piatto e test |
| `assets/icons.js` | SVG ufficiali Heroicons |
| `src/styles.css` | Tema Terra, font, tipografia, accessibilità e respirazione |

Le schermate ricevono uno snapshot esplicito `{ state, ui, timer, chatBusy }` e restituiscono HTML. Non scrivono nel DOM o nel salvataggio. Il controller possiede il DOM e gli eventi; timer e conversazione possiedono i loro callback. Questo consente di verificare tutte le schermate in Node senza una simulazione del browser.

## Stato e compatibilità

- `store.state` contiene il percorso persistente; la chiave resta `prevediapp.v1` e lo schema resta versione 1.
- I salvataggi validi esistenti vengono mantenuti. `posts`, `quizHistory` e le letture delle notifiche sono campi opzionali; i vecchi quiz risultano completati senza inventare un punteggio storico. Chat e selezioni opzionali danneggiate vengono normalizzate, impedendo il blocco delle schermate.
- Un errore di storage lascia le modifiche in memoria e rende disponibile l’avviso esistente. Una sincronizzazione non leggibile preserva lo stato corrente.
- Le modifiche del diario mantengono identità e punti già assegnati. L’annullamento di una rimozione dura 12 secondi e ripristina la posizione originale; viene invalidato se cambia lo stato da ripristino o sincronizzazione.
- Il ripristino valida e clona il JSON prima di sostituire lo stato, con riepilogo e conferma. Un’importazione non valida non tocca il percorso attuale.
- `ui` contiene solo dati transitori. Le risposte del test educativo non entrano in localStorage.
- Cancellare la chat, azzerare il percorso o ricevere un salvataggio da un’altra scheda annulla la risposta pendente. Il token della richiesta impedisce a un callback già avviato di ripristinare messaggi cancellati.
- Il timer non programma lavoro quando è fermo. In esecuzione aggiorna i secondi usando l’orologio reale, gestendo pause, ritardi e reset senza accumulare intervalli.

## Sviluppo e verifica

Con Node 24 e npm:

```sh
npm ci
npm run format:check
npm run check
npm run build
```

`npm run format` formatta JavaScript, script e test con Prettier. Le versioni di esbuild e Prettier sono fissate in `package.json`; `package-lock.json` rende riproducibili le dipendenze. GitHub Actions verifica formato, sintassi, test e build prima della pubblicazione.

Il comando `check` verifica ricorsivamente la sintassi dei moduli. I 40 test coprono le regole del prodotto, compatibilità e guasti dello storage, callback del timer, risposte tardive della chat, route non valide, ripetizione di un caricamento fallito, rendering di tutte le schermate, validazione e modifiche del diario, annullamento, report e tappe, compatibilità del ripristino ed esportazione CSV.

Per aggiungere una schermata:

1. Aggiungi il nome della route in `config.js` e il loader esplicito in `router.js`.
2. Esporta una funzione di rendering da un modulo in `views/`, riusando gli helper daisyUI.
3. Mantieni le classi Tailwind complete nei sorgenti. `src/styles.css` analizza ricorsivamente `assets/**/*.js`.
4. Collega le azioni tramite `data-action` nel controller; tieni le regole pure nel dominio.
5. Esegui i controlli e prova route, tastiera e viewport mobile nel browser.

## Build pubblicabile

La build pulisce soltanto `dist/`, copia HTML, CSS e asset, quindi genera JavaScript minificato con esbuild e schermate separate. I chunk hanno nomi con hash e import relativi; i percorsi funzionano anche sotto `/PrevediAPP/` su GitHub Pages. I file JavaScript sorgente non vengono duplicati nella distribuzione. `dist/.nojekyll` è generato automaticamente.

Pubblica tutto il contenuto di `dist/`, inclusa `assets/chunks/`. `assets/app.js` sorgente e quello in `dist/` hanno ruoli diversi: modifica i sorgenti, poi ricompila. La build non richiede servizi esterni a runtime.

## Risultati del refactoring iniziale

| Misura | Prima | Dopo |
| --- | ---: | ---: |
| JavaScript all’apertura del percorso, byte non compressi | 95.750 | 56.490 |
| JavaScript di tutte le schermate della distribuzione | 95.750 | 92.569 |
| Callback periodici del timer fermo | 4/s | 0 |
| Aggiornamenti del timer in esecuzione | 4/s | 1/s |
| Formattazione di 1.000 date, singola misura locale Node | 26,13 ms | 0,49 ms |

Questa tabella misura il refactoring prima delle successive estensioni del prototipo; non rappresenta il payload attuale. Il payload iniziale è calcolato dal grafo esbuild: entrypoint, import statici e modulo del percorso. Il calo è del 41%; i moduli delle altre aree vengono richiesti durante la navigazione. I tempi di formattazione sono un confronto locale del formatter riutilizzato, non una misura dei Core Web Vitals o della velocità su dispositivi reali.

La navigazione viene ricostruita solo quando cambia la route; nome e data vengono aggiornati quando cambiano. Le icone della shell vengono inserite una sola volta. Immagini e font conservano i file originali.

## Verifica nel browser

Prima del refactoring sono stati registrati HTML, contenuti e controlli delle 17 route. Dopo la build, il confronto a 1440 × 1000 e 390 × 844 coincide in tutte le 34 osservazioni, senza overflow orizzontale o immagini mancanti.

Provati nell’origine QA separata: registrazione movimento e persistenza dopo ricarica; quiz completo; piatto con ingrediente ripetuto e registrazione nel diario; completamento della respirazione, pausa/reset e durata; invio e risposta di Pigna; salvataggio del profilo; percorso completo del test educativo con il ramo che salta la domanda non applicabile. Nessun errore o warning console osservato.

I test QA non scrivono nei salvataggi delle anteprime dell’utente. La build è stata verificata anche sotto `/PrevediAPP/`. Prova nativa: [schermata verificata](output/refactor-verifica-desktop.jpg), con provenienza incorporata nel JPEG. Metriche dettagliate in `.impeccable/review/refactor-metrics.json` e grafo della build in `.impeccable/review/build-metafile.json`.

## Misure dopo il completamento

La versione al completamento, prima delle successive grafiche di pagina, ha 71.212 byte JavaScript richiesti per aprire il percorso e 113.821 byte in tutte le schermate, non compressi. Il CSS compilato è 127.600 byte. I tre nuovi giardini WebP aggiungono complessivamente circa 134 kB e vengono usati solo se selezionati. Il ripristino e le schermate secondarie restano caricati su richiesta. Il rapporto `.impeccable/review/completion/metrics.json` conserva le misure di quella build.

La nuova verifica copre 17 route a 1440 × 1000, 1280 × 1000 e 390 × 844: 51 osservazioni senza overflow orizzontale. I flussi completati, le prove native e i limiti del prototipo sono in [PROTOTYPE-COMPLETION.md](PROTOTYPE-COMPLETION.md).

## Grafiche delle pagine

`illustration()` risolve una lista chiusa di sei WebP locali. `illustratedTitle()` mantiene gli accenti accanto ai titoli; l’argomento opzionale `scene` di `card()` usa le parti native daisyUI `figure` e `card-body`. I componenti che ricevono l’immagine condividono dimensioni responsive e semantica decorativa; le immagini non determinano selezioni, punti o quantità. Asset e prompt sono documentati in [ILLUSTRATION-ASSETS.md](ILLUSTRATION-ASSETS.md).

La build di questa estensione richiede 71.992 byte JavaScript per il percorso e 114.806 byte per tutte le schermate, non compressi; CSS 129.371 byte. Le sei nuove scene occupano 318.918 byte complessivi, si riutilizzano fra route e hanno caricamento lazy, decodifica async e dimensioni dichiarate. I PNG master restano negli artefatti locali e non sono caricati dal sito.

Verifica: 17 route a quattro larghezze (320, 390, 1280 e 1440 px), 68 osservazioni senza overflow o immagini rotte; 12 conferme sulle tre intestazioni compattate, 28 catture native e sette verifiche dei flussi. Formattazione, 40 test e build passati. Metriche nel rapporto `.impeccable/review/illustrations/metrics.json`; revisione grafica e documentazione nella stessa cartella. Le prove usano l’origine QA separata dalle anteprime dell’utente.
