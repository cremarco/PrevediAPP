# Verifica del layout

Intervento del 5 ottobre 2026 con Impeccable, modalità Operate: struttura, spazi e adattamento, mantenendo Terra, contenuti e componenti daisyUI nativi.

## Cambiamenti

- Navbar, contenuto e footer hanno lo stesso limite di larghezza e gli stessi gutter. Il main cresce in una shell flex; il footer non dipende più da una sottrazione fissa dell’altezza del viewport.
- Le griglie principali usano il container del main: diventano affiancate con almeno 896 px effettivamente disponibili. La sidebar non sottrae spazio a colonne attivate soltanto in base alla larghezza della finestra.
- Le tessere delle abitudini diventano singole sotto 360 px, con padding più compatto sugli schermi stretti. Testi e controlli conservano spazio utilizzabile.
- La chat allinea il titolo alla conversazione, contiene un registro scorrevole e mantiene il form immediatamente dopo i messaggi. Suggerimenti e informazioni sono laterali su desktop e successivi su telefono. Restano componenti `card`, `chat`, `fieldset`, `input`, `btn` e `avatar` reali.
- Il registro segue l’ultimo messaggio anche quando cambia dimensione, senza spostare chi sta leggendo la cronologia. È raggiungibile da tastiera.
- Footer e toast considerano la safe area del dock. I paragrafi dei post community sono vincolati alla colonna del testo.

## Evidenza

La scrittura su telefono 390 × 844 prima iniziava a 1015 px, dopo iniziava a 692 px e terminava a 736 px, sopra il dock che inizia a 780 px. Il pulsante di invio misura 44 px. Su desktop 1440 × 1000 la chat e la guida occupano colonne di 784 e 288 px.

Provate tutte le 17 schermate a 1440 × 1000 e 390 × 844: nessuno scorrimento orizzontale. Controlli aggiuntivi per chat a 768 × 1024, 320 × 568 e 2723 × 1210, oltre a percorso, community e alimentazione a 320 px. Gli schermi molto bassi usano lo scorrimento verticale normale della pagina. Invio da campo, suggerimento, caricamento, risposta e persistenza dopo ricarica funzionano. Sei test automatici e build passano.

La lettura segue titolo, conversazione e scrittura; la guida sostiene questo percorso. Titoli, bolle, controlli e superfici mantengono le gerarchie e il ritmo Terra. Le card non si annidano e non introducono ombre o componenti CSS sostitutivi.

## Contrasto e controllo automatico

Il marchio mobile verde su avorio ha contrasto 4.416:1; ora usa 20 px bold, per cui supera la soglia 3:1 del testo grande. Il detector attribuiva erroneamente al link “Vai al contenuto” lo sfondo avorio della pagina: il componente `btn-neutral` ha invece testo bianco sul neutro, con contrasto 8.468:1. Questo falso positivo è stato isolato con copie temporanee e l’unica esclusione disponibile è limitata alla regola `low-contrast` in `index.html`, documentata in `.impeccable/config.json`. Nessuna esclusione globale e nessun problema lasciato senza verifica.

Il controllo finale ha segnalato anche `cream-palette` e `layout-transition`, con attribuzione sconosciuta. L’avorio `#f5f4ef` è un token Terra del prototipo, conservato per istruzione dell’utente. Le dichiarazioni di transizione della larghezza provengono dal CSS nativo daisyUI: la sidebar dell’app mantiene 256 px e si apre tramite traslazione; l’indicatore del dock è un piccolo pseudo-elemento posizionato fuori dal flusso. Il componente Filter incluso nel CSS non viene usato dall’app. Il codice dell’app non introduce animazioni di larghezza, altezza, margini o padding. Queste due eccezioni sono registrate soltanto per `index.html`; non sono state modificate palette o animazioni native, né ampliato l’intervento.

## Anteprime

- [Desktop](output/layout-pigna-desktop.jpg)
- [Telefono](output/layout-pigna-mobile.jpg)
