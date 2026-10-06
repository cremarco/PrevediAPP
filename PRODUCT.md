# PREVEDIApp

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
HTML statico, CSS, JavaScript vanilla, Tailwind CSS 4 e daisyUI 5. Destinazione: GitHub Pages. Scelta esplicita dell’utente. Tutti i componenti UI devono essere componenti daisyUI reali, personalizzati con il tema Terra; Tailwind gestisce il layout. Vincolo esplicito aggiunto dall’utente durante la verifica della libreria.

## Users
Persone che esplorano un percorso di benessere e prevenzione del prediabete. Il contesto deriva dal prototipo Stitch, non da requisiti clinici certificati.

## Product Purpose
Trasformare il progetto Stitch “Percorso Benessere Prediabete” in un’app coerente e interattiva da usare nel browser.

## Operating Context
Diario giornaliero, guide e ricerca alimenti, ricette, dispensa e giochi, movimento, sonno, pause guidate scritte, quiz, Alberello che cresce, ricompense, community e registro manuale del glucosio. Fonte: https://stitch.withgoogle.com/projects/4965067135037654911.

## Capabilities and Constraints
L’utente conferma un prototipo interattivo con salvataggio locale. Nessun backend, autenticazione, connessione CGM o servizio AI reale. Il registro del glucosio conserva solo misurazioni manuali, parte vuoto e non interpreta i valori. Community e gruppi dimostrativi dichiarati; le sfide personali derivano dal diario, senza classifiche fra utenti. Le tre pause guidate hanno timer e spunti scritti, senza audio. Il promemoria serale compare nell’app, senza push/background. Le ricette sono esempi autoriali dell’adattamento. Non inventare diagnosi o interpretazioni cliniche. I dati personali restano nel browser; esportazione, ripristino e cancellazione disponibili. Timer, partite e tentativi incompleti sono transitori e si interrompono alla ricarica.

## Brand Commitments
Preservare Terra: verde #4A7C59, marrone #6B6358, oro #C4A66A, neutro #4A4E4A; Literata per titoli, Nunito Sans per testo. Preservare PREVEDIApp, Pigna e Alberello. L’utente ha scelto costruzione diretta dal prototipo e richiede Heroicons per le icone.

## Evidence on Hand
Schermate e tema Terra osservati nel progetto Stitch; export completo verificato il 6 ottobre 2026. Le 79 schermate HTML con anteprima rappresentano 37 famiglie funzionali, tutte collegate a route, stati o dialoghi dell’app. Le copie dell’onboarding, i frammenti del piatto e le varianti grafiche sono consolidate, come documenta STITCH-COVERAGE.md. La versione locale armonizza navigazioni non uniformi e contenuti italiani/inglesi in 41 route nominali e 55 varianti indirizzabili. Non sono disponibili dati di utenti reali o validazione medica.

## Product Principles
- Rendere ogni azione comprensibile e funzionante.
- Mostrare i progressi a partire dalle attività realmente registrate.
- Conservare l’identità naturale del prototipo.
- Rendere esplicita la differenza tra attività personali e contenuti dimostrativi.
