# Manutenzione di PREVEDIApp

Refactoring ed estensione del prototipo del 5 ottobre 2026, con correzioni dell’interfaccia, recupero dati, completamento delle pagine Stitch e widget delle azioni del 6 ottobre. JavaScript nativo a moduli; HTML, Tailwind 4 e componenti daisyUI 5 con tema Terra e Heroicons.

## Dove intervenire

| File / cartella | Responsabilità |
| --- | --- |
| `index.html` | Shell statica, navigazione e dialogo nativo |
| `assets/app.js` | Punto di ingresso, importa il controller |
| `assets/js/controller.js` | Eventi delegati, coordinamento di azioni, rendering, focus e sincronizzazione |
| `assets/js/config.js` | Nomi delle route, navigazioni e ruoli cromatici delle categorie |
| `assets/js/router.js` | Validazione delle route e caricamento su richiesta delle schermate |
| `assets/js/views/` | Renderer delle aree originali e moduli di esplorazione alimenti, contenuti guidati, social, foresta e glucosio |
| `assets/js/ui/components.js` | Helper HTML condivisi con struttura daisyUI nativa |
| `assets/js/ui/nutrition-widgets.js` | Settori del piatto, picker, mercato e ripiani composti con componenti originali daisyUI |
| `assets/js/ui/food-art.js` | Nove ingredienti dell’atlante e sei cutout locali, presentati in `avatar` |
| `assets/js/ui/guided-widgets.js` | Steps, gesto corrente, riepiloghi ed esiti composti con parti daisyUI native |
| `assets/js/ui/dialogs.js` | Registrazione, modifica e riepilogo di ripristino con dialogo nativo |
| `assets/js/records.js` | Validazione di date/voci, modifica atomica, rimozione/annullamento e messaggi locali |
| `assets/js/insights.js` | Report 7/30 giorni, riepilogo quiz, tappe e piatto dalla dispensa |
| `assets/js/backup.js` | Validazione della copia JSON, limite 2 MB e importazione dei soli campi noti |
| `assets/js/store.js` | Lettura, protezione del file originale, preflight, salvataggio e recupero atomico |
| `assets/js/session.js` | Stato transitorio di filtri, piatto, quiz, test, cataloghi, routine, gioco e bozze glucosio |
| `assets/js/timer.js` | Orologio preciso con durate configurabili per respirazione, sessioni guidate e Frigo Sano |
| `assets/js/nutrition-catalog.js` | Catalogo alimenti, ricette di esempio, ricerca e regole di Frigo Sano |
| `assets/js/guided-content.js` | Gesti del risveglio, routine serale e tre sessioni scritte |
| `assets/js/guided-flow.js` | Transizioni pure delle pratiche manuali e spunti delle pause legati al tempo trascorso |
| `assets/js/practice-runtime.js` | Azioni delle pratiche, riepilogo delle pause e registrazione degli esiti |
| `assets/js/form-drafts.js` | Bozze dei campi modificati, ambiti separati e ripristino nella scheda corrente |
| `assets/js/accessibility.js` | Annunciatore persistente e navigazione da tastiera del drawer mobile |
| `assets/js/social-catalog.js` | Gruppi, filtri e progressi delle sfide a partire dal diario |
| `assets/js/glucose.js` | Validazione, normalizzazione, periodi e CSV delle misurazioni manuali |
| `assets/js/breathing.js` | Fasi, Web Animation, pausa, visibilità e preferenze di movimento |
| `assets/js/widget-motion.js` | Trasferimenti e conferme brevi, cancellazione su render, scroll e preferenze di movimento |
| `assets/js/pine-motion.js` | Decorazioni botaniche, mount incrementale, pausa, fallback statici e preferenze di movimento |
| `assets/js/conversation.js` | Invio, risposta differita e cancellazione delle operazioni Pigna |
| `assets/js/export.js` | CSV, Blob e download |
| `assets/data.js` | Dati del prodotto, schema v1 e regole di punti, ricompense, piatto e test |
| `assets/icons.js` | SVG ufficiali Heroicons |
| `src/styles.css` | Tema Terra, font, tipografia, focus e riduzione del movimento |

Le schermate ricevono uno snapshot esplicito `{ state, ui, timer, chatBusy }` e restituiscono HTML. Non scrivono nel DOM o nel salvataggio. Il controller possiede il DOM e gli eventi; timer e conversazione possiedono i loro callback. Questo consente di verificare tutte le schermate in Node senza una simulazione del browser.

