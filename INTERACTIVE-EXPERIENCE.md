# Pratiche, compilazioni e azioni complete

L’estensione del 6 ottobre 2026 accompagna le attività dalla scelta all’esito, conserva le compilazioni durante la navigazione e rende più chiari registrazione, recupero e prossima azione. Mantiene 41 route nominali e 55 varianti indirizzabili: le 79 schermate della fonte Stitch restano rappresentate nelle 37 famiglie funzionali documentate in [STITCH-COVERAGE.md](STITCH-COVERAGE.md).

## Pratiche e conclusioni

| Area | Comportamento attuale | Cosa viene conservato |
| --- | --- | --- |
| Risveglio muscolare | Scelta, preparazione, gesto corrente, Fatto/Salta, pausa, ritorno, riepilogo e conclusione. È possibile partire dal riepilogo per una routine già svolta. | Il diario registra soltanto i gesti indicati come svolti e i minuti effettivi inseriti dalla persona, interi da 1 a 180. La pratica incompleta resta nella scheda. |
| Routine serale | Stesso percorso manuale, con riepilogo dei gesti fatti e saltati. | Le preferenze dei gesti e del promemoria sono salvate; concludere la pratica non crea ore di sonno né foglie. La registrazione del riposo rimane un’azione distinta. |
| Pause scritte | Preparazione, spunto collegato al tempo effettivamente trascorso, pausa/ripresa e conclusione visibile. Durate di 10, 15 e 5 minuti. | La registrazione completata entra nel diario; l’esito e il collegamento al giorno restano nella sessione. Gli spunti sono scritti, senza audio. |
| Respirazione | Fase, quattro tempi e progresso già presenti; esito visibile e comando esplicito per una nuova pausa. | Posa conservata in pausa, fallback statico e registrazione del tempo completato. L’esito distingue salvataggio, sola sessione e file protetto. |

Le transizioni manuali sono in [guided-flow.js](assets/js/guided-flow.js); [practice-runtime.js](assets/js/practice-runtime.js) coordina le azioni senza possedere DOM o storage. Il controller sospende le altre pratiche benessere quando ne avvia o riprende una: non avanzano contemporaneamente respirazione, sessioni guidate e pratica manuale. Un riepilogo permette di ritrovare la pausa attiva o sospesa. La decorazione del pino si ferma anche durante la pratica manuale attiva.

L’esito di una pausa o routine conserva un collegamento alla registrazione effettiva. Se la voce viene rimossa dal diario, l’esito indica la rimozione e toglie il collegamento; annullarla lo rende nuovamente disponibile. L’esito di una pausa terminata con salvataggio protetto non dichiara una registrazione avvenuta: il recupero del percorso precede ogni successivo inserimento.

## Compilazioni, salvataggi e annullamento

[form-drafts.js](assets/js/form-drafts.js) conserva in memoria soltanto i campi modificati di profilo, chat, diario, glucosio, community e campi corporei del questionario educativo. Ripristina il contesto dopo render e navigazione nella stessa scheda, compresi focus e selezione del testo dove supportati. Le bozze nuove e quelle di modifica hanno ambiti separati per modulo, data, contesto o identificativo; riaprire una voce non sovrascrive la bozza di un nuovo inserimento. Il diario offre lo scarto esplicito della bozza.

Le bozze, le checklist delle ricette, le pratiche incomplete e gli esiti di sessione non entrano nel backup e si interrompono alla ricarica. Reset e ripristino riusciti puliscono lo stato transitorio. Percorso, preferenze e registrazioni continuano a usare `prevediapp.v1`, schema v1: i salvataggi precedenti restano compatibili e gli originali illeggibili restano protetti. La preferenza del pino mantiene la propria chiave separata.

Gli errori sono associati al campo, portano il focus al controllo utile e si cancellano quando il valore viene corretto. Le conferme distinguono scrittura riuscita, modifica disponibile solo nella sessione e operazione sospesa per protezione del salvataggio. Le conferme persistenti hanno chiusura esplicita e annuncio separato in `#app-status`; un nuovo feedback sostituisce quello precedente.

