# Dettagli animati del pino

Mode: Operate
Target: assets/js/ui/components.js

THESIS: Fronda e pigna accompagnano il percorso come piccoli dettagli di un giardino, senza occupare il posto delle attività.

WORLD: Terra esistente, font e componenti daisyUI originali. Nuovi raster botanici Imagegen a fondo trasparente; identità, palette, font e controlli conservati.

PLACEMENT: Fronda accanto alle azioni del titolo nelle pagine con azioni; nei titoli senza azioni compare da 480 px. Titolo e descrizione mantengono il proprio blocco. Pigna in flusso nel footer accanto alla firma quotidiana, su tutte le 55 varianti anche mobile. Nessun oggetto sovrapposto a testo, pulsanti o campi.

SIGNATURE: Fronda leggermente mossa da una brezza e pigna con un breve dondolio che torna alla posa naturale. Il footer persistente conserva la fase durante i render del contenuto.

MOTION: Due soggetti per pagina, limite di sicurezza di tre. WAAPI solo su transform, cicli di 9,8 e 8,7 s e rotazione massima di 1,7 gradi, senza dipendenze o loop JavaScript. Avvio dopo la prima osservazione nel viewport; pausa fuori vista, a scheda nascosta, con modal aperto o timer prioritario attivo. Riduzione del movimento e toggle portano alla figura statica. Contenuti sempre visibili senza movimento.

CONTROL: Toggle originale daisyUI «Pino animato» nel footer, preferenza visiva separata in `prevediapp.pine-motion.v1`, attiva per impostazione iniziale. Non dipende dal recupero del diario. Se la scrittura della preferenza fallisce, resta valida in sessione; il reset locale riuscito rimuove anche questa preferenza. Il backup del percorso non la include. Gli eventi cross-tab della chiave dedicata e con chiave nulla sincronizzano la scelta.

BUILD: Code-first, estensione precisa dentro il sistema stabilito. Alla domanda opzionale delicata/giocosa non è arrivata risposta: l’assunzione delicata è stata dichiarata durante il lavoro. Nessuna comp o concept tournament necessario.

FINISH: Due passaggi di self-QA completati: tutte le 55 varianti misurate a 320 e 1280 px per passaggio, con 220 misure complessive senza overflow, raster rotti o titoli errati. Catture rappresentative a 320, 390, 1280 e 1440 px, più footer e flussi. Detector eseguito una sola volta, senza finding primari; due advisory circoscritti alla formula del toggle nativo. Scansione di provenienza su 30 raster senza mancanze; formato e 123 test passati. Fresh reviewer: `ship`, nessun material fix. Fresh documenter: [PINE-MOTION.md](../../PINE-MOTION.md), README e MAINTENANCE aggiornati. PRODUCT.md, DESIGN.md e sidecar conservati esattamente; deriva preesistente del sidecar segnalata senza riparazione. Le prove non certificano tutta l’accessibilità, fluidità o prestazioni su hardware reale, né attestano un push o deployment.
