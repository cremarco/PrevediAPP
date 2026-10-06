# Dettagli animati del pino

La fronda negli heading e la pigna nel footer accompagnano le pagine con un movimento delicato. Sono due decorazioni botaniche locali: titoli, descrizioni e azioni mantengono la loro gerarchia, mentre palette Terra, Literata, Nunito Sans e componenti originali daisyUI restano quelli del sistema esistente.

## Presenza e movimento

L’helper `heading()` in [components.js](assets/js/ui/components.js) inserisce la fronda in un gruppo in flusso, accanto alle azioni quando presenti. Negli heading senza azioni il gruppo è nascosto sotto 480 px e compare dalla soglia inclusa. Con le azioni resta disponibile anche su telefono, andando a capo insieme al proprio gruppo senza sovrapporsi al titolo o alla descrizione. L’immagine occupa un box di 80 × 40 px, poi 96 × 56 px da 640 px.

La pigna occupa un box di 56 × 56 px nel `footer` nativo di [index.html](index.html), accanto a «Un piccolo passo. Ogni giorno.» e al controllo del movimento. Il footer è parte della shell e resta presente in tutte le 55 varianti indirizzabili, anche su telefono; conserva lo spazio inferiore riservato al dock.

[pine-motion.js](assets/js/pine-motion.js) usa due Web Animation distinte, con easing `ease-in-out` e soli keyframe `transform`:

| Soggetto | Gesto | Ciclo | Ampiezza |
| --- | --- | --- | --- |
| Fronda | Brezza con ritorno alla posa naturale | 9,8 s | Rotazione da −1,2° a +1,5°; spostamenti massimi di 1,5 px in orizzontale e 1 px in verticale |
| Pigna | Breve dondolio seguito da una sosta nella posa naturale | 8,7 s | Rotazione da −1° a +1,7°; spostamento orizzontale massimo di 0,5 px |

Il motore ammette al massimo tre nodi; la composizione attuale ne contiene due per pagina. Le animazioni vengono create solo dopo la prima osservazione del soggetto nel viewport. Non ci sono dipendenze aggiunte o loop JavaScript.

## Controllo e preferenza locale

«Pino animato» è un checkbox HTML con `label` e `toggle toggle-primary toggle-sm` originali daisyUI. Il label ha un’area minima alta 44 px; il controllo conserva focus, tastiera e stati della libreria. La preferenza è attiva per impostazione iniziale e governa insieme i due soggetti.

[controller.js](assets/js/controller.js) salva la scelta nella chiave dedicata `prevediapp.pine-motion.v1`: soltanto il valore `"false"` disattiva il movimento. La scelta è separata dal percorso in `prevediapp.v1`, non entra nel backup JSON e può essere cambiata anche quando il percorso è protetto in attesa di recupero. Se la scrittura nello storage fallisce, la scelta vale in memoria e il controllo mostra «Preferenza valida in questa sessione.» tramite `aria-describedby`.

Un reset del percorso riuscito rimuove anche la preferenza e ripristina il valore iniziale attivo; un reset del percorso fallito non avvia questa rimozione. Se la rimozione della preferenza fallisce dopo il reset riuscito, il valore iniziale vale in sessione ed è accompagnato dalla stessa nota. Gli eventi `storage` della chiave dedicata sincronizzano le altre schede della stessa origine. Anche un evento con `key === null`, prodotto dalla cancellazione dello storage, ripristina la preferenza iniziale e prosegue la sincronizzazione del percorso.

## Accessibilità, pausa e fallback

Le immagini hanno `alt=""`, sono dentro figure con `aria-hidden="true"` e non ricevono eventi puntatore. Non comunicano selezioni, progressi o istruzioni: il contenuto e le azioni restano disponibili in ogni stato.

| Condizione | Comportamento |
| --- | --- |
| Toggle spento | Animazioni cancellate; figure nella posa statica |
| `prefers-reduced-motion: reduce` | Figure statiche; toggle disabilitato e nota «Movimento ridotto attivo sul dispositivo.» collegata con `aria-describedby` |
| IntersectionObserver o Web Animations API indisponibili, o creazione dell’animazione fallita | Asset statici già presenti nell’HTML |
| Soggetto fuori viewport, documento nascosto o dialogo aperto | Animazioni in pausa, con posa e fase conservate |
| Timer attivo nella pagina Stress, in una sessione guidata o in Frigo Sano | Pino in pausa, dando priorità all’attività corrente |
| Ritorno nel viewport o termine della sospensione | Ripresa dalla fase conservata, se preferenza e dispositivo consentono movimento |
| JavaScript non disponibile | Pigna della shell statica; le pagine dell’app richiedono JavaScript come il resto del prototipo |

La preferenza del dispositivo prevale sulla scelta locale senza riscriverla. Al termine della riduzione del movimento, torna a valere la scelta memorizzata. Spegnere il toggle o attivare la riduzione cancella la Web Animation; una successiva attivazione avvia un nuovo ciclo. La pausa per visibilità, dialoghi e timer conserva invece la stessa istanza e la sua posizione.

## Lifecycle e manutenzione

`mount()` riconcilia i nodi attuali con i record esistenti. Il render sostituisce solo il contenuto del main: il vecchio heading viene rimosso dal motore e il nuovo viene osservato, mentre nodo, animazione e fase della pigna persistente restano conservati. Il controller richiama `syncPineDetails()` dopo i render, ai tick dei timer e alla chiusura del dialogo; prima di `showModal()` sospende il pino.

