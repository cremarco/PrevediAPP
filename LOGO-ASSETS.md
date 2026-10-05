# Logo PREVEDIApp

Marchio botanico creato con lo strumento imagegen integrato il 5 ottobre 2026, su richiesta dell’utente. Una pigna con due foglie collega Pigna alla crescita del giardino; il verde bosco e l’ocra riprendono il tema Terra. La scritta PREVEDIApp rimane testo HTML in Nunito Sans, con il nome accessibile del collegamento al percorso.

## File

- `assets/images/logo-prevedi-v1.png`: master raster trasparente, 1254 × 1254 px.
- `assets/images/logo-prevedi-v1.webp`: versione lossless per la UI, 256 × 256 px, circa 20 kB, riutilizzata in sidebar e intestazione mobile.
- `assets/images/favicon-prevedi-v1.png`: favicon trasparente, 32 × 32 px.
- `assets/images/apple-touch-icon-prevedi-v1.png`: icona per i dispositivi Apple, 192 × 192 px.

Il PNG conserva l’alpha generato. Le versioni di servizio sono ridimensionamenti del master, senza modificare il disegno. Nessuna nuova icona funzionale: i controlli dell’app continuano a usare Heroicons. Il precedente `assets/favicon.svg` è conservato.

## Generazione

Modalità: strumento imagegen integrato, nessuna CLI e nessuna chiave API. Primo prompt: [logo-prevedi-v1.initial.prompt.txt](assets/images/logo-prevedi-v1.initial.prompt.txt). Prompt finale di rifinitura: [logo-prevedi-v1.prompt.txt](assets/images/logo-prevedi-v1.prompt.txt). Il riferimento per la rifinitura è la prima generazione, conservata nella cartella delle immagini generate di Codex. I prompt esatti e la provenienza accompagnano gli asset attraverso metadati PNG e sidecar WebP.

## Integrazione

I collegamenti del marchio usano il componente nativo daisyUI `btn btn-ghost`, dentro il navbar e il drawer esistenti. L’immagine è decorativa per le tecnologie assistive e le dimensioni sono dichiarate. Sotto 360 px la testata mostra la sola scritta per dare spazio ai controlli; il simbolo resta nel drawer e nella favicon. Palette, tipografia e comportamenti dell’app rimangono quelli del prototipo.