L’annullamento della rimozione resta disponibile finché la relativa conferma è visibile. Chiuderla o sostituirla con un nuovo feedback termina questa possibilità; un ripristino o una sincronizzazione del percorso invalida l’operazione precedente. Il reinserimento conserva identità e posizione della voce. Non c’è più una scadenza di dodici secondi.

## Alimentazione, storico e azioni successive

- **Piatto e dispensa:** quindici ingredienti compatibili alimentano picker e ripiani. I nove originali restano in `fridge`, gli altri in `pantryExtras`; `plateGroup` separa la posizione nel modello dalla categoria del catalogo. I ceci occupano il settore proteico del gioco e conservano la categoria Legumi. Il testo spiega che il modello riguarda lo spazio nel piatto, con nota e fonte ADA, senza rappresentare quantità di nutrienti. Verifica ed esito precedono la scelta di registrare il pasto.
- **Ricette:** ogni ricetta ha una checklist transitoria indipendente; preferite e ingredienti effettivi della dispensa sono visibili. Un’aggiunta già completata viene riconosciuta. Ingredienti, tempi e preparazioni restano esempi autoriali dell’adattamento.
- **Frigo Sano:** la modalità senza limite di tempo si sceglie prima di cominciare. Conserva cinque scelte, tre tentativi e l’esito educativo; non assegna premi o storico permanente. La modalità di trenta secondi rimane disponibile.
- **Glucosio:** il filtro offre 7 giorni, 30 giorni e tutte le misurazioni. Ogni voce conservata è raggiungibile, correggibile e rimovibile; il CSV segue il filtro. La capacità totale di 200 è visibile prima del salvataggio e non elimina automaticamente le voci precedenti. Il registro continua a usare inserimenti manuali, senza interpretazione clinica o collegamento a un sensore.
- **Pigna e community:** risposte autoriali locali riconoscono piatto, dispensa e ricette e propongono collegamenti diretti alle azioni. La community dichiara il limite di venti messaggi prima dell’invio e permette la modifica al limite; bozze nuove e modifiche restano separate. Messaggi, gruppi e giardino condiviso sono dimostrativi e locali.
- **Missioni, progressi e ricompense:** lo stato distingue foglie già raccolte e risultato corrente; i vuoti propongono un’azione utile per iniziare. La conferma dello sblocco nomina la ricompensa e il suo uso nel Giardino. Identificativi, costi e regole dei premi restano compatibili.

## Accessibilità e continuità di Terra

[accessibility.js](assets/js/accessibility.js) gestisce un annunciatore persistente e il drawer mobile: pulsante nativo, `aria-expanded`, pannello modale, sfondo `inert`, ciclo Tab/Maiusc+Tab, Escape e ritorno del focus. La soglia `64rem` coincide con CSS e Tailwind. Navigare, chiudere un dialogo e cambiare larghezza conservano una destinazione di focus visibile; il link iniziale porta al main. Le azioni ripetute includono nomi contestuali.

[src/styles.css](src/styles.css) mantiene la palette Terra e la gerarchia Literata/Nunito Sans. Estende i componenti originali daisyUI per target minimi di 44 px, campi con testo di 16 px, reflow e testo di supporto al 90%. Il focus neutro con separazione bianca rimane visibile sulle superfici chiare e sui controlli pieni. Le conferme hanno spazio riservato, altezza limitata e scorrimento interno; durante il menu mobile restano nascoste e inerti.

Movimento ridotto e colori forzati mantengono istruzioni e selezioni riconoscibili. Il movimento ridotto disattiva scorrimento animato e transizioni dei componenti nativi interessati, conserva indicatori statici e i fallback delle animazioni applicative. I timer non annunciano il countdown ogni secondo; fase respiratoria e cambio dello spunto hanno annunci propri.

Il confronto con [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), helper e viste conferma un’estensione del mondo Terra: palette, font, identità naturale, parti daisyUI e Heroicons restano quelli vigenti. DESIGN.md riallinea soltanto gli errori documentali introdotti sulle altezze avatar e i comportamenti cambiati di feedback e movimento ridotto. La deriva precedente di `.impeccable/design.json` resta segnalata senza riparazione; non si rigenera il sistema per questa estensione.

