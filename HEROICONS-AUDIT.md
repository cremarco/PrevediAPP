# Verifica delle icone Heroicons

Verifica e correzioni del 5 ottobre 2026, limitate alle icone e alle loro dimensioni. Restano tema Terra, componenti daisyUI, testi, dati e flussi esistenti.

## Correzioni applicate

| Uso | Prima | Ora | Motivo |
| --- | --- | --- | --- |
| Ingredienti in Crea il piatto | Simboli che fingevano di rappresentare cibi: cuore per salmone, borsa per pomodori, cubo per cereali | `plus`, nome dell’alimento e conteggio delle porzioni | L’icona comunica l’azione di aggiungere, anche quando si sceglie lo stesso alimento più volte. |
| Ingredienti nel Frigo | Simbolo generico a sinistra e azione a destra | Nome e categoria, con `plus` / `check` a destra | Selezione chiara, senza un simbolo decorativo estraneo al cibo. |
| Invio a Pigna | `arrow-right` | `paper-airplane` | Convenzione riconoscibile per inviare un messaggio; resta il nome accessibile “Invia messaggio”. |
| Test educativo | `shield-check` | `clipboard-document-check` | Comunica un questionario senza il significato di protezione dello scudo. |
| Livello di Alberello | `sun` | `arrow-trending-up` | Il badge indica crescita e avanzamento. |
| Foglie disponibili / premio quiz | `sparkles` | `star` | Simbolo convenzionale dei punti; l’unità “foglie” resta scritta. |
| Stress e benessere | `cloud` | `face-smile` | Riferimento al benessere della persona; uso coerente fra navigazione, missioni, diario e respirazione. |
| Ricompensa Nido | `building-office-2` | `home` | Rappresenta il rifugio descritto dal testo della ricompensa. |
| Incoraggiamento nel giardino condiviso | `beaker` | `hand-thumb-up` | Rende riconoscibile il gesto simbolico di incoraggiamento. |
| Diario vuoto | `sun` | `clipboard-document-list` | Rimanda alle registrazioni che compariranno dopo la prima attività. |

## Scelte mantenute e limiti

- `home` per Percorso, `calendar-days` per Diario, `chart-bar` per Progressi, `user-group` per Community e `chat-bubble-left-right` per Pigna.
- `moon` per Sonno; `bolt` per l’energia del movimento; `chart-pie` per le proporzioni del metodo del piatto.
- `sun` per Giardino e simbolo del marchio; `archive-box` per la dispensa. Restano metafore accompagnate da etichette, non icone di un albero o di un frigorifero.
- `book-open` per apprendimento, `gift` per la ricompensa Sottobosco e `sparkles` per la notte stellata. Le illustrazioni del Giardino restano la sede adatta a rappresentare oggetti naturali specifici.
- Il catalogo Heroicons della versione adottata non contiene icone dedicate agli alimenti dell’app, a foglie, alberi, funghi o nidi. Non sono stati disegnati SVG personalizzati o introdotte altre famiglie di icone.

## Implementazione

Le 42 icone incorporate in `assets/icons.js` usano **nomi ufficiali** e tracciati originali della [versione Heroicons 2.1.5, 24 outline](https://github.com/tailwindlabs/heroicons/tree/v2.1.5/optimized/24/outline). Eliminati gli alias fuorvianti come `fish`, `apple`, `wheat`, `bird`, `sprout` e `utensils`.

ViewBox 24 × 24, stroke 1.5, cap e join arrotondati. Dimensioni: 20 px standard, 16 px per metadati, 32 px nel riferimento della respirazione. Il renderer applica una sola dimensione: la precedente classe predefinita da 20 px sovrascriveva la variante da 16 px.

Gli SVG decorativi hanno `aria-hidden="true"` e `focusable="false"`; i controlli conservano testo o nome accessibile. `data-heroicon` espone il nome ufficiale per ispezione e manutenzione. Un simbolo sconosciuto usa `question-mark-circle`, invece di diventare silenziosamente una scintilla. Nessuna dipendenza di rete a runtime; licenza MIT conservata.

## Verifica

- Controllate tutte le 17 viste a 1440 × 1000 e 390 × 844: nessun fallback inatteso, SVG non conforme o overflow orizzontale.
- Ispezionate schermate rappresentative e confermate le dimensioni 16/20/32 px dopo la correzione.
- Provati Frigo con `plus` → `check` e persistenza dopo ricarica; piatto con due porzioni di Broccoli, Riso integrale e Tofu; invio a Pigna e risposta guidata.
- Superati i sei test di dominio e i controlli di sintassi; build statica completata.
- Usato un dominio locale di prova separato dai dati dell’anteprima dell’utente.

Evidenze locali in `.impeccable/review/heroicons-audit.json` e nelle schermate `hero-*.jpg`; escluse dai pacchetti sorgenti.

## Estensione del prototipo

Aggiunti due SVG ufficiali 24 outline della stessa versione: `pencil-square` per correggere registrazioni e messaggi locali; `arrow-up-tray` per confermare il ripristino della copia. Rimozione e annullamento conservano `trash` e il testo accessibile. Non è stata introdotta una nuova famiglia di icone.