## Contratto dei componenti daisyUI

Usa componenti originali daisyUI 5.7.47 e le loro parti documentate. Terra e utility Tailwind personalizzano stile e layout; non ricostruire parti, pseudo-elementi o stati con CSS dell’app. Hover, pressione, selezione e disabilitazione conservano le regole della libreria e gli attributi HTML/ARIA effettivi. Timer, regole del piatto, dati e animazioni di presentazione rimangono responsabilità applicative. Piatto e frigo sono composizioni di primitivi originali, senza componenti daisyUI omonimi.

L’audit del 6 ottobre ripristina tre contratti: i filtri del piatto usano `join join-vertical sm:join-horizontal` con `join-item`; il trigger mobile conserva `drawer-button` perché il focus sul checkbox invisibile raggiunga il label; le azioni dei gruppi conservano `list-col-wrap` su telefono e `sm:row-start-1` sulla prima riga da `sm`. Le correzioni aggiungono classi originali o utility di layout, senza cambiare handler o regole del prodotto. Confronto col sistema, prove, eccezioni circoscritte del detector e stato della revisione sono in [DAISYUI-AUDIT.md](DAISYUI-AUDIT.md). `DESIGN.md` e `.impeccable/design.json` restano conservati.

## Stato e compatibilità

- `store.state` contiene il percorso persistente; la chiave resta `prevediapp.v1` e lo schema resta versione 1.
- La preferenza decorativa del pino usa `prevediapp.pine-motion.v1`, con valore iniziale attivo, separato dal percorso e dal backup JSON. Il reset riuscito rimuove anche questa chiave; gli eventi cross-tab della chiave e con `key === null` sincronizzano la scelta. Se il salvataggio della scelta fallisce, resta valida in sessione con una nota nel controllo.
- I salvataggi validi esistenti vengono mantenuti. `posts`, `quizHistory`, letture delle notifiche e campi dell’estensione Stitch sono opzionali; i vecchi quiz risultano completati senza inventare un punteggio storico. Chat e selezioni opzionali danneggiate vengono normalizzate, impedendo il blocco delle schermate.
- Un errore di accesso o scrittura lascia le modifiche ordinarie in memoria e mostra l’avviso di esportarle prima di chiudere. Un salvataggio illeggibile attiva invece la protezione: `recoveryRaw` conserva la stringa originale, la sincronizzazione non la sostituisce e le azioni persistenti sono sospese fino a una scelta esplicita.
- `prepareWrite()` esegue il preflight prima della mutazione: restituisce `false` per un file protetto e consente modifiche temporanee se lo storage è inaccessibile. Se la lettura iniziale era negata, un percorso valido scoperto dopo viene protetto come `existing`; `recover()` permette di adottarlo esplicitamente. `save()`, `reset()`, `replace()`, `recover()` e `sync()` restituiscono un esito booleano, che il controller deve rispettare.
- `reset()`, `replace()` e `recover()` scrivono il prossimo stato prima di sostituire quello in memoria. Un fallimento conserva stato e copia protetta; il controller annulla operazioni pendenti e sessioni solo dopo il successo. L’export JSON durante la protezione usa il raw originale e il nome `originale-da-recuperare`, senza presentarlo come backup già validato.
- Le modifiche del diario mantengono identità e punti già assegnati. L’annullamento della rimozione ripristina la posizione originale e resta disponibile finché la relativa conferma è visibile. Chiuderla o sostituirla con un nuovo feedback termina questa possibilità; un ripristino o una sincronizzazione del percorso invalida l’operazione precedente.
- Il ripristino valida e clona il JSON prima di sostituire lo stato, con riepilogo e conferma. Un’importazione non valida non tocca il percorso attuale.
- `ui` contiene solo dati transitori. `ui.quizzes` mantiene i tentativi indipendenti per categoria; `ui.quiz` è il riferimento a quello corrente. `openQuiz()` propone la ripresa, `resumeQuiz()` conserva avanzamento e risposte verificate, `restartQuiz()` sostituisce soltanto la categoria corrente. Il tentativo completato resta sul suo esito; ricaricare o chiudere la pagina cancella i tentativi incompleti.
- Bozze dei campi modificati, checklist delle ricette, pratiche manuali incomplete ed esiti delle pause restano nella scheda corrente, fuori dal backup. Nuovi inserimenti e modifiche hanno ambiti distinti; reset e ripristino riusciti puliscono questo stato. `pauseOutcomes` conserva il riferimento alla registrazione effettiva e segnala una voce rimossa, senza offrire un collegamento al record mancante.
- Le risposte del test educativo non entrano in localStorage. La domanda gestazionale presentata non ha una risposta iniziale; `gestationalSkipped` distingue il `no` assegnato dal ramo saltato da una risposta personale e lo svuota quando il ramo cambia. Il contatore segue le domande applicabili.
- Chat e storico quiz conservano rispettivamente gli ultimi 40 messaggi, comprese le risposte, e 200 tentativi complessivi. Conteggi e migliori risultati descrivono lo storico conservato; le foglie già assegnate mantengono riconoscibili le categorie completate.
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

