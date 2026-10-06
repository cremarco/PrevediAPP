# Widget animati delle azioni

Gli ingredienti illustrati di Frigo e piatto sono ora quindici: il [completamento delle sei immagini mancanti](FOOD-ASSETS.md) conserva l’atlante originale e aggiunge sei oggetti trasparenti nello stesso stile.

Estensione del 6 ottobre 2026. I widget riprendono piatto, ripiani e guida del respiro dal [progetto Stitch](https://stitch.withgoogle.com/projects/4965067135037654911), conservando Terra, daisyUI 5, Heroicons e il modello locale dell’app.

## Azioni e stati

| Widget | Compito | Comportamento |
| --- | --- | --- |
| [Piatto](https://cremarco.github.io/PrevediAPP/#piatto) | Comporre quattro porzioni | Quattro settori modificabili, filtro dal settore vuoto, ingredienti illustrati, duplicati e rimozione diretta. La verifica è esplicita; il diario accetta il modello 2 verdure/1 carboidrati/1 proteine. |
| [Dispensa](https://cremarco.github.io/PrevediAPP/#frigo) | Scegliere e conservare gli ingredienti | Mercato illustrato, tre ripiani con conteggi, aggiunta/rimozione e riuso nel piatto. Il mercato precede i ripiani su telefono; gli ingredienti extra già salvati restano disponibili. |
| [Respirazione](https://cremarco.github.io/PrevediAPP/#stress) | Seguire una pausa | Pigna apre e raccoglie il cerchio in quattro più quattro secondi; fase, quattro tempi e avanzamento dell’intera pausa sono distinti. Durate 1/3/5 minuti, pausa/ripresa/reset e guida statica. |
| [Frigo Sano](https://cremarco.github.io/PrevediAPP/#frigo-sano) | Riconoscere i gruppi degli alimenti | Oggetti illustrati, cinque scelte e ripiani che si riempiono dopo le risposte corrette. Trenta secondi e tre tentativi; risultato e spiegazioni educative, nessun premio aggiuntivo. |

Non è necessario trascinare gli oggetti: ogni azione è un controllo nativo utilizzabile da tastiera o tocco. Lo stato cambia subito. Il volo verso il posto scelto dura 380 ms, con conferma di 230 ms; non ritarda verifica, salvataggio o focus. Un altro render o uno scroll annulla il feedback precedente e rimuove le copie decorative, anche quando lo scorrimento è causato dal focus. Le copie sono `aria-hidden`, `inert` e senza eventi puntatore. Se origine/destinazione non sono visibili, il documento è nascosto o il dispositivo richiede movimento ridotto, lo spostamento viene saltato.

La respirazione conserva una sola Web Animation di otto secondi sincronizzata ai millisecondi del timer, con quattro secondi per Inspira e quattro per Espira. Nascondere la pagina o uscire dal viewport sospende il movimento; tornando visibile si riallinea al tempo effettivo. Pausa e ripresa conservano il punto, e il toggle Animazione offre la guida statica. La preferenza di movimento ridotto disabilita il toggle e ne spiega il motivo. Le indicazioni testuali restano disponibili. I numeri dei quattro tempi non vengono annunciati ogni secondo; la fase cambia ogni quattro secondi. La corona e la percentuale indicano l’avanzamento dell’intera pausa, mentre i quattro tempi ripartono a ogni metà del ciclo.

Il filtro di un settore vuoto porta il focus al primo ingrediente del gruppo; dopo la quarta porzione il focus raggiunge Verifica. Una porzione di un gruppo in eccesso resta visibile e rimovibile, con spiegazione testuale. Il salvataggio nel diario compare dopo la verifica del modello 2/1/1. Nella dispensa l’azione «Usa la mia dispensa» si abilita quando sono presenti i tre gruppi, e indica quelli mancanti. Il picker del piatto, il mercato e i ripiani passano da due a tre colonne a 360 px; i cinque steps del gioco si riducono nella larghezza disponibile.

Nessuna nuova libreria, shader o dipendenza. Piatto, dispensa, Frigo Sano e respiro sono composizioni applicative di componenti originali daisyUI, che non offre componenti chiamati `plate`, `fridge` o `breathing`. La forma del piatto usa `mask mask-circle` con quattro `btn`; badge, dettagli `collapse`, barre `progress` e illustrazioni negli `avatar` conservano parti e stati originali. I filtri sono un gruppo lineare `join join-vertical w-full sm:join-horizontal`, con pulsanti `join-item`: in colonna su telefono e in riga da 640 px. Ripiani `list`, fasi `steps`, toggle e respiro `radial-progress` mantengono struttura daisyUI. Terra e utility Tailwind personalizzano stile e layout; selezione e disabilitazione usano stati nativi e attributi HTML/ARIA effettivi.

`ui/nutrition-widgets.js` compone settori e ripiani, `ui/food-art.js` risolve le celle dell’atlante e `widget-motion.js` gestisce il feedback breve di presentazione. Il ciclo respiratorio, timer e regole alimentari appartengono all’app; non sono comportamenti forniti da daisyUI. Il filtro del piatto è transitorio, `ui.plate.target` parte da `null`; chiave `prevediapp.v1`, schema v1, diario, punti e persistenza rimangono compatibili. Il totale resta 41 route nominali e 55 varianti indirizzabili. La verifica corrente dei componenti è in [DAISYUI-AUDIT.md](DAISYUI-AUDIT.md); le prove dell’estensione widget descritte più avanti restano quelle della sua matrice precedente.

## Asset e provenienza

Un unico atlante trasparente contiene i nove ingredienti nelle celle di una griglia 3 × 3: broccoli/spinaci/pomodori, quinoa/riso/pane, salmone/pollo/tofu. È stato creato con **Imagegen integrato**, una generazione originale di un atlante, senza CLI o chiavi API. Il file è RGBA 1254 × 1254 px; i soggetti non attraversano le celle. `food-art.js` ne presenta una cella alla volta, mantenendo nomi e azioni in HTML. Il browser riusa lo stesso URL dell’immagine.

| Asset | Master conservato | File del sito | Origine |
| --- | --- | --- | --- |
| Nove ingredienti | [ingredients-atlas.png](artwork/widgets-v1/ingredients-atlas.png) | [widget-ingredients-atlas-v1.webp](assets/images/widget-ingredients-atlas-v1.webp) | Generazione Imagegen integrata con alpha reale |
| Interno del frigo | [fridge-stitch.png](artwork/widgets-v1/fridge-stitch.png) | [widget-fridge-stitch-v1.webp](assets/images/widget-fridge-stitch-v1.webp) | Raster originale dell’export Stitch, 1200 × 896 px |

I due WebP sono conversioni meccaniche, senza cambi di composizione o rimozione dello sfondo: atlante 439.930 byte, frigo 61.368 byte, complessivamente 501.298 byte. I master PNG non vengono distribuiti dal sito. Prompt e origine sono incorporati nei PNG e nei sidecar WebP; [manifest](assets/images/widgets-v1.manifest.json), [prompt e percorso del master](artwork/widgets-v1/ingredients-atlas.prompt.txt), [origine del frigo](artwork/widgets-v1/fridge-stitch.origin.txt). La lettura documentale verifica tutti i percorsi del manifest, le dimensioni, l’alpha dell’atlante e i metadati di provenienza. Il controllo fornito dal builder copre 28 raster e zero provenienze mancanti, includendo i master conservati.

### Prompt esatto dell’atlante

```text
Use case: illustration-story
Asset type: ONE transparent 3 by 3 ingredient sprite atlas for the PREVEDIApp interactive plate and pantry widgets; nine square equal cells in one square image, ideally 1536 by 1536 pixels.
Scene/backdrop: genuinely transparent background with real alpha across all empty space. No painted checkerboard, white rectangle, colored cell backgrounds, borders, grid lines, text or labels.
Subjects and required order, left to right:
Row 1: (1) broccoli florets, (2) fresh spinach leaves, (3) red tomatoes with one cut half.
Row 2: (4) cooked quinoa, tiny rounded ivory and tan grains in a small shallow rustic bowl, (5) cooked brown rice, recognizable elongated brown grains in a small shallow rustic bowl, (6) two slices of wholegrain bread with a brown crust.
Row 3: (7) a cooked orange salmon fillet with visible flaky bands, (8) a cooked golden chicken breast, (9) a small group of pale tofu cubes.
Every cell contains only its named ingredient presentation; no added garnish, utensils, faces or extra food.
Style/medium: friendly botanical gouache and clean storybook watercolor, calm Terra palette, natural matte colors, subtle shading, rounded organic shapes and restrained dark brown outlines around #6B6358. Forest green and sage vegetables, muted ochre bread and bowls, natural red tomato and muted salmon orange. Strong recognizable silhouettes that remain clear at 48 pixels.
Composition/framing: nine compact isolated motifs centered precisely in nine equal cells, with the centers at one sixth, one half and five sixths of image width and height. All contours and objects fully visible. Generous consistent transparent margins in every cell, at least 16 percent of each cell on every side. No object or shadow crossing into adjacent cells, no overlapping motifs. All nine motifs comparable perceived size. Three-quarter overhead view with clear edible ingredient identity, no deep cast shadow.
Constraints: exactly nine subjects in this exact row/column order. A single production sprite atlas rather than a UI mockup or collage of cards. No words, numbers, logos, watermarks, icons, medical claims or interface controls. Preserve real alpha.
```

## Verifica e continuità del sistema

Questa è un’estensione Operate costruita dal codice. Il confronto di `DESIGN.md` con i token del tema in `src/styles.css`, gli helper daisyUI condivisi, i renderer dei widget e la mappa Heroicons conferma palette Terra, Literata/Nunito Sans, raggi e struttura dei controlli esistenti. Il riferimento Stitch guida il compito e gli oggetti del piatto, del frigo e del respiro; l’adattamento mantiene azioni HTML native e composizioni responsive. `DESIGN.md` e `.impeccable/design.json` sono conservati, senza nuovi token o riparazioni della deriva preesistente del sidecar.

Formato, controlli, 113 test automatici e build sono passati. Il pacchetto fornito contiene 16 catture native delle quattro route a 320 × 740, 390 × 844, 1440 × 1000 e 1280 × 720; la matrice confermata riporta zero overflow del documento e immagini rotte in tutti i casi. Le prove dei flussi nell’origine QA isolata coprono filtro e focus, quattro porzioni con duplicati, verifica e diario, aggiunta/rimozione dai ripiani, riuso della dispensa, errore/esito del gioco e pausa statica del respiro. Un solo detector meccanico ha restituito `[]`. I risultati della precedente estensione Stitch, con 98 test e 170 catture, restano storici e non descrivono questa matrice dei widget.

La revisione iniziale ha richiesto tre correzioni: etichette complete nei controlli a 320 px, contenimento dei cinque steps del gioco e cancellazione del volo se il focus fa scorrere la pagina. Il verdetto finale le chiude tutte come `resolved`, con disposizione `ship` limitata alla lista F1–F3. Le nuove catture mostrano «Aggiungi», «Nel frigo» e «Rimuovi» interi, e il picker del piatto leggibile. Il gioco completo a 320 px mantiene le cinque tappe nella card, fra x41 e x278,98 con `scrollWidth` 320. Per lo scroll la risoluzione è attestata da lettura del codice e test unitario; il caso normale conserva trasferimento di 380 ms e conferma di 230 ms. Rapporti, prove JSON e catture in `.impeccable/review/action-widgets/`, inclusi `finish-review.md` e `finish-verdict.md`, sono artefatti di sviluppo esclusi dalla distribuzione.

Gli screenshot attestano stati e composizione statici. Codice e unit test coprono sincronizzazione, confini delle fasi, pausa frazionaria e interruzioni; i flussi nativi verificano i controlli e il focus nei casi documentati. La prova nativa del respiro mostra pausa e guida statica, mentre il passaggio atteso a Espira non è stato confermato autonomamente dal relativo `waitFor`; i confini sono coperti dai test. Queste prove non certificano tutta la fluidità reale, accessibilità completa o prestazioni su dispositivi reali, e non ricalcolano il punteggio della critica generale.
