# Completamento del prototipo

Estensione del 5 ottobre 2026: mantiene la struttura del prototipo, il tema Terra, Heroicons e componenti daisyUI 5 nativi. Tutti i dati personali restano nel browser.

| Area | Comportamento completato |
| --- | --- |
| Diario | Aggiunta delle cinque attività, modifica e note, scelta del giorno, giorno precedente/successivo, filtri, rimozione annullabile per 12 secondi, CSV |
| Profilo | Obiettivi e copia JSON; ripristino entro 2 MB, validazione prima di scrivere, riepilogo, esportazione preventiva e conferma |
| Progressi | Movimento, sonno, acqua e pause su 7/30 giorni; quantità effettive, giorni registrati e storico dei quattro quiz |
| Dispensa e piatto | Ingredienti salvati; gruppi mancanti espliciti; composizione dalla dispensa, verifica delle proporzioni e registrazione del pasto scelto |
| Giardino | Ricompense acquistate con foglie virtuali, illustrazioni distinte e selezione persistente; quattro tappe ricavate dai dati |
| Community | Avatar coerenti, gruppi e incoraggiamenti dimostrativi; messaggi personali locali, modifica, rimozione e annullamento |
| Notifiche | Missioni ancora da completare, ricompense raggiungibili e lettura legata al giorno corrente |
| Pigna | Risposte guidate locali e cancellazione della conversazione confermata; operazioni pendenti annullate |

Le modifiche o l’annullamento di una rimozione non assegnano nuove foglie. Spostare una registrazione aggiorna diario e report, conservando i premi già ottenuti. Le tappe non sono valutazioni della salute. Il sonno usa l’ultima registrazione di ciascun giorno; la media considera soltanto le notti registrate.

## Verifiche

- Formattazione e sintassi superate; 40 test automatici su dominio, timer, storage, routing, rendering, report, ripristino ed esportazione.
- Provati dal browser importazione non valida, anteprima annullata, ripristino confermato e persistenza dopo ricarica.
- Provati modifica del movimento con note, rimozione/annullamento, acqua nel giorno precedente, messaggi locali modificati e annullati, tre ricompense, dispensa→piatto→Cena, quiz e report a 30 giorni.
- Nessun aumento indebito delle foglie durante modifica, annullamento o ripetizione del quiz nello stesso giorno.
- 17 route controllate a 1440 × 1000, 1280 × 1000 e 390 × 844, senza overflow orizzontale o errori console osservati. Gli avatar caricati durante lo scorrimento sono stati verificati prima delle catture.

Le prove usano un’origine QA separata, con dati fittizi denominati “Prova completamento”, senza scrivere nei salvataggi dell’utente. Evidenze locali in `.impeccable/review/completion/`. Le catture native del Giardino sono disponibili nel pacchetto locale `output/`.

## Limiti espliciti

Non ci sono account, sincronizzazione, notifiche push o backend. Community e Pigna sono dimostrative: i messaggi non vengono inviati a persone o modelli AI. Il timer richiede la pagina aperta. Il test CDC resta educativo e non diagnostico; le sue risposte non sono persistenti. LocalStorage è specifico del browser e dell’origine: per trasferire il percorso dall’anteprima locale al sito pubblico, esportare e ripristinare una copia JSON.

Le tappe e le foglie misurano le attività registrate, senza simulare risultati clinici. Il salvataggio compatibile resta versione 1; una copia contiene solo campi del prodotto noti al validatore.
