# Valutazione delle immagini

Verifica del 5 ottobre 2026. Riferimenti: Impeccable, modalità Operate; Imagegen, scelta degli asset raster. La valutazione iniziale precede le successive implementazioni documentate sotto.

## Esito

Nuove immagini sono consigliate soprattutto nel Giardino, dove possono rendere visibili gli esiti delle azioni. Non serve aggiungere un’illustrazione a ogni schermata.

Aggiornamento successivo: la verifica Heroicons ha rimosso i simboli estranei ai cibi, sostituendoli con icone di azione/selezione. Le miniature degli alimenti restano un miglioramento facoltativo; la descrizione sotto documenta lo stato osservato prima di questa correzione. Dettagli in `HEROICONS-AUDIT.md`.

Su richiesta successiva dell’utente, le iniziali di Anna, Marco ed Elena nella community sono state sostituite da tre avatar illustrati. Sono personaggi fittizi, coerenti con Terra e con la natura dimostrativa della community; non fotografie. I ritratti usano il componente Avatar nativo di daisyUI. Prompt, provenienza e controlli sono in `AVATARS.md`.

| Priorità | Superficie | Evidenza | Asset consigliato |
| --- | --- | --- | --- |
| Alta | Giardino: ricompense | Con “Nido” selezionato, il badge cambia ma l’immagine resta Alberello senza nido. Sottobosco e Stelle usano lo stesso meccanismo. | Scene coerenti con Alberello che mostrino davvero nido, sottobosco o notte stellata. |
| Media | Percorso e Giardino: crescita | Tutti i livelli caricano `alberello-original.png`; cambia soltanto il livello e la progress bar. | Stadi di crescita riconoscibili, coordinati con le decorazioni selezionate. Conservare il personaggio originale. |
| Media | Piatto e Frigo: ingredienti | I nove alimenti sono accompagnati da simboli generici: per esempio, Salmone ha un cuore e Tofu ha strati. Le etichette sono corrette, ma i simboli non aiutano a riconoscere il cibo. | Piccole illustrazioni dei nove alimenti, condivise tra le due schermate e inserite nello spazio già occupato dal simbolo. |
| Facoltativa | Risultato del quiz | La conclusione usa un trofeo Heroicons e un messaggio testuale già chiaro. | Una posa celebrativa di Pigna solo se serve un maggiore riconoscimento emotivo. |

## Schermate che non richiedono nuovi asset

- **Domande del quiz:** mantenere domanda, risposte e feedback centrali. L’immagine di un piatto 50/25/25 anticiperebbe la risposta della prima domanda.
- **Respirazione:** il cerchio animato comunica già il ritmo. Un paesaggio o una seconda animazione competerebbe con questo riferimento.
- **Diario, progressi, profilo e test del rischio:** dati, controlli e testi sono il contenuto utile. Le immagini decorative non migliorano l’azione principale.
- **Community:** usare i tre avatar illustrati dimostrativi descritti in `AVATARS.md`; fotografie di persone generate aggiungerebbero una falsa impressione di utenti reali.
- **Introduzioni ad alimentazione, attività e sonno:** mantenere compatte le card. Su mobile nuovi banner sposterebbero più in basso le azioni.

## Vincoli per una futura generazione

1. Usare Alberello e Pigna esistenti come riferimenti di identità: illustrazione 2D, contorni bruni, forme morbide, espressioni amichevoli. Conservare il tema Terra dell’interfaccia.
2. Usare Imagegen per illustrazioni raster; continuare a usare Heroicons per navigazione, azioni e stati.
3. Inserire le immagini nelle parti ufficiali dei componenti daisyUI già presenti, senza introdurre componenti personalizzati.
4. Generare file nuovi, senza sovrascrivere gli originali. Conservare prompt e provenienza e salvare gli asset nel progetto.
5. Non incorporare testi, punteggi o percentuali nelle immagini: restano HTML accessibile e aggiornabile.
6. Le scene del Giardino devono mostrare lo stato effettivamente selezionato, anche quando cambia il livello. Una decorazione non deve far apparire un livello diverso.
7. Le miniature del cibo devono restare distinguibili alla dimensione effettiva dei pulsanti, con etichette sempre visibili. Evitare una grande immagine aggiuntiva del piatto: nella vista mobile le statistiche occupano già gran parte del primo viewport.
8. Verificare peso dei file, trasparenza quando necessaria, leggibilità su telefono e assenza di spostamenti dei controlli al caricamento.

## Verifica svolta

Ispezionati i due asset originali e i renderer delle schermate. Esaminate dal vivo Giardino, quiz Alimentazione, Crea il piatto, Stress e Alimentazione; controllati anche quiz e piatto a 390 × 844. Nessun dato locale è stato modificato. Browser ripristinato e scheda di verifica chiusa.

## Completamento delle ricompense

La priorità alta del Giardino è stata implementata: Nido, Sottobosco e Stelle hanno tre scene distinte derivate dall’Alberello originale con il generatore integrato Imagegen. Scegliere una ricompensa posseduta cambia davvero l’illustrazione nel Giardino e nel Percorso. Le scene non fingono stadi di crescita: il livello resta un dato HTML. Non servono altre immagini decorative nelle schermate operative. Asset e prompt: [GARDEN-ASSETS.md](GARDEN-ASSETS.md).
