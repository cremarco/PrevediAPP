# App PREVEDIApp
Mode: Operate
Target: index.html

## Direction contract
THESIS: Il percorso quotidiano è una serie di piccoli gesti che fanno crescere Alberello. Una sola navigazione e azioni con esito visibile.
OWN-WORLD: Tema Terra già presente in Stitch: avorio, verde foglia #4A7C59, terra #6B6358, oro #C4A66A. Literata e Nunito Sans; illustrazione originale Alberello, linee leggere, angoli 16px, Heroicons 24px outline.
STORY: Aprire il percorso, scegliere un’attività, registrarla e ritrovare progressi e ricompense. Diario e salvataggio locale collegano le schermate.
FIRST VIEWPORT: Sidebar su desktop, intestazione con data e profilo, saluto, composizione a due colonne: checklist quotidiana ampia a sinistra, Alberello a destra. Quattro categorie di benessere e invito a Pigna immediatamente sotto. Su telefono, missioni prima dell’Alberello in colonna e dock con cinque destinazioni.
COMPONENTS: Solo componenti daisyUI 5 con struttura e parti ufficiali; colori semantici del tema Terra. Layout via utility Tailwind. Niente sostituti di componenti dipinti con CSS proprio. Vincolo esplicito dell’utente.
FORM: Sistema Terra stabilito nel prototipo fornito, conservato su richiesta; nessuna nuova identità o concept tournament. Code-first confermato.
SIGNATURE: Completare una missione aggiorna obiettivi, punti e crescita di Alberello; la respirazione si espande e si contrae con il timer.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying provenance.

## Estensione verificata del 6 ottobre 2026

Le 37 famiglie delle 79 schermate Stitch con anteprima sono rappresentate da route, stati o dialoghi; 24 route nominali aggiunte portano l’app a 41 route e 55 varianti indirizzabili. L’estensione conserva il contratto Operate/Terra e il percorso code-first. Ricette/ricerca/mercato, contenuti guidati, gruppi/sfide e foresta usano gli stessi componenti nativi e asset locali; nessuna nuova identità o token di sistema.

Gli adattamenti rendono esplicite le capacità effettive: registro del glucosio manuale, sessioni scritte senza audio, social dimostrativo, ricette di esempio e un’unica valuta virtuale. I dati persistenti opzionali conservano chiave e schema v1; timer e partite restano transitori. Copertura e provenienza delle nuove ricompense sono documentate in STITCH-COVERAGE.md e STITCH-ASSETS.md. Il documenter ha confrontato `src/styles.css`, helper e renderer con il sistema esistente e preservato `DESIGN.md` e `.impeccable/design.json`.
