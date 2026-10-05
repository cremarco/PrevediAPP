# PREVEDIApp

[Sito su GitHub Pages](https://cremarco.github.io/PrevediAPP/) · [Repository](https://github.com/cremarco/PrevediAPP)

App statica interattiva ricostruita da [Percorso Benessere Prediabete su Stitch](https://stitch.withgoogle.com/projects/4965067135037654911). Mantiene il tema Terra, le mascotte e i flussi principali del prototipo. HTML, JavaScript a moduli, Tailwind CSS 4, daisyUI 5 e Heroicons outline. Font, immagini, icone e CSS sono locali; non servono chiavi API.

L’interfaccia usa componenti daisyUI reali, con parti e stati ufficiali, personalizzati attraverso il tema Terra. I precedenti componenti costruiti con CSS proprio sono stati sostituiti. La mappatura e la verifica sono in [DAISYUI-AUDIT.md](DAISYUI-AUDIT.md).

Le icone usano i nomi e gli SVG originali Heroicons, con scelte coerenti fra le schermate. Il catalogo non include i singoli alimenti: i pulsanti usano nomi e icone di azione/selezione. Scelte e verifiche sono in [HEROICONS-AUDIT.md](HEROICONS-AUDIT.md).

Anna, Marco ed Elena hanno avatar illustrati generati con Imagegen, inseriti nel componente `avatar` di daisyUI. Ogni persona mantiene lo stesso ritratto negli elenchi e nei messaggi. Asset, prompt e provenienza sono documentati in [AVATARS.md](AVATARS.md).

Il layout allinea navbar, contenuto e footer; le griglie si adattano alla larghezza effettiva disponibile. La chat tiene messaggi e scrittura nella stessa area, con suggerimenti laterali su desktop e successivi su telefono. Verifiche e anteprime sono in [LAYOUT-AUDIT.md](LAYOUT-AUDIT.md).

I colori Terra distinguono categorie, selezioni, messaggi personali e ricompense. Bordi dei campi e avvisi sono più leggibili, con etichette e icone indipendenti dal colore. Ruoli, contrasti e verifiche sono in [COLOR-AUDIT.md](COLOR-AUDIT.md).

Il codice è organizzato in moduli per schermate, stato, navigazione, timer e conversazione. La build minifica il JavaScript e carica le aree su richiesta. Struttura, compatibilità dei salvataggi e misure sono in [MAINTENANCE.md](MAINTENANCE.md).

## Cosa funziona

- Percorso giornaliero e diario di pasti, movimento, sonno, acqua e pause: modifica delle voci, note, navigazione per giorno e rimozione annullabile.
- Quattro quiz con storico dei risultati; dispensa personale collegata alla composizione del piatto e alla registrazione del pasto.
- Foglie, livelli, tre ricompense illustrate selezionabili e tappe basate sulle attività effettive; progressi per movimento, sonno, acqua e pause a 7 o 30 giorni.
- Profilo e obiettivi, esportazione JSON/CSV, ripristino JSON con validazione e riepilogo, cancellazione confermata dei dati.
- Test educativo del rischio CDC con punteggio e collegamenti alle fonti.
- Conversazione guidata con Pigna, notifiche giornaliere e community dimostrativa con messaggi personali locali modificabili.

I dati restano in `localStorage` su questo browser e dominio. Non c’è sincronizzazione fra dispositivi. La community contiene esempi e interazioni locali; Pigna usa risposte predefinite, senza un servizio AI. Le risposte del test CDC restano in memoria durante la sessione. Il timer funziona finché la pagina rimane aperta; ricaricare la pagina interrompe la pausa.

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

Puoi estrarre `output/PREVEDIApp-sorgenti.zip` oppure caricare questo progetto, esclusi `node_modules/`, `dist/`, `output/` e `.impeccable/review/`, nel repository. In **Settings → Pages → Source** scegli **GitHub Actions**. Il workflow `.github/workflows/pages.yml` esegue i controlli, compila il CSS e pubblica `dist/` a ogni push su `main`. È disponibile anche l’avvio manuale da Actions. [Documentazione ufficiale dei workflow Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

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
| `tests/` | 40 test su dominio, storage, timer, chat, route, schermate, ripristino ed export |
| `PRODUCT.md` / `DESIGN.md` | Contesto del prodotto e sistema visivo |
| `DAISYUI-AUDIT.md` | Componenti ufficiali adottati e controlli eseguiti |

## Verifica e fonti

40 test automatici coprono le regole del prodotto, compatibilità e guasti dei salvataggi, timer, risposte tardive della chat, route, rendering delle schermate, modifica e annullamento delle registrazioni, report, ripristino ed esportazioni. Sono stati provati nel browser registrazioni, persistenza dopo ricarica, quiz, piatto e controlli del timer, oltre ai layout desktop e mobile e al caricamento sotto un sottopercorso.

Il test è una traduzione educativa dello [strumento CDC e del suo punteggio](https://www.cdc.gov/diabetes/widgets/risktest/how-your-test-is-scored.html); non è una diagnosi o uno strumento clinico validato per questa app. Nell’app, “Informazioni e fonti” raccoglie i riferimenti educativi.

Alberello proviene dal prototipo fornito. Pigna è stata creata con il generatore di immagini integrato: il [prompt](assets/images/pigna.prompt.txt) è conservato e incorporato nei metadati del PNG. [Heroicons v2.1.5](https://github.com/tailwindlabs/heroicons/tree/v2.1.5) è distribuito con la relativa licenza MIT in `assets/heroicons-LICENSE.txt`. Le licenze MIT di daisyUI e Tailwind CSS sono incluse in `assets/daisyui-LICENSE.txt` e `assets/tailwindcss-LICENSE.txt`. I font Nunito Sans e Literata sono distribuiti con le rispettive licenze OFL nella cartella `assets/fonts/`.
