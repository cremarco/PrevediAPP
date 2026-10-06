# Ricompense · illustrazioni Terra v2

Rigenerazione del 6 ottobre 2026 con **Imagegen integrato**, una generazione originale per ciascuna delle nove ricompense. La famiglia riprende le illustrazioni botaniche del sito: forme morbide, contorni marrone Terra, verde bosco e salvia, ocra, avorio e azzurro polvere per l’inverno. Tutte le immagini hanno sfondo realmente trasparente.

| Ricompensa | Asset del sito | Master PNG |
| --- | --- | --- |
| Un nido tra i rami | [reward-nest-v2.webp](assets/images/reward-nest-v2.webp) | [nest.png](artwork/rewards-v2/nest.png) |
| Un angolo di sottobosco | [reward-mushrooms-v2.webp](assets/images/reward-mushrooms-v2.webp) | [mushrooms.png](artwork/rewards-v2/mushrooms.png) |
| Una notte di stelle | [reward-stars-v2.webp](assets/images/reward-stars-v2.webp) | [stars.png](artwork/rewards-v2/stars.png) |
| Casetta per uccellini | [reward-birdhouse-v2.webp](assets/images/reward-birdhouse-v2.webp) | [birdhouse.png](artwork/rewards-v2/birdhouse.png) |
| Pigne rugiadose | [reward-pinecones-v2.webp](assets/images/reward-pinecones-v2.webp) | [pinecones.png](artwork/rewards-v2/pinecones.png) |
| Sciarpa invernale | [reward-scarf-v2.webp](assets/images/reward-scarf-v2.webp) | [scarf.png](artwork/rewards-v2/scarf.png) |
| Cristalli di ghiaccio | [reward-ice-v2.webp](assets/images/reward-ice-v2.webp) | [ice.png](artwork/rewards-v2/ice.png) |
| Manto di neve | [reward-snow-v2.webp](assets/images/reward-snow-v2.webp) | [snow.png](artwork/rewards-v2/snow.png) |
| Volpe artica | [reward-fox-v2.webp](assets/images/reward-fox-v2.webp) | [fox.png](artwork/rewards-v2/fox.png) |

I [nove prompt esatti](artwork/rewards-v2/generation.json) sono conservati anche nei `.prompt.txt` e nei sidecar `.webp.json` accanto agli asset. Il [manifest v2](assets/images/rewards-v2.manifest.json) registra generatore, prompt, master, dimensioni, peso e hash SHA-256. Nessuna CLI o chiave API è stata usata.

I master sono copie degli originali generati. I WebP sono derivati meccanici a 640 × 640 px, qualità 88, con alpha preservato: nessuna modifica artistica successiva. Il catalogo usa composizioni isolate con dimensioni e testi alternativi già gestiti dalle schede daisyUI esistenti.

Per nido, sottobosco e stelle, la pagina Ricompense mostra ora il singolo soggetto; quando la ricompensa è in uso, il Giardino conserva la scena completa di Alberello. Gli altri sei oggetti usano il nuovo asset anche nell’anteprima del Giardino. Identificativi, costi, collezioni e comportamento dei salvataggi restano quelli del catalogo esistente. Le vecchie versioni e la loro provenienza sono conservate in `STITCH-ASSETS.md` e `GARDEN-ASSETS.md`.

## Verifica

I nove WebP hanno alpha reale, angoli trasparenti e un peso complessivo di 653.912 byte. La build integrata include tutti e nove i file. Formato generale, controlli di sintassi, 182 test e build sono passati dopo l’integrazione: sostituiscono i risultati parziali della lavorazione iniziale degli asset.

La verifica iniziale della pagina a 1280 e 390 px non rilevava overflow del documento, immagini rotte o errori console; i filtri restituivano cinque ricompense Natura e quattro Inverno. Quelle catture sono conservate in `.impeccable/review/rewards-v2/` come evidenza del passaggio sugli asset. Il candidato integrato è poi stato ricatturato nella matrice corrente di 134 osservazioni, con la stessa assenza di overflow e immagini rotte. La scansione di provenienza complessiva copre 45 raster senza mancanze. [Verifica integrata e limiti](INTERACTIVE-EXPERIENCE.md#manutenzione-prove-e-limiti). Rapporti e catture restano esclusi dalla pubblicazione; le prove non certificano accessibilità o prestazioni generali.