Il comando `check` verifica ricorsivamente la sintassi dei moduli. I 182 test coprono le regole del prodotto, compatibilità e guasti dello storage, protezione del raw, preflight e sostituzione atomica, sessioni quiz per categoria e rami del test, callback del timer, risposte tardive della chat, route non valide, ripetizione di un caricamento fallito, rendering di tutte le schermate, diario, annullamento, report, tappe, ripristino ed esportazione CSV, cataloghi alimenti/ricette, sfide, contenuti guidati e registro manuale del glucosio. I controlli dei widget includono indici delle porzioni duplicate, gruppi in eccesso rimovibili, filtri e limiti del piatto, ripiani ed extra conservati, cancellazione delle copie animate al render e allo scroll, movimento ridotto, visibilità e confini dei quattro tempi del respiro. Quelli del pino verificano limite dei nodi, soli transform, pause, fallback, callback obsoleti, pulizia e continuità del footer durante il mount incrementale. I nuovi controlli coprono transizioni manuali, minuti effettivi, pause concorrenti, esiti, bozze separate, storico completo del glucosio, quindici ingredienti compatibili e navigazione accessibile.

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

## Animazione della respirazione

Il timer mantiene i millisecondi per pausa e ripresa; gli otto test aggiunti verificano frazioni, confini di fase, scadenza e callback obsoleti. La Web Animation conserva una sola istanza per il componente montato e si interrompe in pausa, fuori vista o a scheda nascosta. Il movimento ridotto e il toggle mantengono una guida statica con fase, tempo e progresso. Le due metà del ciclo usano ease-in-out, su timeline lineare. La verifica della UI include il viewport utente 2723 × 1210 e telefoni da 390/320 px. [Documentazione e fonti](BREATHING-MOTION.md).

## Correzioni dell’interfaccia e recupero dati

I vuoti del diario distinguono il giorno senza attività dal filtro senza risultati e permettono di togliere il filtro. Le categorie parlano delle registrazioni di oggi. Il feedback di una registrazione con data diversa indica il giorno e offre «Apri quel giorno»; le sottoviste mantengono attiva l’area di appartenenza.

Le transizioni di quiz e test portano il focus alla nuova domanda o all’esito; la risposta quiz verificata porta a «Prossima domanda» o «Concludi». Dopo la quarta porzione del piatto, il focus raggiunge Verifica. Il fallback del rendering evita di lasciare il focus sul documento quando il controllo precedente scompare. Se il salvataggio viene protetto mentre un dialogo è aperto, Salva mostra e focalizza un `alert` interno al dialogo: la bozza e Annulla restano disponibili.

Progressi a 30 giorni raggruppa i giorni senza registrazioni in `details`/`summary` con il componente nativo `collapse`; un giorno non registrato non diventa uno zero misurato. Lo stesso componente espone i quattro temi vicino al campo di Pigna. Le azioni del fallback restano in una colonna nella bolla; nei post personali Community le azioni occupano una riga successiva su telefono e la colonna dedicata su desktop. Timer e avvio precedono la guida nella pagina Stress; nel Piatto la selezione precede il modello. Sono adattamenti delle viste con componenti esistenti, senza nuovi token o raster.

