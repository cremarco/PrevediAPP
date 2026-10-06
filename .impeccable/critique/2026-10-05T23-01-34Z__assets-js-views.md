---
target: Tutte le pagine di PREVEDIApp
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:/Users/marco/Sites/PrevediAPP/assets/js/views"
timestamp: 2026-10-05T23-01-34Z
slug: assets-js-views
closed: true
---
Method: dual-agent (A: /root/critique_a_design · B: /root/critique_b_evidence)
Supporto indipendente: /root/critique_c_flows, revisione delle sorgenti e prova del recupero dati con storage in memoria.

# Critica completa di PREVEDIApp

## Specificità e impressione

L’identità è riconoscibile e costruita per PREVEDIApp: Terra, Literata/Nunito Sans, Pigna, Alberello e le nuove illustrazioni fanno parte del percorso. Il collegamento fra registrazioni, missioni, foglie e giardino funziona. La maggiore opportunità è avvicinare azione, contesto e feedback sul telefono, preservando questa identità.

Copertura: 20 viste, cioè 17 sezioni con i quattro quiz esaminati separatamente. A ha aperto tutte le varianti a 1440, 390 e 320 px e verificato stati iniziali, popolati e flussi chiave; B ha esaminato tutte le varianti indipendentemente, con misure DOM/AX e detector. Una prova in memoria ha confermato il comportamento dei dati illeggibili. Sono stati usati soltanto dati sintetici su origini QA separate. Interfaccia e codice dell’app non sono stati modificati.

## Design Health Score

25/40 — Accettabile, con miglioramenti operativi importanti. Scala 0–4: tutte le dieci euristiche sono applicabili all’app Operate. La lettura Informazioni è valutata nel suo ruolo di aiuto. È una valutazione euristica, non uno studio con utenti.

| # | Euristica | Score | Evidenza principale |
|---|---|---:|---|
| 1 | Visibilità dello stato | 3 | Conferme, timer e missioni chiari; avanzamento quiz poco orientato. |
| 2 | Corrispondenza col mondo reale | 3 | Linguaggio quotidiano; classificazione dei cibi richiesta senza categorie vicine. |
| 3 | Controllo e libertà | 3 | Annulla, modifica e undo efficaci; quiz interrotto ricomincia. |
| 4 | Coerenza e standard | 3 | Sistema Terra/daisyUI coeso; wizard e quiz gestiscono diversamente focus e scroll. |
| 5 | Prevenzione degli errori | 2 | Buoni vincoli e conferme; risposta gestazionale già impostata. |
| 6 | Riconoscimento invece di memoria | 2 | Scelte del piatto lontane dal modello; temi di Pigna dopo la scrittura su mobile. |
| 7 | Flessibilità ed efficienza | 2 | Filtri, copie e suggerimenti utili; scroll e ripartenze aggiungono lavoro. |
| 8 | Estetica e minimalismo | 3 | Aspetto calmo e leggibile; intro e dati di riferimento talvolta precedono troppo l’azione. |
| 9 | Recupero dagli errori | 2 | Undo e importazione ben gestiti; recupero della copia locale illeggibile inaffidabile. |
| 10 | Aiuto e documentazione | 2 | Fonti e limiti presenti; aiuto operativo spesso distante dalla decisione. |
| Totale | | 25/40 | Accettabile |

A ha assegnato 26/40. La conferma della sovrascrittura del dato illeggibile porta Recupero dagli errori da 3 a 2 nella sintesi.

## Cosa funziona

- Crescita comprensibile: quattro missioni e un quiz danno 100 foglie; il nido da 60 lascia 40 disponibili e mantiene il livello 2. Il giardino distingue saldo, raccolta e crescita.
- Registrazione e correzione: dialoghi utilizzabili anche a 320 px, modifica, note, rimozione e annullamento verificati. Reset/importazione offrono riepilogo e uscita.
- Tono e fiducia: errori quiz spiegati senza biasimo, respirazione interrompibile, community esplicitamente dimostrativa e risultati del test contestualizzati. Il vincolo di prototipo locale è espresso.

## Cinque priorità

### 1. [P1] Proteggere il dato locale illeggibile prima di permettere nuove scritture

La prova con una Map contenente JSON corrotto conferma: il caricamento conserva il raw ma mostra un percorso vuoto; l’esportazione prende quello stato vuoto; il successivo save sostituisce il raw e cancella l’avviso. Nessun dato reale è stato usato. Non è stata osservata una scrittura automatica all’avvio.

L’avviso invita a esportare, ma quell’esportazione non conserva il valore originale ancora recuperabile. Occorre separare errore di accesso e dato illeggibile, conservare una copia del raw e richiedere una scelta esplicita di ripristino o nuovo percorso prima di sovrascriverlo.