## Asset e provenienza

Sei alimenti e nove ricompense sono risultati originali del generatore integrato `image_gen.imagegen`, con master, prompt esatti e manifest conservati. La conversione WebP è meccanica e mantiene alpha reale; non sono stati generati altri asset durante la documentazione.

| Famiglia | Asset runtime | Provenienza |
| --- | --- | --- |
| Sei alimenti aggiuntivi | 512 × 512 px, 323.054 byte complessivi | [FOOD-ASSETS.md](FOOD-ASSETS.md), [prompt esatti](artwork/foods-v1/generation.json), [manifest](assets/images/foods-v1.manifest.json) |
| Nove ricompense v2 | 640 × 640 px, 653.912 byte complessivi | [REWARD-ASSETS.md](REWARD-ASSETS.md), [prompt esatti](artwork/rewards-v2/generation.json), [manifest](assets/images/rewards-v2.manifest.json) |

I nove alimenti originali riusano l’atlante. Nel catalogo Ricompense, nido, sottobosco e stelle mostrano il soggetto isolato; il Giardino conserva le rispettive scene complete di Alberello. Gli altri sei oggetti usano il nuovo asset anche nell’anteprima. La scansione di provenienza consegnata copre 45 raster senza mancanze.

## Manutenzione, prove e limiti

Per estendere i flussi, separa le transizioni pure dalle azioni del controller, conserva gli ambiti delle bozze e riusa i componenti nativi in [guided-widgets.js](assets/js/ui/guided-widgets.js). Un esito deve derivare dalla registrazione effettiva; non anticipare punti, minuti o salvataggio. Nuovi ingredienti devono mantenere distinti categoria del catalogo, settore del gioco e collezione persistente. Controlli e build seguono [MAINTENANCE.md](MAINTENANCE.md).

Il candidato integrato ha superato formato, 182 test e build; il JavaScript complessivo misurato prima della compilazione finale dei documenti è 280.966 byte non compressi. La matrice corrente misura le 55 varianti a 390 e 1280 px, più dodici varianti operative a 320 e 1440 px: 134 osservazioni senza overflow del documento, immagini rotte, `h1` errati o destinazioni desktop correnti duplicate. Le catture native del candidato integrato governano questa conclusione.

Le prove native correnti verificano tastiera del menu, Tab/Maiusc+Tab, Escape, navigazione e breakpoint; errore e salvataggio del profilo, chiusura della conferma e skip link; preparazione, pausa, Fatto/Salta, errore dei minuti ed esito del risveglio; gioco senza timer concluso con 5/5. I passaggi precedenti `first` e `confirm` restano evidenze storiche aggiuntive: pausa reale di un minuto, sessione scritta di cinque minuti, bozze, storico glucosio, ricette/dispensa, quiz, community, premio e annullamento di una voce completata.

Il controllo axe di supporto ha 110 osservazioni a 320/1440 px senza violazioni automatiche, con 97 osservazioni contenenti verifiche di contrasto incomplete su immagini o fondi. Un solo detector ha restituito `[]`. Questi risultati non certificano accessibilità completa, uso sistematico con screen reader, hardware mobile, fluidità reale o prestazioni; non producono un nuovo punteggio della critica.

La revisione integrata in `.impeccable/review/interactive-experience/finish-review.md` ha richiesto una sola correzione materiale documentale: la descrizione precedente del toast in DESIGN.md. Non identifica difetti UI nel perimetro campionato. Il verdetto `finish-verdict.md` la chiude come `resolved`, con disposizione `ship` limitata alla correzione valutata; non è una nuova revisione generale. La pubblicazione è verificata separatamente in GitHub Actions. Rapporti, metriche e catture locali in `.impeccable/review/interactive-experience/` e `.impeccable/review/accessibility/` restano esclusi dalla distribuzione. Questo documento non attesta un push o un deployment dell’estensione.