L’esecuzione di quella correzione fornita dal builder aveva superato formato, 73 test e build. La revisione indipendente ha esaminato 65 catture finali, 14 catture dei flussi e nove catture dei tre fix successivi. `.impeccable/review/fixes/final/metrics.json` riporta 60 osservazioni di 20 viste a 320, 390 e 1440 px senza overflow del documento o immagini rotte; cinque viste sono state catturate anche a 2723 px. Il verdetto locale `.impeccable/review/fixes/finish-verdict.md` chiude i tre finding della revisione in `finish-review.md`; rapporti e catture QA sono esclusi dal repository pubblicato. Queste evidenze verificano i casi esaminati e non ricalcolano il punteggio della critica generale. Le misure e i conteggi delle sezioni precedenti descrivono le rispettive build storiche.

## Completamento delle pagine Stitch

L’export completo del progetto è stato letto come fonte statica, senza eseguirne HTML o JavaScript: 137 cartelle, 115 HTML e 99 PNG; 79 cartelle hanno sia HTML sia anteprima. Le 36 cartelle HTML senza anteprima contengono 33 copie/varianti dell’onboarding e tre frammenti Three.js del gioco del piatto. Le altre cartelle sono asset o sistemi di design. La verifica indipendente distingue 37 famiglie funzionali, tutte rappresentate da route, stati o dialoghi attuali. [Mappa e adattamenti](STITCH-COVERAGE.md).

Le 24 nuove route nominali portano il totale a 41; ricette, gruppi, sessioni e categorie di apprendimento producono 55 varianti indirizzabili, tutte raggiungibili dal Percorso. `routeNames`, i loader espliciti e `routeParents` condividono il contratto di navigazione; i dettagli accettano solo identificativi limitati e validano gli ID nel catalogo. Il menu Esplora e i collegamenti fra le aree mantengono raggiungibili i nuovi hub.

### Stato aggiunto senza cambiare schema

La chiave resta `prevediapp.v1`, versione 1. I nuovi campi opzionali vengono inizializzati per i salvataggi precedenti:

- `recipeFavorites`: i tre ID ricetta ammessi; `foodSearches`: fino a otto ricerche distinte da 80 caratteri.
- `pantryExtras`: i dodici alimenti del nuovo mercato separati dai nove ingredienti di `fridge`; gli extra restano visibili nella dispensa e registrabili come pasto.
- `joinedChallenges`: quattro sfide ammesse; `joined` ora accetta anche i due nuovi gruppi, per quattro gruppi totali. I progressi delle sfide derivano dalle voci effettive del diario.
- `sleepRoutine`: i tre gesti ammessi; `sleepReminder`: attivazione e ora valida, con valore iniziale 21:30. Il promemoria compare nelle notifiche locali dell’app.
- `glucoseReadings`: fino a 200 inserimenti con identità, data, ora, valore, contesto, note e creazione. L’inserimento al limite viene rifiutato; non vengono eliminate automaticamente misurazioni precedenti.

`parseState()` protegge l’originale se le misurazioni presenti non sono leggibili o se la normalizzazione ne perderebbe una. Il ripristino valida anche identità, duplicati, numero massimo e ogni misurazione prima di sostituire lo stato. Il form conserva la bozza quando cambia il periodo; la rimozione è annullabile. Il CSV dedicato contiene il periodo selezionato, mentre il backup JSON conserva tutte le misurazioni. I limiti del campo da 1 a 1000 mg/dL con un decimale sono tecnici, non intervalli clinici.

`ui.discovery`, `ui.guided`, `ui.social`, `ui.forest`, `ui.learning` e `ui.glucose` rimangono transitori. Le azioni persistenti passano dal preflight dello storage e rispettano la protezione del file originale. Ripristino, recupero, reset e sincronizzazione riusciti annullano le operazioni pendenti; un fallimento mantiene le bozze e lo stato protetto.

### Timer, giochi e contenuti

`createTimer()` accetta durate e durata iniziale. Le tre sessioni guidate usano 10, 15 e 5 minuti; respirazione e sessioni hanno un solo timer attivo alla volta, con pausa reciproca e ripresa dell’avanzamento nella scheda. Completare una sessione registra una pausa nel diario, con il premio giornaliero già previsto. Il completamento aggiorna solo le superfici di attività: non ricrea il profilo durante una modifica. La ricarica interrompe timer, tentativi incompleti e partita; non esiste ripresa persistente. Frigo Sano propone cinque scelte di gruppi alimentari, tre tentativi e 30 secondi, senza premi o storico permanenti.

