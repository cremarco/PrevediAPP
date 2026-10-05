# Illustrazioni del Giardino

Tre varianti generate con il generatore integrato Imagegen, usando `alberello-original.png` come immagine di riferimento. Mantengono personaggio, volto, posa, tratto e vignetta del prototipo; aggiungono solo la decorazione della ricompensa.

| Ricompensa | File consegnato | Prompt inviato al generatore | Peso |
| --- | --- | --- | ---: |
| Nido | [garden-nest.webp](assets/images/garden-nest.webp) | [Prompt esatto](assets/images/garden-nest.prompt.txt) | 42,628 byte |
| Sottobosco | [garden-mushrooms.webp](assets/images/garden-mushrooms.webp) | [Prompt esatto](assets/images/garden-mushrooms.prompt.txt) | 48,448 byte |
| Stelle | [garden-stars.webp](assets/images/garden-stars.webp) | [Prompt esatto](assets/images/garden-stars.prompt.txt) | 43,190 byte |

I file WebP sono 640 × 640 con trasparenza reale fuori dalla vignetta. I PNG originali della generazione sono conservati localmente in `output/garden-source-png/` e non pubblicati. La conversione ha soltanto ridimensionato e compresso i file; nessuna modifica artistica successiva.

Il prompt esatto è conservato in ciascun `.prompt.txt`; il comando Impeccable `embed-prompt` conserva la provenienza anche nel relativo `.webp.json`, usando il fallback sidecar previsto per questo formato. I PNG locali conservano il prompt nei metadati. Il controllo di provenienza delle otto immagini pubblicate non segnala file mancanti.

La funzione `alberello()` sceglie soltanto una variante posseduta dal percorso; altrimenti mostra l’originale. L’immagine ha dimensioni dichiarate e testo alternativo. Il livello, i punti e il nome della ricompensa restano HTML accessibile, fuori dalla grafica. Nido e Sottobosco cambiano il contesto diurno; Stelle mostra luna e cielo notturno senza cambiare il livello del personaggio.