I record rimossi vengono disosservati e la loro animazione cancellata; il valore iniziale di `transformOrigin` viene ripristinato. `clear()` disconnette l’observer e invalida i callback precedenti; `destroy()` esegue la pulizia e rimuove i listener di visibilità e preferenza. Generazione dell’observer e istante di registrazione impediscono a notifiche tardive di riattivare nodi rimossi o appena rimontati.

Per mantenere questa estensione:

- Riusa `heading()` per i nuovi titoli e lascia il footer nella shell persistente.
- Mantieni i due tipi ammessi, `data-pine-motion="branch"` e `data-pine-motion="cone"`, e il limite di tre nodi; ogni nuovo uso deve mantenere semantica decorativa e fallback statico.
- Conserva pause, controllo nativo e priorità dei timer. Le azioni dell’app non devono attendere l’animazione.
- Modifica i sorgenti in `assets/js/` e ricompila con la procedura di [MAINTENANCE.md](MAINTENANCE.md); mantieni allineati dimensioni HTML, asset e manifest se sostituisci i raster.
- Verifica continuità del footer dopo i render, riduzione del movimento, toggle/ricarica, storage negato e sincronizzazione fra schede. Conserva i prompt e aggiorna la provenienza quando cambia un asset.

## Asset, prompt e provenienza

I due master sono risultati del tool integrato `image_gen.imagegen`, copiati in `artwork/pine-v1/` dagli output originali. I pixel dei master non sono stati ritagliati, ridimensionati o ricostruiti. La fronda deriva da una generazione iniziale e da un targeted edit selezionato per isolamento e inquadratura; la pigna da una generazione. I riferimenti stilistici registrati nei JSON sono `scene-nutrition-v1.webp` e `reward-pinecones-v1.webp`.

| Asset runtime | Dimensioni | Byte | Master e metadati |
| --- | --- | ---: | --- |
| [pine-branch-v1.webp](assets/images/pine-branch-v1.webp) | 576 × 384 px | 78.920 | [branch.png](artwork/pine-v1/branch.png) · [branch.png.json](artwork/pine-v1/branch.png.json) |
| [pine-cone-v1.webp](assets/images/pine-cone-v1.webp) | 256 × 256 px | 12.952 | [cone.png](artwork/pine-v1/cone.png) · [cone.png.json](artwork/pine-v1/cone.png.json) |
| Totale runtime | Entrambi con alpha | 91.872 | [Manifest](assets/images/pine-v1.manifest.json) |

I master sono RGBA: fronda 1536 × 1024 px, pigna 1254 × 1254 px. I JSON conservano percorso dell’output selezionato, modalità, riferimenti e ispezione dell’alpha. I quattro angoli dei due master sono completamente trasparenti; i WebP mantengono alpha con estremi 0–255. Le dimensioni e i byte runtime sono quelli del manifest.

La preparazione runtime è una conversione meccanica: riduzione con `sips`, poi codifica WebP con Pillow, `quality=90` e `method=6`. La conversione non aggiunge oggetti né ricostruisce creativamente l’illustrazione. Il sito carica i WebP locali; i master restano disponibili per manutenzione.

Il set esatto dei prompt è conservato nei file originali, senza riscrittura:

- [branch.initial.prompt.txt](artwork/pine-v1/branch.initial.prompt.txt): generazione iniziale della fronda.
- [branch.prompt.txt](artwork/pine-v1/branch.prompt.txt): targeted edit selezionato della fronda.
- [cone.prompt.txt](artwork/pine-v1/cone.prompt.txt): generazione della pigna.

Il prompt selezionato è incorporato nei PNG come `impeccable:prompt` e nei sidecar runtime [pine-branch-v1.webp.json](assets/images/pine-branch-v1.webp.json) e [pine-cone-v1.webp.json](assets/images/pine-cone-v1.webp.json). La scansione di provenienza consegnata per questa estensione copre 30 raster, senza provenienze mancanti.

## Verifica e continuità del sistema

I due passaggi di self-QA, iniziale e conferma, misurano ciascuno le 55 varianti a 320 e 1280 px: 110 misure per passaggio, 220 complessive. I due file `metrics.json` non rilevano overflow del documento, immagini rotte, titolo `h1` errato o numero inatteso di nodi pino. Sei heading rappresentativi sono stati catturati a 320, 390, 1280 e 1440 px, con catture del footer e dei flussi. Le prove tramite UI nativa verificano movimento, toggle, ricarica, dialogo e priorità della respirazione; nessun errore console è stato osservato.

Formato e 123 test sono passati anche dopo l’integrazione dell’evento storage con chiave nulla. Il detector è stato eseguito una volta: nessun finding primario e due advisory dovuti alla lettura della formula del raggio del toggle nativo daisyUI. I valori persistiti `5` e `.125),calc(.5rem` sono circoscritti a `index.html`; non sono nuovi raggi del tema e non richiedono la sostituzione del controllo.

La revisione finale locale in `.impeccable/review/pine-motion/finish-review.md` dispone `ship`, senza material fixes. Rapporti e catture sono in `.impeccable/review/pine-motion/`, esclusi dalla distribuzione. Le prove DOM e i test sostengono lifecycle, fallback e pause; gli screenshot sostengono composizione e adattamento responsive. Queste evidenze non certificano fluidità su hardware reale, accessibilità completa o prestazioni, e non ricalcolano il punteggio della critica generale.

Il confronto fra [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), il brief, gli helper e il controller conferma la continuità: identità naturale, palette e font Terra, layout in flusso, focus e riduzione del movimento, controlli e footer originali daisyUI. Si documenta quindi una feature del sistema vigente. `PRODUCT.md`, `DESIGN.md` e `.impeccable/design.json` sono preservati esattamente; la deriva preesistente del sidecar resta segnalata senza riparazione. Il verdetto locale non attesta un push o un deployment di questa estensione.
