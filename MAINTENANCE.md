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
| `assets/js/ui/nutrition-widgets.js` | Settori del piatto, picker, mercato e ripiani daisyUI |
| `assets/js/ui/food-art.js` | Mappa dei nove ingredienti nell’atlante raster, presentati in `avatar` |
| `assets/js/ui/dialogs.js` | Registrazione, modifica e riepilogo di ripristino con dialogo nativo |
| `assets/js/records.js` | Validazione di date/voci, modifica atomica, rimozione/annullamento e messaggi locali |
| `assets/js/insights.js` | Report 7/30 giorni, riepilogo quiz, tappe e piatto dalla dispensa |
| `assets/js/backup.js` | Validazione della copia JSON, limite 2 MB e importazione dei soli campi noti |
| `assets/js/store.js` | Lettura, protezione del file originale, preflight, salvataggio e recupero atomico |
| `assets/js/session.js` | Stato transitorio di filtri, piatto, quiz, test, cataloghi, routine, gioco e bozze glucosio |
| `assets/js/timer.js` | Orologio preciso con durate configurabili per respirazione, sessioni guidate e Frigo Sano |
| `assets/js/nutrition-catalog.js` | Catalogo alimenti, ricette di esempio, ricerca e regole di Frigo Sano |
| `assets/js/guided-content.js` | Gesti del risveglio, routine serale e tre sessioni scritte |
| `assets/js/social-catalog.js` | Gruppi, filtri e progressi delle sfide a partire dal diario |
| `assets/js/glucose.js` | Validazione, normalizzazione, periodi e CSV delle misurazioni manuali |
| `assets/js/breathing.js` | Fasi, Web Animation, pausa, visibilità e preferenze di movimento |
| `assets/js/widget-motion.js` | Trasferimenti e conferme brevi, cancellazione su render, scroll e preferenze di movimento |
| `assets/js/conversation.js` | Invio, risposta differita e cancellazione delle operazioni Pigna |
| `assets/js/export.js` | CSV, Blob e download |
| `assets/data.js` | Dati del prodotto, schema v1 e regole di punti, ricompense, piatto e test |
| `assets/icons.js` | SVG ufficiali Heroicons |
| `src/styles.css` | Tema Terra, font, tipografia, accessibilità e respirazione |

Le schermate ricevono uno snapshot esplicito `{ state, ui, timer, chatBusy }` e restituiscono HTML. Non scrivono nel DOM o nel salvataggio. Il controller possiede il DOM e gli eventi; timer e conversazione possiedono i loro callback. Questo consente di verificare tutte le schermate in Node senza una simulazione del browser.

## Stato e compatibilità

- `store.state` contiene il percorso persistente; la chiave resta `prevediapp.v1` e lo schema resta versione 1.
- I salvataggi validi esistenti vengono mantenuti. `posts`, `quizHistory`, letture delle notifiche e campi dell’estensione Stitch sono opzionali; i vecchi quiz risultano completati senza inventare un punteggio storico. Chat e selezioni opzionali danneggiate vengono normalizzate, impedendo il blocco delle schermate.
- Un errore di accesso o scrittura lascia le modifiche ordinarie in memoria e mostra l’avviso di esportarle prima di chiudere. Un salvataggio illeggibile attiva invece la protezione: `recoveryRaw` conserva la stringa originale, la sincronizzazione non la sostituisce e le azioni persistenti sono sospese fino a una scelta esplicita.
- `prepareWrite()` esegue il preflight prima della mutazione: restituisce `false` per un file protetto e consente modifiche temporanee se lo storage è inaccessibile. Se la lettura iniziale era negata, un percorso valido scoperto dopo viene protetto come `existing`; `recover()` permette di adottarlo esplicitamente. `save()`, `reset()`, `replace()`, `recover()` e `sync()` restituiscono un esito booleano, che il controller deve rispettare.
- `reset()`, `replace()` e `recover()` scrivono il prossimo stato prima di sostituire quello in memoria. Un fallimento conserva stato e copia protetta; il controller annulla operazioni pendenti e sessioni solo dopo il successo. L’export JSON durante la protezione usa il raw originale e il nome `originale-da-recuperare`, senza presentarlo come backup già validato.
- Le modifiche del diario mantengono identità e punti già assegnati. L’annullamento di una rimozione dura 12 secondi e ripristina la posizione originale; viene invalidato se cambia lo stato da ripristino o sincronizzazione.
- Il ripristino valida e clona il JSON prima di sostituire lo stato, con riepilogo e conferma. Un’importazione non valida non tocca il percorso attuale.
- `ui` contiene solo dati transitori. `ui.quizzes` mantiene i tentativi indipendenti per categoria; `ui.quiz` è il riferimento a quello corrente. `openQuiz()` propone la ripresa, `resumeQuiz()` conserva avanzamento e risposte verificate, `restartQuiz()` sostituisce soltanto la categoria corrente. Il tentativo completato resta sul suo esito; ricaricare o chiudere la pagina cancella i tentativi incompleti.
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

Il comando `check` verifica ricorsivamente la sintassi dei moduli. I 113 test coprono le regole del prodotto, compatibilità e guasti dello storage, protezione del raw, preflight e sostituzione atomica, sessioni quiz per categoria e rami del test, callback del timer, risposte tardive della chat, route non valide, ripetizione di un caricamento fallito, rendering di tutte le schermate, diario, annullamento, report, tappe, ripristino ed esportazione CSV, cataloghi alimenti/ricette, sfide, contenuti guidati e registro manuale del glucosio. I controlli dei widget includono indici delle porzioni duplicate, gruppi in eccesso rimovibili, filtri e limiti del piatto, ripiani ed extra conservati, cancellazione delle copie animate al render e allo scroll, movimento ridotto, visibilità e confini dei quattro tempi del respiro.

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
