# Widget delle azioni · PREVEDIApp
Mode: Operate
Target: assets/js/views/nutrition.js

THESIS: La scelta dell’utente diventa un oggetto nel posto in cui serve: una porzione del piatto, un ripiano della dispensa o una fase del respiro.
OWN-WORLD: Terra già confermata, Literata/Nunito Sans, componenti daisyUI 5 nativi e Heroicons outline. Nessun nuovo tema, font o sistema di controlli. L’atlante botanico rende riconoscibili i nove alimenti; il frigo è un raster originale Stitch.
FIRST VIEWPORT: Piatto a quattro settori attivi con scelta ingredienti affiancata sul desktop, in sequenza guidata su telefono. Dispensa a sinistra e mercato a destra sul desktop; su telefono il mercato permette subito la scelta. Respirazione: tempo/durata/comandi prima della fase e di Pigna. Frigo Sano: domanda e scelte prima dei ripiani su telefono.
SIGNATURE: Gli ingredienti selezionati passano al proprio spazio attraverso una breve traslazione/scala; il cerchio di Pigna apre e raccoglie il respiro in quattro più quattro secondi. La pausa conserva il punto esatto.
MOTION: Uno spostamento contestuale di 380 ms e conferma di 230 ms per azione, nessun ingresso animato delle pagine e nessuna dipendenza. Il contenuto è già visibile e utilizzabile; l’animazione non ritarda la mutazione o il focus. Il respiro mantiene una sola Web Animation di 8 s. Movimento ridotto, pagina nascosta e destinazione fuori vista evitano il movimento; un nuovo render o uno scroll, anche causato dal focus, annulla i voli precedenti. Il feedback resta testuale e cromatico.
STATE: Piatto denso di quattro elementi, duplicati e proporzioni errate ammessi per il gioco educativo; verifica esplicita prima del diario. Frigo usa i salvataggi esistenti e conserva gli extra. Filtro piatto transitorio. Frigo Sano conserva cinque scelte, tre tentativi e trenta secondi, senza punti aggiuntivi. Nessuna interpretazione clinica.
BUILD: Code-first, estensione dei widget stabiliti; nessuna nuova identità o comp approvata. Preferenza richiesta con domanda asincrona; in assenza di risposta si procede con guida calma e azioni native.
FINISH: Due passaggi di QA su 320/390/1440 px e viewport reale 1280×720, prova dei flussi, detector meccanico una sola volta, reviewer fresco e documenter dopo le correzioni. Documentare prompt, origine e master di ogni raster nuovo.