Comando suggerito: $impeccable harden.
Fonte: assets/js/store.js:12, assets/js/store.js:28.
Prova: .impeccable/review/full-critique/C/corrupt-storage-observations.json.

### 2. [P1] Richiedere una risposta esplicita nel passo gestazionale

Dopo la scelta Donna, “No / non applicabile” è già selezionato prima della risposta. initialRiskAnswers inizializza gestational a "no"; required è quindi soddisfatto. Si può continuare senza dichiarare quell’informazione.

Inizializzare il quesito presentato senza risposta e conservare l’assegnazione non applicabile soltanto nel ramo saltato. Controllare anche il cambio di ramo con Indietro. Il punteggio e i contenuti clinici non richiedono cambi per correggere l’inserimento.

Comando suggerito: $impeccable harden.
Fonti: assets/js/session.js:65, assets/js/views/learning.js:57.
Prova visiva: .impeccable/review/full-critique/A/mobile320-risk-gestational.jpg.

### 3. [P1] Dare una destinazione al focus dopo i cambi di stato

A e B riproducono il quiz: dopo Prossima domanda, activeElement diventa BODY. La domanda e il contatore possono restare sopra il viewport. B conferma lo stesso esito alla quarta porzione: il pulsante ingrediente diventa disabilitato e non viene scelto il successivo comando Verifica.

Portare il focus alla nuova domanda/esito e, dopo quattro porzioni, a Verifica il piatto. Nel quiz mantenere la sessione incompleta per categoria, oppure spiegare e offrire Riprendi/Ricomincia: uscita e Indietro ricominciano dalla prima domanda.

Comando suggerito: $impeccable harden.
Fonti: assets/js/controller.js:583, assets/js/controller.js:601.
Prove: B/quiz-next-transition.json e B/plate-fourth-transition.json.

### 4. [P1] Mettere il gesto principale prima del lungo contenuto introduttivo su mobile

A 320×740, Broccoli inizia a y=1319,8 px e Inizia la pausa a y=1048,8 px. I controlli esistono, ma richiedono ricerca prima di agire. Il banner iniziale di personalizzazione restringe eccessivamente il testo.

Nel piatto portare avanti la selezione, mostrare un breve riepilogo di porzioni e raggruppare i nove ingredienti in Verdure, Carboidrati, Proteine, come già suggeriscono le etichette del frigo. Nella respirazione rendere avvio/durata raggiungibili prima della guida estesa. Compattare il banner, mantenendo missioni prima di Alberello.

B conferma inoltre un caso P2 dello stesso fronte responsive: un nome valido di 40 caratteri senza spazi porta il Percorso a 1208 px di larghezza in un viewport di 390. Il saluto deve spezzare token lunghi.

Comandi suggeriti: $impeccable adapt e $impeccable layout; $impeccable clarify per categorie e riepilogo.
Prove: A/mobile320-piatto.jpg, A/mobile320-stress.jpg, B/long-name-evidence.json.

### 5. [P2] Chiarire il contratto guidato di Pigna nel punto di scrittura

“Risposte guidate” è già nell’intestazione. Su mobile i quattro temi e la spiegazione operativa sono però dopo il composer. La richiesta sintetica “un’idea per cena?” riceve il fallback generico, perché cena non è fra i frammenti riconosciuti.

Nel benvenuto esplicitare i quattro temi predefiniti; metterli vicino al composer tramite un disclosure nativo. Per richieste non riconosciute offrire direttamente le azioni dei temi. Questo migliora il prototipo guidato mantenendo il suo funzionamento locale.

Comando suggerito: $impeccable clarify.
Fonte: assets/js/views/assistant.js:24.
Prova: A/mobile320-chat-guidance-end.jpg.

## Tutte le pagine

