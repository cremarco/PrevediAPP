# Illustrazioni delle pagine

Sei vignette botaniche prodotte con lo strumento imagegen integrato il 5 ottobre 2026 per arricchire le pagine mantenendo il tema Terra del prototipo. Contorni marroni morbidi, verde bosco, salvia, ocra e terra; soggetti quotidiani isolati su fondo realmente trasparente. Nessun testo o controllo è disegnato dentro le immagini.

| Asset WebP | Soggetto | Uso |
| --- | --- | --- |
| `assets/images/scene-nutrition-v1.webp` | Verdure, pane e acqua | Alimentazione, piatto, dispensa, percorso, gruppo cucina |
| `assets/images/scene-movement-v1.webp` | Scarpe da passeggio e sentiero | Attività fisica, percorso, gruppo passeggiate |
| `assets/images/scene-sleep-v1.webp` | Cuscino, coperta, libro e luna | Sonno e percorso |
| `assets/images/scene-calm-v1.webp` | Tazza, pianta e due ciottoli | Benessere e percorso |
| `assets/images/scene-journal-v1.webp` | Diario senza scritte, matita e germoglio | Diario, profilo, conclusione dei quiz |
| `assets/images/scene-community-v1.webp` | Tre piante e un annaffiatoio | Giardino della Community |

Tutti i WebP sono RGBA da 512 × 512 px. Pesano complessivamente circa 319 kB. Si riutilizzano fra pagine e vengono caricati dal browser con `loading="lazy"` e `decoding="async"`; larghezza e altezza sono dichiarate per riservare lo spazio. Le immagini decorative hanno `alt=""`: nomi e significato delle azioni restano nel testo e negli Heroicons.

## Prompt e provenienza

Modalità: imagegen integrato, sei chiamate distinte per sei nuovi asset, nessuna CLI/API e nessun nuovo personaggio. Ogni file ha il suo prompt esatto `scene-<tema>-v1.prompt.txt` e il sidecar `scene-<tema>-v1.webp.json` nella stessa cartella. I master PNG trasparenti da 1254 × 1254 px sono salvati nel workspace in `output/illustration-source/`, con il prompt incorporato nei metadati PNG. Gli originali di Codex sono conservati.

- [Alimentazione](assets/images/scene-nutrition-v1.prompt.txt)
- [Movimento](assets/images/scene-movement-v1.prompt.txt)
- [Sonno](assets/images/scene-sleep-v1.prompt.txt)
- [Calma](assets/images/scene-calm-v1.prompt.txt)
- [Diario](assets/images/scene-journal-v1.prompt.txt)
- [Community](assets/images/scene-community-v1.prompt.txt)

I WebP sono ridimensionamenti e conversioni dei master; l’alpha generato è mantenuto, senza scontorno artificiale o sostituzione del fondo. I PNG master non sono caricati dal sito: il build distribuisce le versioni WebP compatte. Gli asset esistenti di Pigna, Alberello, ricompense, avatar e logo restano disponibili.

## Componenti e flussi

`illustration()` in `assets/js/ui/components.js` risolve solo i sei asset locali dichiarati. `card()` può aggiungere il media tramite la struttura nativa daisyUI `card card-side` con `figure` e `card-body`. Le intro dei temi e i gruppi della Community usano questo layout: immagini da 64 px, 96 px da 480 px di viewport e 144 px da 640 px. `illustratedTitle()` affianca un accento da 48 px, poi 80 px da 640 px, ai titoli delle card di diario, piatto e dispensa.

Le tessere del percorso mostrano le vignette a 56/64 px, il profilo a 64/96 px, la conclusione del quiz a 112/144 px e il giardino della Community a 80/112 px; in ciascuna coppia la dimensione maggiore si applica da 640 px. Sono dimensioni locali dell’estensione, registrate in `extensions.illustrations.pageScenes` di `.impeccable/design.json`.

Le immagini accompagnano le attività e non visualizzano quantità, proporzioni del piatto, risultati clinici o obiettivi raggiunti. Grafici e dati rimangono calcolati dalle registrazioni reali. Il timer, le domande del quiz, il test CDC, i moduli, i filtri e i messaggi di trasparenza conservano le loro funzioni; la conclusione del quiz riceve il diario illustrato. I progressi riutilizzano Alberello per collegare la crescita ai dati già presenti.
