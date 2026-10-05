# Avatar della community

Creati il 5 ottobre 2026 con **Imagegen integrato**, una generazione separata per persona, senza immagini di riferimento. Sono ritratti di adulti fittizi per la community dimostrativa di PREVEDIApp.

| Persona | Asset finale | Prompt completo |
| --- | --- | --- |
| Anna | [avatar-anna.webp](assets/images/avatar-anna.webp) | [avatar-anna.prompt.txt](assets/images/avatar-anna.prompt.txt) |
| Marco | [avatar-marco.webp](assets/images/avatar-marco.webp) | [avatar-marco.prompt.txt](assets/images/avatar-marco.prompt.txt) |
| Elena | [avatar-elena.webp](assets/images/avatar-elena.webp) | [avatar-elena.prompt.txt](assets/images/avatar-elena.prompt.txt) |

Le illustrazioni condividono sfondo avorio, contorni bruni, forme morbide e colori Terra. Capelli, carnagioni e abbigliamento distinguono le persone alla dimensione effettiva. Ogni volto è riutilizzato per lo stesso autore anche nei messaggi.

Gli asset sono WebP lossless, opachi, di 1254 × 1254 px. La conversione conserva esattamente pixel e dimensioni dei PNG generati. Il componente nativo daisyUI `avatar > div > img` li mostra a 40 × 40 px, con ritaglio circolare; le dimensioni dichiarate riservano lo spazio prima del caricamento. Sono caricati localmente, con `loading="lazy"` e `decoding="async"`. Il nome HTML accanto all’immagine identifica la persona; l’immagine ha `alt=""` per evitare annunci duplicati.

Prompt e provenienza sono incorporati nei metadati EXIF dei WebP. [avatars.manifest.json](assets/images/avatars.manifest.json) registra generatore, carattere fittizio, dimensioni, peso e hash dei PNG originali. Una copia dei PNG con metadati è conservata in `output/avatar-source-png/`; gli originali prodotti dal generatore restano invariati.

Verifica completata su desktop (1440 × 1000), tablet (768 × 1024) e telefono (390 × 844): tutti e cinque gli utilizzi caricano il ritratto corretto, misurano 40 px e non provocano scorrimento orizzontale. Innaffiamento e incoraggiamento sono stati provati in un’origine locale di verifica e persistono dopo ricarica. I sei test automatici e la build passano.

[Anteprima della community](output/community-avatars.jpg).
