# Immagini degli ingredienti aggiuntivi

Completamento del 6 ottobre 2026. Sei immagini originali generate con **Imagegen integrato**, una per alimento, completano i quindici ingredienti usati nel Frigo e nel piatto. I nove alimenti originali conservano l’atlante esistente. La nuova famiglia riprende acquerello/gouache botanico, colori naturali Terra, ombreggiatura morbida e sfondo trasparente.

| Alimento | File del sito | Master PNG |
| --- | --- | --- |
| Carote | [food-carote-v1.webp](assets/images/food-carote-v1.webp) | [carote.png](artwork/foods-v1/carote.png) |
| Zucchine | [food-zucchine-v1.webp](assets/images/food-zucchine-v1.webp) | [zucchine.png](artwork/foods-v1/zucchine.png) |
| Fiocchi d’avena | [food-avena-v1.webp](assets/images/food-avena-v1.webp) | [avena.png](artwork/foods-v1/avena.png) |
| Farro | [food-farro-v1.webp](assets/images/food-farro-v1.webp) | [farro.png](artwork/foods-v1/farro.png) |
| Ceci | [food-ceci-v1.webp](assets/images/food-ceci-v1.webp) | [ceci.png](artwork/foods-v1/ceci.png) |
| Uova | [food-uova-v1.webp](assets/images/food-uova-v1.webp) | [uova.png](artwork/foods-v1/uova.png) |

I [prompt esatti](artwork/foods-v1/generation.json) sono conservati anche nei `.prompt.txt` e nei sidecar `.webp.json` accanto agli asset. Il [manifest](assets/images/foods-v1.manifest.json) registra prompt, generatore, originali, dimensioni, peso e SHA-256. Nessuna CLI o chiave API è stata usata.

I PNG master sono copie degli originali generati. I WebP sono derivati meccanici a 512 × 512 px, qualità 88, con alpha preservato e nessun ritocco artistico. Tutti e sei hanno trasparenza reale e angoli trasparenti; il peso complessivo è 323.054 byte.

`foodPicture` e `hasFoodPicture` coprono ora tutti i quindici `plateFoods`: Frigo, ripiani e picker del piatto riusano gli stessi asset. Gli alimenti sconosciuti conservano il fallback vuoto. Le immagini restano decorative (`alt=""`, wrapper `aria-hidden="true"`) perché il nome dell’alimento è già testo accessibile nel pulsante. La presenza dell’immagine attiva le dimensioni previste dalle schede esistenti. Catalogo, azioni e salvataggi non cambiano.

## Verifica

Build superata: tutti e sei i WebP sono inclusi in `dist`, e le quindici risorse dei `plateFoods` esistono. I 182 test e i controlli di sintassi passano, così come la formattazione mirata del componente e del test di integrazione. Il test esistente verifica ora la presenza dell’arte per tutti i quindici ingredienti e il fallback vuoto per ID sconosciuti.

Frigo osservato a 1280 e 390 px, picker del piatto a 390 px: tutte e quindici le immagini caricano, senza overflow del documento o errori console. Catture locali in `.impeccable/review/foods-v1/`, escluse dalla pubblicazione. Il controllo meccanico del componente non segnala rilievi. La verifica riguarda il caricamento e la presentazione delle immagini, senza modificare la dispensa salvata dell’utente.