Le sessioni sono spunti scritti, senza audio o video. Le tre ricette riprendono titoli e tempi indicativi della fonte, ma ingredienti e preparazioni sono esempi autoriali dell’adattamento. Ricerca e mercato consultano 21 alimenti locali: non effettuano scansioni o calcoli automatici di nutrienti. Il registro del glucosio è manuale e parte vuoto; non è un CGM. Community, adesioni e incoraggiamenti sono dimostrativi e locali, senza account, chat fra persone o classifiche condivise.

Le collezioni Natura/Inverno contengono nove ricompense; i tre costi precedenti restano invariati e tutti gli oggetti usano Foglie virtuali. Le sei nuove ricompense mostrano una propria anteprima accanto all’Alberello originale. Prompt, master, conversioni WebP e provenienza delle immagini sono in [STITCH-ASSETS.md](STITCH-ASSETS.md).

### Verifica e continuità del sistema

Per questa build dell’estensione Stitch, precedente ai widget, i controlli del builder coprivano 98 test. La matrice browser finale contiene 170 catture native: 55 varianti a 320 × 740, 390 × 844 e 1440 × 1000, più cinque viste a 2723 × 1210. Le 165 misure route/larghezza non rilevano overflow, immagini rotte o icone di fallback. I flussi di ricerca/pasto, preferite/dispensa, gioco, movimento/diario, routine/notifiche, pause, gruppi/sfide e glucosio sono stati provati con dati sintetici in un’origine separata dalle anteprime dell’utente.

Il verdetto finale chiude i due rilievi materiali della revisione: bozza e focus del profilo preservati al completamento della pausa, con una sola voce Pace Interiore da 10 minuti nel diario, e tutti i sei nuovi selettori delle ricompense leggibili a 320/1440 px, con Sciarpa invernale applicata. La prova del completamento usa il timer compilato di produzione e una fixture nativa con avanzamento controllato di `Date.now` tramite F8: verifica l’evento, senza dichiarare un’attesa reale di dieci minuti. Il verdetto riguarda questi due casi e le catture fornite, senza una nuova ricerca generale di difetti.

La verifica indipendente conferma 37 famiglie rappresentate e 55 varianti raggiungibili; nessuna famiglia di pagine manca. Il confronto con i token in `src/styles.css`, gli helper condivisi e i renderer conferma palette Terra, Literata/Nunito Sans, componenti daisyUI nativi e Heroicons. Questa è un’estensione dell’identità esistente: `DESIGN.md` e `.impeccable/design.json` sono conservati, senza migrazioni del sistema o correzioni di deriva preesistente. Rapporti e catture in `.impeccable/review/stitch-coverage/` sono artefatti di sviluppo esclusi dalla distribuzione; i conteggi e le misure delle sezioni precedenti rimangono storici.

## Widget delle azioni

L’estensione riguarda `#piatto`, `#frigo`, `#stress` e `#frigo-sano`; restano 41 route nominali e 55 varianti indirizzabili. `nutrition-widgets.js` mantiene gli indici dell’array denso del piatto anche quando una stessa porzione compare due volte. I settori liberi filtrano gli ingredienti e portano il focus al primo controllo del gruppo; la quarta porzione porta a Verifica. Il modello ammette una composizione errata per il gioco educativo, la mostra per intero e richiede una verifica esplicita prima del diario. Il filtro è solo `ui.plate.target`, con valore iniziale `null`; chiave `prevediapp.v1`, schema v1, regole del diario e punti restano compatibili.

Il mercato e i ripiani condividono i nove ingredienti illustrati; aggiunta e rimozione mantengono `state.fridge`, mentre `pantryExtras` rimane separato e disponibile. «Usa la mia dispensa» richiede la presenza dei tre gruppi e compone quattro porzioni con le regole esistenti. Sotto 360 px, picker, mercato e ripiani dispongono gli ingredienti su due colonne; dalla soglia usano tre colonne. Le cinque `step` del gioco possono ridursi nella card con `min-w-0`. Frigo Sano conserva cinque scelte, tre tentativi, trenta secondi e nessun premio o storico permanente.

