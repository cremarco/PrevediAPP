# Colorize · PREVEDIApp Terra

Verifica del 5 ottobre 2026. Intervento sul colore dell’app esistente, con daisyUI 5 e Heroicons; contenuti, flussi, salvataggio e valori primitivi del tema Terra conservati.

## Ruoli applicati

| Ruolo | Componente e trattamento |
| --- | --- |
| Azione principale | `btn-primary` nativo, verde pieno e testo chiaro |
| Destinazione corrente | `menu-active`, `bg-primary`, `text-primary-content`, `aria-current` |
| Scelta attiva | `btn-outline btn-primary btn-active`; `aria-pressed`, check o conteggio dove previsti |
| Messaggi personali | `chat-end` e `chat-bubble-primary`; intestazione “Tu” |
| Messaggi Pigna | `chat-start`, `bg-secondary/10`, testo principale; intestazione “Pigna” |
| Accompagnamento Pigna | Card native con `bg-accent/20` e illustrazione esistente |
| Foglie disponibili | `badge-accent` pieno, icona star e valore |
| Missione completata | `badge-success` pieno, “Completato oggi” e check |
| Campi | `input`, `select`, `radio`, `checkbox`: `border-secondary/75`; selettori spuntati primari |
| Avvisi | `alert-warning alert-soft text-warning-content`; icona e testo esplicito |

La mappa condivisa `wellnessPalette` associa Alimentazione a verde al 15%, Movimento a oro al 25% con icona Terra, Sonno a info al 15%, Benessere a Terra al 15%. Tessere, missioni, introduzioni e registrazioni del diario riusano la stessa mappa. Acqua condivide Alimentazione. Ogni categoria conserva nome e Heroicon; il colore non è l’unico identificatore.

Il bianco separa i contenuti operativi; il fondo carta e i personaggi restano quelli del prototipo. Nessuna nuova immagine è necessaria per questo intervento. Il tema supportato è chiaro.

## Contrasti misurati

Valori da `getComputedStyle` nel browser, con conversione OKLab → sRGB, composizione delle trasparenze sui fondi effettivi e luminanza relativa. Testo ordinario: riferimento 4,5:1; testo grande, icone e controlli: 3:1. I controlli disabilitati e il pulsante trasparente del backdrop modale sono esclusi dal confronto per contenuti abilitati.

| Coppia osservata | Rapporto |
| --- | ---: |
| Bianco / verde pieno, bolle personali e menu | 4,86:1 |
| Testo principale / bolla Pigna | 7,40:1 |
| `accent-content` / contatore oro pieno | 6,17:1 |
| `warning-content` / avviso soft del piatto | 15,59:1 |
| `success` / esito soft del piatto | 5,31:1 |
| Testo al 85% / descrizione delle proporzioni | 5,36:1 |
| Bordo `secondary/75` / campo bianco | 3,42:1 |
| Minimo tra le icone abilitate osservate | 3,12:1 |
| Outline di focus nativo del campo / bianco | 8,47:1 |

La descrizione iniziale delle statistiche del piatto ereditava il 60% nativo di `stat-desc`, con contrasto 2,95:1. Ora applica il medesimo 85% già usato per i testi di supporto del resto dell’app. Gli avvisi soft usano l’inchiostro scuro del tema invece dell’oro semanticamente destinato al fondo.

## Percezione e significato

Sono state applicate ai colori composti le matrici Machado a severità 1,0 per protanopia, deuteranopia e tritanomalia: sRGB linearizzato, matrice, clipping e ritorno sRGB. Matrici verificate nel [dataset ufficiale di Colour](https://github.com/colour-science/colour/blob/develop/colour/blindness/datasets/machado2010.py); metodo e limite della simulazione blu/giallo nella [documentazione ufficiale](https://colour.readthedocs.io/en/master/_modules/colour/blindness/machado2009.html). Tritanomalia è un’approssimazione, non una simulazione completa di tritanopia.

| Coppia | Protanopia | Deuteranopia | Tritanomalia |
| --- | ---: | ---: | ---: |
| Messaggio personale | 4,65:1 | 5,02:1 | 4,90:1 |
| Messaggio Pigna | 7,36:1 | 7,42:1 | 7,40:1 |
| Contatore foglie | 5,93:1 | 6,32:1 | 6,13:1 |
| Avviso piatto | 15,81:1 | 15,46:1 | 15,61:1 |
| Successo piatto | 5,08:1 | 5,48:1 | 5,35:1 |
| Descrizione proporzioni | 5,34:1 | 5,36:1 | 5,36:1 |

Le tinte delle categorie possono avvicinarsi nelle simulazioni. Nomi e icone distinguono comunque le aree. In scala di grigi, autori e lati della chat, check, quantità, testi di esito, radio e marker del dock conservano il significato. I rapporti simulati sono un controllo aggiuntivo della palette, non una certificazione dell’app.

## Verifica del percorso

- Primo controllo raggruppato: 17 viste a 1440 × 1000 e 390 × 844. Nessun overflow orizzontale o immagine mancante.
- Stati provati sull’origine QA locale separata: ingredienti selezionati, piatto sbilanciato e corretto, risposta quiz selezionata e verificata, dialogo con input/select, dispensa selezionata, chat inviata e risposta in preparazione, stati completati e incompleti del percorso.
- Un lotto di correzione: contrasto `stat-desc`, fondo della risposta in preparazione e coerenza dell’oro nelle card Pigna. Conferma sulla build ricaricata, senza ulteriori interventi UI.
- Nessun errore o warning console osservato nella sessione QA.
- `npm run check`: sintassi valida e 6 test superati. `npm run build`: riuscita.
- Passaggio finale Polish: native daisyUI, palette Terra, etichette accessibili, dimensioni touch e allineamenti conservati. Nessun backlog Critique corrente per `index.html`.

Le eccezioni già documentate per fondo Terra, transizioni native e contrasto del link di salto restano limitate a `index.html`. Questo intervento non aggiunge nuove esclusioni ai detector.

## Prove native

Screenshot del browser, con dati di prova locali sull’origine `127.0.0.1:4175`; viewport e provenienza incorporati nel commento JPEG. Le immagini conservano i pixel della cattura.

- [Pigna desktop](output/colorize-pigna-desktop.jpg)
- [Pigna mobile](output/colorize-pigna-mobile.jpg)
- [Percorso](output/colorize-percorso.jpg)

I pacchetti `output/PREVEDIApp-github-pages.zip` e `output/PREVEDIApp-sorgenti.zip` includono la versione aggiornata. `DESIGN.md` e `.impeccable/design.json` descrivono i nuovi ruoli e le anteprime native.
