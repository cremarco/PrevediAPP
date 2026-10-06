# Asset delle ricompense Stitch

Estensione del 6 ottobre 2026. Il catalogo conserva le tre scene del Giardino già presenti e aggiunge sei oggetti alle collezioni Natura e Inverno. Le immagini sono locali; daisyUI `avatar` e `card` ne gestiscono la presentazione. Selezionare un nuovo oggetto mostra la sua anteprima accanto all’Alberello, senza promettere una trasformazione 3D.

## Illustrazioni nuove

Modalità: **generatore Imagegen integrato**, generazioni originali, sfondo trasparente. I riferimenti naturali esportati non erano utilizzabili come oggetti isolati e sono stati rifatti con l’identità botanica Terra. Nessuna CLI o chiave API è necessaria a runtime.

| Oggetto | Master conservato | Asset usato dal sito |
| --- | --- | --- |
| Casetta per uccellini | [birdhouse.png](artwork/rewards-v1/birdhouse.png) | [reward-birdhouse-v1.webp](assets/images/reward-birdhouse-v1.webp) |
| Pigne rugiadose | [pinecones.png](artwork/rewards-v1/pinecones.png) | [reward-pinecones-v1.webp](assets/images/reward-pinecones-v1.webp) |

I PNG master conservano il prompt nei metadati. I WebP sono derivati meccanici a 512 × 512 px con alpha; il prompt esatto è conservato anche nei sidecar.

### Prompt: Casetta per uccellini

```text
Use case: stylized-concept. Asset type: a finished illustrated reward image for PREVEDIApp's Terra botanical wellness app, square. Primary request: a small rustic wooden birdhouse with a circular opening, weathered natural wood and a few soft moss details, a tiny songbird perched nearby. Style: polished gentle hand-painted storybook botanical watercolor, clean soft organic contours, earthy brown #6B6358, leaf green #4A7C59, muted golden #C4A66A details. Composition: one complete birdhouse object, centered, generous clear margin, fully visible silhouette, small subtle branch under it, close view readable at 80px. Lighting: soft daylight, calm warm neutral natural colors. Background: genuinely transparent alpha, no scene backdrop. No lettering, logos, watermark, UI, software interface, border, frame or caption. This is a brand-new nature reward illustration, not an app mockup.
```

### Prompt: Pigne rugiadose

```text
Use case: stylized-concept. Asset type: a finished illustrated reward image for PREVEDIApp's Terra botanical wellness app, square. Primary request: a small cluster of three natural pinecones with delicate morning dew, a few green pine needles and a little moss, full botanical object. Style: polished gentle hand-painted storybook botanical watercolor, clean soft organic contours, earthy brown #6B6358, leaf green #4A7C59, muted golden #C4A66A details. Composition: one isolated compact cluster centered, generous clear margin, complete silhouette, readable at 80px. Lighting: soft daylight, natural muted colors. Background: genuinely transparent alpha, no scene backdrop. No characters, lettering, logos, watermark, UI, software interface, border, frame or caption. This is a brand-new nature reward illustration, not an app mockup.
```

## Immagini riutilizzate dalla fonte

Le quattro immagini invernali provengono dall’export completo del [progetto Stitch fornito](https://stitch.withgoogle.com/projects/4965067135037654911), scaricato il 6 ottobre 2026. Sono convertite in WebP a 512 × 512 px; l’opera non è stata ridisegnata. Le immagini conservano il proprio sfondo e sono presentate come anteprime quadrate.

| Oggetto | File locale | Cartella sorgente nell’export |
| --- | --- | --- |
| fox | [reward-fox.webp](assets/images/reward-fox.webp) | `a_3d_winter_themed_animal_for_a_health_app_a_cute_white_arctic_fox_with_big` |
| ice | [reward-ice.webp](assets/images/reward-ice.webp) | `a_3d_winter_themed_decoration_for_a_health_app_mascot_tree_a_set_of_sparkling` |
| scarf | [reward-scarf.webp](assets/images/reward-scarf.webp) | `a_3d_winter_themed_item_for_a_health_app_mascot_tree_a_cozy_red_and_white` |
| snow | [reward-snow.webp](assets/images/reward-snow.webp) | `a_3d_winter_themed_decoration_for_a_health_app_mascot_tree_a_small_pile_of_soft` |

Il [manifest](assets/images/rewards-stitch.manifest.json) conserva percorsi sorgente, dimensioni, byte e origine; ciascun WebP ha un sidecar `.json` di provenienza. Gli oggetti originali del catalogo e i nuovi usano sempre Foglie virtuali. Costi originali: 60/100/160; nuovi: casetta 120, pigne 140, sciarpa 150, ghiaccio 200, neve 180, volpe 250. Usare Foglie non riduce il livello raggiunto.

Le icone nuove `magnifying-glass` e `cloud` provengono da Heroicons v2.1.5, come il catalogo esistente; la licenza MIT è inclusa in `assets/heroicons-LICENSE.txt`.