Il controller aggiorna stato e focus prima di attendere qualunque feedback. `widget-motion.js` crea soltanto una copia decorativa, `aria-hidden`, `inert` e senza eventi puntatore: 380 ms di trasferimento e 230 ms di conferma. Il render, lo scroll catturato anche dai contenitori, la scheda nascosta e l’attivazione del movimento ridotto annullano animazioni e copie; origine o destinazione fuori vista evitano il volo. Questo include lo scorrimento causato dal focus, senza ritardarlo.

Il respiro mantiene una sola Web Animation di otto secondi, con metà Inspira e metà Espira, sincronizzata ai millisecondi del timer. Fase annunciata, quattro `steps`, tempo rimanente e `radial-progress` dell’intera pausa hanno ruoli separati. La pausa conserva la posizione; visibilità e fuori vista fermano soltanto il movimento, che al ritorno si riallinea al timer. Toggle e preferenza del dispositivo consentono la guida statica con testi, tempi e progresso disponibili; con movimento ridotto il toggle è disabilitato e spiegato.

Il confronto documentale fra `DESIGN.md`, il tema in `src/styles.css`, gli helper condivisi e i nuovi renderer conferma l’estensione Terra: Literata/Nunito Sans, colori e raggi esistenti, parti native daisyUI e Heroicons outline. `DESIGN.md` e `.impeccable/design.json` sono conservati; la deriva preesistente segnalata del sidecar non è riparata da questa estensione. I due WebP dei widget pesano 501.298 byte complessivi; il sito riusa l’atlante e non carica i PNG master. Comportamenti, prompt esatto e manifest sono in [WIDGETS.md](WIDGETS.md).

Formato, controlli, 113 test e build sono passati. La matrice confermata contiene 16 osservazioni delle quattro route a 320 × 740, 390 × 844, 1440 × 1000 e 1280 × 720; `confirmed/metrics.json` non rileva overflow del documento o immagini rotte in nessun caso. I flussi nativi nell’origine QA isolata verificano filtro e focus, selezione, rimozione, riuso della dispensa e pausa statica. La revisione iniziale ha richiesto tre correzioni mirate: parole intere nei controlli mobili, contenimento dei cinque steps e annullamento dei voli dopo lo scroll. `finish-verdict.md` le chiude tutte come `resolved`, con disposizione `ship` limitata a quella lista. Il gioco completo a 320 px mantiene le cinque tappe fra x41 e x278,98 con documento largo 320 px; la cancellazione su scroll è confermata dal codice e dal test unitario, con durate 380/230 ms invariate nel caso normale.

Un solo detector ha restituito `[]`; il controllo di provenienza fornito copre 28 raster senza provenienze mancanti. Rapporti e catture restano in `.impeccable/review/action-widgets/`, esclusi dalla distribuzione. Screenshot, unit test e flussi verificano i casi esaminati; non certificano tutta la fluidità reale, accessibilità completa o prestazioni su dispositivi reali. Il verdetto non avvia una nuova ricerca generale di difetti e non ricalcola il punteggio della critica precedente.

## Dettagli animati del pino

`heading()` inserisce una fronda in flusso accanto alle azioni; negli heading senza azioni la mostra da 480 px. `index.html` mantiene una pigna nel footer persistente di tutte le 55 varianti, con `label` e toggle originali daisyUI. La feature conserva Terra, font, layout e stati della libreria. Il confronto con `PRODUCT.md` e `DESIGN.md` giustifica la loro conservazione esatta insieme a `.impeccable/design.json`; la deriva preesistente del sidecar resta segnalata senza riparazione. [Comportamento, asset, prompt e manutenzione](PINE-MOTION.md).

`pine-motion.js` riconcilia i nodi senza cancellare l’animazione della pigna al render del main: rimuove il vecchio heading, osserva quello nuovo e conserva la fase del footer. Il motore ha un limite di tre nodi, con due soggetti nella composizione attuale; usa WAAPI solo su `transform`, con cicli di 9,8 e 8,7 secondi e rotazione massima 1,7°. Non aggiunge dipendenze o loop JavaScript. Observer, visibilità e `syncPineDetails()` governano avvio e pause; dialoghi e timer attivi di Stress, sessioni guidate e Frigo Sano sospendono la decorazione senza perderne la posa. Toggle spento, movimento ridotto o API mancanti mantengono le immagini statiche.