| Vista | Valutazione sintetica |
|---|---|
| Percorso | Missioni/crescita collegate; banner stretto a 320 px e saluto con token lunghi da correggere. |
| Giardino | Saldo, livello e ricompense chiari; nessun blocco autonomo osservato. |
| Diario | Modifica e undo funzionano; messaggio del vuoto troppo generico per filtro/giorno senza risultati. |
| Progressi | Dati e assenze distinti; lista dei 30 giorni lunga, limiti dello storico non dichiarati. |
| Alimentazione | Aggiunta e acqua chiare; vuoto di oggi e primo utilizzo condividono il messaggio. |
| Attività fisica | Obiettivo personale e minuti chiari; stesso problema del vuoto contestuale. |
| Sonno | Ore/qualità e correzione coerenti; “Notti raccontate” conta registrazioni, non date uniche. |
| Stress e benessere | Movimento, pausa e ripresa verificati; avvio distante su telefono. |
| Crea il piatto | Composizione e salvataggio funzionano; ordine mobile, categorie e focus della quarta scelta da migliorare. |
| Frigo della salute | Gruppi e ingredienti mancanti spiegati; nove scelte nello stesso elenco da organizzare meglio. |
| Community | Demo e salvataggio locale chiari; metadati e azioni dei post molto frammentati a 320 px. |
| Parla con Pigna | Composer utilizzabile; temi, fallback e limiti di conservazione da chiarire. |
| Profilo | Campi, export e conferme ben impostati; recupero della copia illeggibile è la priorità globale. |
| Notifiche | Promemoria derivati dalle attività e link utili; nessun blocco autonomo osservato. |
| Informazioni e fonti | Contenuto trasparente letto fino alla fine; paragrafi lunghi e limiti dello storico da completare. |
| Test del rischio | Tutti i passi e le due fasce verificati; default gestazionale e salto del contatore da correggere. |
| Quiz alimentazione | Feedback educativo buono; focus, ripresa e orientamento fra passi da correggere. |
| Quiz attività fisica | Stessa implementazione del quiz; medesime criticità di transizione. |
| Quiz sonno | Contenuti e opzioni coerenti; medesime criticità di transizione. |
| Quiz stress | Correzione non punitiva; perdita di avanzamento dopo uscita/Indietro verificata. |

## Carico cognitivo e viaggio emotivo

Cinque degli otto criteri falliscono in snodi specifici: raggruppamento in blocchi piccoli, priorità del gesto, numero di scelte, memoria del contesto e disclosure progressivo. Il carico è alto nel piatto e nelle transizioni; non è una descrizione di tutta l’app. Sono buoni focus singolo, raggruppamento delle aree e decisioni sequenziali.

Decisioni da snellire: 9 ingredienti nel piatto, 9 nel frigo, 5 aggiunte simultanee nel diario. Sidebar 4/4/2 e dock a cinque destinazioni sono strutture esplicite del brief, non errori per il solo conteggio.

L’ingresso è rassicurante; la valle emotiva arriva quando si deve cercare l’azione o si perde orientamento. Il picco è la conferma della registrazione con crescita reale del giardino. Alla fine del quiz, il tono incoraggiante funziona, ma la posizione va ristabilita.

## Persona red flags

- Jordan, prima esperienza: deve classificare i cibi senza categorie e può interpretare il default negativo come risposta neutra; scrive a Pigna prima di vedere i temi affidabili.
- Sam, tastiera: focus a BODY dopo il quiz e la quarta porzione; i target frequenti da 40 px sono migliorabili per comodità. Nomi/focus/AX verificati, screen reader reale non provato.
- Casey, telefono interrotto: azioni sotto il contenuto introduttivo e quiz che ricomincia; layout lungo prima del gesto.

## Osservazioni minori

- Cronologia chat limitata a 40 messaggi e quiz a 200 tentativi senza spiegazione. Il miglior risultato deriva dai record rimasti.
- Vuoto filtrato o giorno senza attività: “Il diario aspetta il tuo primo passo” è poco contestuale. Una voce spostata a un’altra data resta salvata ma richiede un feedback con destinazione.
- Sidebar desktop senza aria-current nelle sottoviste; conservare anche l’area di appartenenza selezionata.
- Target frequenti 40×40 px; Personalizza alto 32 px. Migliorarli a 44 px è ergonomia: le sole misure non dimostrano una violazione WCAG.
- “1 minuti di respirazione”, premio +20 foglie nei retry già premiati e Passo 2→4 meritano microcopy più preciso.
- Metadati dei post community e lunga lista di date nei progressi richiedono una forma più compatta.

## Confronto con il detector

Una sola scansione di index.html, assets/js/views e assets/js/ui: exit 0, zero finding primari, tre advisory su index.html (linea raw 0, non utile come riferimento sorgente):
- design-system-color: nero su html non confermato; browser misura html bianco e body Terra.
- design-system-radius: valore dei controlli circolari nativi daisyUI, previsto.
- repeating-stripes-gradient: CSS del progress indeterminato inattivo nelle viste osservate.

I segnali automatici non intercettano focus, recupero dati, default delle risposte o distanza dell’azione. Le misure native e la prova in memoria li confermano. Overlay non disponibile: evaluate CUA è read-only. Fallback utilizzato: CLI, AX, screenshot nativi e stili/geometrie letti. Quattro fullPage distorti sono stati esclusi e sostituiti.

## Domande per la prossima fase

1. Quale blocco vuoi affrontare per primo: protezione dati/test, continuità dei quiz oppure sequenza mobile e guida Pigna?
2. Quale ampiezza preferisci: solo i quattro P1, tutte e cinque le priorità oppure anche le osservazioni P2/P3?
