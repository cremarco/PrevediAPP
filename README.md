# PREVEDIApp

[Sito su GitHub Pages](https://cremarco.github.io/PrevediAPP/) · [Repository](https://github.com/cremarco/PrevediAPP)

App statica interattiva ricostruita da [Percorso Benessere Prediabete su Stitch](https://stitch.withgoogle.com/projects/4965067135037654911). Mantiene il tema Terra e le mascotte; le pagine della fonte sono collegate in un unico percorso locale. HTML, JavaScript a moduli, Tailwind CSS 4, daisyUI 5 e Heroicons outline. Font, immagini, icone e CSS sono locali; non servono chiavi API.

L’interfaccia usa componenti daisyUI reali, con parti e stati ufficiali, personalizzati attraverso il tema Terra. I precedenti componenti costruiti con CSS proprio sono stati sostituiti. La mappatura e la verifica sono in [DAISYUI-AUDIT.md](DAISYUI-AUDIT.md).

Le icone usano i nomi e gli SVG originali Heroicons, con scelte coerenti fra le schermate. Il catalogo non include i singoli alimenti: i pulsanti usano nomi e icone di azione/selezione. Scelte e verifiche sono in [HEROICONS-AUDIT.md](HEROICONS-AUDIT.md).

Anna, Marco ed Elena hanno avatar illustrati generati con Imagegen, inseriti nel componente `avatar` di daisyUI. Ogni persona mantiene lo stesso ritratto negli elenchi e nei messaggi. Asset, prompt e provenienza sono documentati in [AVATARS.md](AVATARS.md).

Il [logo botanico](LOGO-ASSETS.md) e sei [vignette delle pagine](ILLUSTRATION-ASSETS.md) riprendono Terra con oggetti quotidiani e piccoli elementi del giardino. Le scene accompagnano alimentazione, movimento, sonno, calma, diario e Community; sono trasparenti, locali e riutilizzate fra schermate, con prompt e provenienza conservati.

Il layout allinea navbar, contenuto e footer; le griglie si adattano alla larghezza effettiva disponibile. La chat tiene messaggi e scrittura nella stessa area, con suggerimenti laterali su desktop e successivi su telefono. Verifiche e anteprime sono in [LAYOUT-AUDIT.md](LAYOUT-AUDIT.md).

I colori Terra distinguono categorie, selezioni, messaggi personali e ricompense. Bordi dei campi e avvisi sono più leggibili, con etichette e icone indipendenti dal colore. Ruoli, contrasti e verifiche sono in [COLOR-AUDIT.md](COLOR-AUDIT.md).

La guida alla respirazione mantiene l’animazione sincronizzata con il timer, conserva la posizione in pausa e offre una modalità statica. Comportamento e fonti sono in [BREATHING-MOTION.md](BREATHING-MOTION.md).

Piatto, dispensa e Frigo Sano usano ingredienti illustrati e azioni native: le porzioni occupano quattro settori, le scelte riempiono i ripiani e un breve movimento conferma il passaggio. Il respiro distingue fase, quattro tempi e progresso della pausa. Comportamenti, modalità statiche e provenienza dei due raster sono in [WIDGETS.md](WIDGETS.md).

Il codice è organizzato in moduli per schermate, stato, navigazione, timer e conversazione. La build minifica il JavaScript e carica le aree su richiesta. Struttura, compatibilità dei salvataggi e misure sono in [MAINTENANCE.md](MAINTENANCE.md).

La verifica dell’export completo di Stitch ha identificato 79 schermate HTML con anteprima, riunite in 37 famiglie funzionali. Tutte hanno una destinazione nell’app: varianti, domande e dialoghi condividono le stesse viste quando descrivono lo stesso flusso. Sono state aggiunte 24 route nominali, per 41 route e 55 varianti indirizzabili. La mappa completa e gli adattamenti sono in [STITCH-COVERAGE.md](STITCH-COVERAGE.md). Le sei nuove immagini delle ricompense, di cui due generate con Imagegen, sono documentate in [STITCH-ASSETS.md](STITCH-ASSETS.md).

## Cosa funziona

- Percorso giornaliero e diario di pasti, movimento, sonno, acqua e pause: modifica delle voci, note, navigazione per giorno e rimozione annullabile.
- Iniziamo insieme, presentazione di Pigna, quattro quiz con storico e ripresa indipendente per categoria durante la sessione, hub e introduzioni agli argomenti.
- Ricerca in un catalogo locale di 21 alimenti, ricerche recenti, mercato, dispensa personale, tre ricette con preferite e ingredienti collegati al diario. Due giochi: Crea il piatto e Frigo Sano.
- Dettaglio e diario del movimento, risveglio muscolare registrabile, routine serale con promemoria nell’app, tre pause guidate scritte con timer da 10, 15 e 5 minuti.
- Foglie, livelli, nove ricompense nelle collezioni Natura/Inverno ed evoluzione di Alberello basata sulle attività effettive; progressi per movimento, sonno, acqua e pause a 7 o 30 giorni.
- Profilo e obiettivi, esportazione JSON/CSV, ripristino JSON con validazione e riepilogo, cancellazione confermata dei dati. Registro manuale del glucosio con modifica, rimozione annullabile, periodo 7/30 giorni e CSV dedicato.
- Test educativo del rischio CDC con punteggio e collegamenti alle fonti.
- Conversazione guidata con Pigna, notifiche giornaliere e community dimostrativa: quattro gruppi, sfide personali basate sul diario, giardino condiviso di esempio e messaggi personali locali modificabili.

I dati restano in `localStorage` su questo browser e dominio. Non c’è sincronizzazione fra dispositivi. Se un salvataggio è illeggibile, l’app protegge il file originale e sospende le modifiche: puoi conservarlo, ripristinare un JSON verificato o scegliere esplicitamente un nuovo percorso. Un errore di accesso ai dati permette invece modifiche temporanee in memoria, da esportare prima di chiudere.

La community contiene esempi e interazioni locali; Pigna usa risposte predefinite su quattro temi, senza un servizio AI. La chat conserva gli ultimi 40 messaggi, comprese le risposte; lo storico quiz gli ultimi 200 tentativi complessivi. Conteggi e migliori risultati dei quiz si riferiscono allo storico conservato. I tentativi incompleti e le risposte del test CDC restano in memoria: ricaricare o chiudere la pagina li interrompe. Respirazione e sessioni guidate condividono un solo timer attivo: avviare una pausa mette in pausa l’altra, conservandone l’avanzamento nella scheda. Timer, partita Frigo Sano e bozze transitorie non vengono ripristinati dopo la ricarica. Le sessioni offrono spunti scritti, senza audio; il promemoria serale appare nelle notifiche dell’app e non invia notifiche push o in background.

Il registro del glucosio parte vuoto e conserva fino a 200 inserimenti manuali, senza connessione CGM, interpretazione clinica o valori generati. Al limite non elimina le misurazioni precedenti per fare spazio. Le ricette riprendono i tre titoli della fonte; ingredienti e preparazioni sono esempi aggiunti per questa app, con durate indicative. Le ricompense usano un’unica valuta virtuale, le Foglie. Gruppi e sfide non sono servizi sociali o classifiche fra utenti reali.

Funzioni completate e verifica dei flussi: [PROTOTYPE-COMPLETION.md](PROTOTYPE-COMPLETION.md). Le nuove scene del Giardino sono documentate in [GARDEN-ASSETS.md](GARDEN-ASSETS.md).

## Anteprima locale

Il CSS compilato è già incluso: basta un server HTTP, senza installare dipendenze.

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Apri `http://127.0.0.1:4173/`. Per usare i moduli JavaScript è necessario un server HTTP: aprire `index.html` direttamente come file non è sufficiente.

## Pubblicazione semplice su GitHub Pages

1. Estrai `output/PREVEDIApp-github-pages.zip`.
2. Carica **il contenuto estratto** (`index.html`, `assets/`, `.nojekyll`) nella radice del repository, sul branch `main`.
3. In **Settings → Pages**, scegli **Deploy from a branch**, `main`, `/ (root)` e salva.

I percorsi degli asset sono relativi e la navigazione usa hash: funziona anche a un indirizzo come `https://nome.github.io/PrevediAPP/`, senza regole di riscrittura.

## Pubblicazione dal progetto sorgente

Puoi estrarre `output/PREVEDIApp-sorgenti.zip` oppure caricare questo progetto, esclusi `node_modules/`, `dist/`, `output/` e `.impeccable/review/`, nel repository. In **Settings → Pages → Source** scegli **GitHub Actions**. Il workflow `.github/workflows/pages.yml` esegue i controlli, compila il CSS e pubblica `dist/` a ogni push su `main`, usando un unico job e runner. È disponibile anche l’avvio manuale da Actions. [Documentazione ufficiale dei workflow Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Per modificare e ricompilare gli stili, con Node.js 24 e npm:

```sh
npm ci
npm run format:check
npm run check
npm run build
```

Modifica gli stili in `src/styles.css` e i moduli in `assets/js/`, poi ricompila. `npm run format` mantiene formattati JavaScript, script e test. La build pulisce `dist/` e produce anche i moduli in `assets/chunks/`: pubblica la cartella completa. La cartella `dist/` è l’app pronta da pubblicare; `assets/app.css` è un file generato. La build non richiede CDN a runtime.

## Struttura

| File | Ruolo |
| --- | --- |
| `index.html` | Shell, navigazione e dialogo accessibile |
| `assets/app.js` | Entrypoint dei moduli |
| `assets/js/` | Controller, servizi, helper daisyUI e schermate |
| `assets/data.js` | Stato, punteggi, quiz e regole del test |
| `assets/icons.js` | SVG Heroicons incorporati |
| `src/styles.css` | Tema daisyUI Terra, font, tipografia e respirazione |
| `tests/` | 113 test su dominio, storage e recupero, sessioni, timer, widget e movimento, cataloghi, glucosio, route, schermate, ripristino ed export |
| `PRODUCT.md` / `DESIGN.md` | Contesto del prodotto e sistema visivo |
| `DAISYUI-AUDIT.md` | Componenti ufficiali adottati e controlli eseguiti |

## Verifica e fonti

113 test automatici coprono le regole del prodotto, compatibilità e guasti dei salvataggi, protezione del file originale, recupero e sostituzione atomici, sessioni indipendenti dei quiz e rami del test educativo, timer, composizione e rimozione delle porzioni, ripiani, feedback animato e confini del respiro, risposte tardive della chat, route, rendering, diario, cataloghi, sfide, registro manuale del glucosio, ripristino ed esportazioni. Formattazione, controlli e build sono parte della pubblicazione.

La verifica dell’estensione Stitch comprende 170 catture native: 55 varianti a 320, 390 e 1440 px, più cinque viste a 2723 px. Le 165 misure route/larghezza non rilevano overflow del documento, immagini rotte o icone di fallback. I flussi sono stati provati in un’origine QA separata dai salvataggi delle anteprime dell’utente. Il verdetto finale chiude i due rilievi della revisione: la conclusione della pausa preserva bozza e focus del profilo, e i sei nuovi nomi delle ricompense restano leggibili nel Giardino a 320 e 1440 px. La revisione indipendente controlla sia la copertura della fonte sia la resa dell’interfaccia; ambito, prove e limiti sono descritti in [STITCH-COVERAGE.md](STITCH-COVERAGE.md) e [MAINTENANCE.md](MAINTENANCE.md#completamento-delle-pagine-stitch). Rapporti e catture di sviluppo in `.impeccable/review/` sono esclusi dal repository pubblicato. La verifica è euristica e riguarda le superfici e i casi esaminati; il punteggio della critica precedente non è stato ricalcolato.

Questi conteggi di catture descrivono la build Stitch precedente all’estensione dei widget. Il totale resta 41 route e 55 varianti indirizzabili; la verifica dei quattro widget e i limiti delle prove correnti sono in [WIDGETS.md](WIDGETS.md#verifica-e-continuità-del-sistema).

Per i widget, formato, controlli, 113 test e build sono passati. Le 16 osservazioni delle quattro route a 320, 390, 1440 e 1280 px non rilevano overflow del documento o immagini rotte. Il verdetto indipendente chiude i tre rilievi mirati su etichette mobili, cinque steps del gioco e cancellazione del movimento allo scroll; la conclusione riguarda questi casi e conserva i limiti delle prove statiche, senza una nuova critica generale o certificazione di accessibilità e prestazioni.

Il test è una traduzione educativa dello [strumento CDC e del suo punteggio](https://www.cdc.gov/diabetes/widgets/risktest/how-your-test-is-scored.html); non è una diagnosi o uno strumento clinico validato per questa app. Nell’app, “Informazioni e fonti” raccoglie i riferimenti educativi.

Alberello proviene dal prototipo fornito. Pigna è stata creata con il generatore di immagini integrato: il [prompt](assets/images/pigna.prompt.txt) è conservato e incorporato nei metadati del PNG. [Heroicons v2.1.5](https://github.com/tailwindlabs/heroicons/tree/v2.1.5) è distribuito con la relativa licenza MIT in `assets/heroicons-LICENSE.txt`. Le licenze MIT di daisyUI e Tailwind CSS sono incluse in `assets/daisyui-LICENSE.txt` e `assets/tailwindcss-LICENSE.txt`. I font Nunito Sans e Literata sono distribuiti con le rispettive licenze OFL nella cartella `assets/fonts/`.