I master in `artwork/pine-v1/` provengono dal generatore integrato `image_gen.imagegen`, con prompt selezionati incorporati nei PNG e conservati nei sidecar WebP. Riduzione `sips` e conversione Pillow WebP a qualità 90, metodo 6, producono asset con alpha di 576 × 384 e 256 × 256 px: 78.920 e 12.952 byte, 91.872 complessivi. La conversione è meccanica; il set esatto dei tre prompt, i JSON di provenienza e il manifest sono collegati in [PINE-MOTION.md](PINE-MOTION.md#asset-prompt-e-provenienza). La scansione consegnata copre 30 raster senza provenienze mancanti.

I passaggi iniziale e di conferma hanno ciascuno 110 misure, 55 varianti a 320/1280 px: 220 complessive, tutte senza overflow del documento, raster rotti, `h1` errati o conteggi pino inattesi. Le sei viste rappresentative sono state catturate a 320, 390, 1280 e 1440 px, con footer e prove dei flussi. UI nativa, pose DOM e ricarica confermano toggle, movimento, pausa nel dialogo e priorità della respirazione; nessun errore console osservato. Formato e 123 test sono passati anche dopo l’integrazione degli eventi storage con chiave nulla.

Il detector, eseguito una sola volta, non ha finding primari. Due advisory di raggio derivano dalla formula del toggle nativo daisyUI: i valori `5` e `.125),calc(.5rem` sono persistiti con ambito `index.html`, senza introdurre raggi nel tema. La revisione indipendente in `.impeccable/review/pine-motion/finish-review.md` dispone `ship`, senza material fixes. Rapporti e catture restano esclusi dalla distribuzione; screenshot e prove DOM non certificano fluidità su hardware reale, accessibilità completa o prestazioni.

La build finale, ricompilata dopo la documentazione, contiene 232.722 byte JavaScript complessivi, non compressi. Questo resoconto descrive la verifica locale; lo stato della pubblicazione è disponibile in GitHub Actions.


## Accessibilità

La revisione del 6 ottobre 2026 mantiene Terra e i componenti daisyUI. `assets/js/accessibility.js` contiene l'annunciatore persistente e il comportamento del drawer: apertura con pulsante nativo, sfondo `inert`, ciclo Tab/Maiusc+Tab, Escape e ripristino del focus anche al cambio di breakpoint. Il controller conserva la destinazione di apertura dei dialoghi e associa gli errori ai campi; la chat annuncia solo l'ultima risposta e consente di preparare la nuova bozza durante l'attesa.

Il focus usa contorno neutro e separazione bianca. Pulsanti e campi hanno dimensione minima di 44 px; il testo dei campi è di 16 px. Testo secondario e placeholder passano da `base-content/85` a `/90`. Radio e checkbox non selezionati hanno bordi più distinguibili. Colori forzati e movimento ridotto mantengono controlli, selezioni e istruzioni leggibili.

Le conferme restano disponibili fino alla chiusura o all'azione successiva. Il loro spazio è riservato allo scorrimento; altezza limitata e scorrimento interno preservano le azioni su schermi bassi. Durante il menu mobile le conferme sono nascoste e inerti. Il countdown e il riepilogo dei timer non vengono annunciati ogni secondo; le fasi respiratorie e gli spunti guidati restano accessibili. Frigo Sano permette di scegliere la modalità senza limite di tempo prima di cominciare, mantenendo le regole delle risposte e dei tentativi.

Verifica finale: formato, 182 test e build superati. Le 55 varianti sono state esaminate con axe-core 4.14.0 a 320 e 1440 px: 110 osservazioni senza violazioni automatiche, overflow del documento, immagini rotte o titoli principali mancanti/duplicati. Sono stati provati da tastiera il menu e il cambio di breakpoint, i campi obbligatori, la chiusura dei dialoghi, la chat con una nuova bozza, salvataggio e rimozione annullabile del diario. Il gioco senza timer resta attivo dopo oltre 30 secondi. Le prove usano dati sintetici in un'origine QA separata; rapporto e immagini locali in `.impeccable/review/accessibility/` non sono distribuiti.

Il riferimento è [WCAG 2.2](https://www.w3.org/TR/WCAG22/). I risultati automatici e l'albero di accessibilità del browser non equivalgono a una certificazione: 97 delle 110 osservazioni hanno verifiche di contrasto incomplete su immagini o fondi; non è stata eseguita una verifica sistematica con VoiceOver/NVDA né su hardware mobile reale. Questa matrice è evidenza di supporto distinta dalle 134 osservazioni del candidato integrato corrente.

## Pratiche, compilazioni e azioni complete

`guided-flow.js` descrive scelta, preparazione, pratica manuale, riepilogo e conclusione. Fatto e Salta avanzano soltanto mentre la pratica è attiva; pausa e ritorno mantengono il contesto. `practice-runtime.js` registra solo i gesti svolti del risveglio e i minuti effettivi interi indicati dalla persona, da 1 a 180. La sera conclude la pratica senza creare sonno o punti. Il controller sospende le altre pratiche benessere prima di avviarne o riprenderne una e conserva un riepilogo della pausa corrente. Gli spunti scritti seguono il tempo trascorso; gli esiti restano visibili nella sessione con il collegamento alla voce effettiva.

`form-drafts.js` mantiene soltanto i campi modificati, ripristina valori e focus e distingue nuove compilazioni da modifiche per ID. Diario, glucosio e community non condividono la stessa bozza fra inserimento e modifica. Il controller associa gli errori ai campi e li rimuove dopo la correzione; il risultato del salvataggio determina la conferma, distinguendo dati persistiti, sola sessione e percorso protetto. Reset e ripristino puliscono le bozze solo dopo il successo. [Comportamenti e invarianti](INTERACTIVE-EXPERIENCE.md).

Piatto e ripiani usano quindici `plateFoods`, con `plateGroup` separato dalla categoria del catalogo e conservazione distinta in `fridge`/`pantryExtras`; chiave e schema v1 restano compatibili. Le ricette mantengono checklist transitorie per ID, preferite ed elenco effettivo della dispensa. Il glucosio offre 7/30 giorni o tutto lo storico, CSV del filtro e capacità totale visibile di 200. Pigna collega risposte autoriali alle azioni e la community dichiara prima dell’invio la capacità di venti messaggi locali. Le missioni distinguono premi già raccolti ed esito corrente.

Il confronto fra PRODUCT.md, DESIGN.md, `src/styles.css`, helper e viste conferma palette, font, identità Terra e parti originali daisyUI. Le estensioni autorizzate di accessibilità riguardano focus, target, reflow, contrasto di supporto, movimento ridotto e navigazione; i due avatar ordinari restano quadrati da 40 px. DESIGN.md riallinea le due altezze avatar introdotte erroneamente e il comportamento corrente di conferme e movimento ridotto. La deriva preesistente del sidecar resta segnalata senza riparazione. Sei alimenti e nove ricompense Imagegen hanno master, prompt esatti e manifest in [FOOD-ASSETS.md](FOOD-ASSETS.md) e [REWARD-ASSETS.md](REWARD-ASSETS.md); la scansione complessiva copre 45 raster senza mancanze.

Formato, 182 test e build sono passati per il candidato integrato, con JavaScript complessivo di 280.966 byte non compressi prima della compilazione finale dei documenti. `integration/route-metrics.json` registra 134 osservazioni: 55 varianti a 390/1280 px e dodici varianti operative a 320/1440 px, senza overflow del documento, immagini rotte, titoli errati o destinazioni desktop correnti duplicate. `integration/flow-proof.json` documenta tastiera/menu/breakpoint, profilo invalido e salvato, chiusura conferma, skip link, pratica manuale ed esito 5/5 del gioco senza timer. I passaggi `first` e `confirm` conservano ulteriori flussi storici, inclusi completamenti reali di respirazione e pausa scritta, bozze, ricette, community, quiz, premi e annullamento.

Un detector ha restituito `[]`; axe è un controllo di supporto con 110 osservazioni senza violazioni automatiche e 97 con contrasto incompleto. La revisione integrata ha richiesto la sola correzione documentale del toast in DESIGN.md; non segnala difetti UI nel perimetro campionato. `finish-verdict.md` la chiude come `resolved` con disposizione `ship` limitata a quel finding, senza una nuova review integrale. Rapporti in `.impeccable/review/interactive-experience/` e `.impeccable/review/accessibility/` sono esclusi dalla distribuzione. Queste prove non certificano tutta l’accessibilità, prestazioni o hardware mobile e non ricalcolano la critica generale; lo stato del deployment richiede un riscontro distinto in GitHub Actions.
