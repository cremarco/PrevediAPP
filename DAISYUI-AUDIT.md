# Verifica daisyUI · PREVEDIApp

Audit di conformità del 6 ottobre 2026 sulla versione locale, con **daisyUI 5.7.47**, 41 route nominali e 55 varianti indirizzabili. I controlli e i contenitori esaminati usano componenti originali, parti e stati ufficiali della libreria. La personalizzazione conserva Terra; le utility Tailwind gestiscono layout, dimensioni, spaziatura, tipografia e colori semantici. Le tre difformità di composizione individuate sono state corrette con classi ufficiali o utility responsive, senza CSS sostitutivo.

Piatto, dispensa, Frigo Sano e guida del respiro sono **composizioni applicative di componenti originali**. daisyUI non offre componenti chiamati `plate`, `fridge` o `breathing`: settori, ingredienti, regole del gioco e timer appartengono all’app. La conformità riguarda i primitivi impiegati, la loro struttura e i loro stati.

## Componenti e parti adottati

| Uso nell’app | Componenti daisyUI e parti effettive |
| --- | --- |
| Pannelli e destinazioni di benessere | `card`, `card-border`, `card-body`, `card-title`, `card-actions`, `card-side`, con `figure` dove prevista |
| Navigazione desktop e mobile espansa | `drawer`, `drawer-toggle`, `drawer-content`, `drawer-side`, `drawer-overlay`, `drawer-button`; `menu`, `menu-title`, `menu-active` |
| Intestazione | `navbar`, `navbar-start`, `navbar-end` |
| Navigazione inferiore | `dock`, `dock-label`, `dock-active` sui pulsanti diretti |
| Pulsanti e azioni | `btn`, varianti `btn-primary`, `btn-outline`, `btn-ghost`, `btn-soft`, stato `btn-active`, forme `btn-circle` e `btn-square` |
| Foglie, livello, missioni e stati | `badge`, `badge-soft`, `badge-primary`, `badge-accent`, `badge-success`, `badge-ghost` |
| Profilo, persone e ingredienti illustrati | `avatar > div > img`, oppure `avatar avatar-placeholder > div > span` |
| Diario, missioni, ricompense, gruppi e ripiani | `list`, `list-row`, `list-col-wrap`, `list-col-grow` |
| Conversazione con Pigna | `chat`, `chat-start`, `chat-end`, `chat-header`, `chat-bubble`; `loading loading-dots` durante la risposta |
| Riepiloghi numerici del percorso e delle categorie | `stats`, `stat`, `stat-title`, `stat-value`, `stat-desc` |
| Moduli, filtri e test educativo | `fieldset`, `fieldset-legend`, `label`, `input`, `textarea`, `select`, `file-input`, `radio`, `checkbox` |
| Registrazioni e conferme | `modal`, `modal-box`, `modal-backdrop`, `modal-action` su `dialog` HTML nativo |
| Avvisi ed esiti | `alert` con varianti semantiche e `alert-soft`; `toast` con un `alert` interno |
| Progressi, obiettivi e pausa | `progress` con `value` e `max`; `radial-progress` con variabili pubbliche e valore ARIA |
| Acqua, durate e filtri del piatto | `join`, `join-item`, `join-vertical`, `join-horizontal` |
| Piatto, proporzioni e dettagli espandibili | `mask mask-circle`; `details.collapse`, `summary.collapse-title`, `collapse-content` |
| Tappe del gioco e tempi del respiro | `steps`, `step`, `step-icon`, `step-primary` |
| Guida statica del respiro | Checkbox nativa `toggle toggle-primary toggle-sm` con label |
| Notifiche, separatori, fonti e fondo pagina | `indicator`, `indicator-item`, `divider`, `link`, `footer` |

Le varianti appartengono alle categorie ufficiali: per esempio `btn-outline` è uno stile e `btn-active` un comportamento, quindi possono coesistere. Selezione e disabilitazione usano `aria-pressed`, `checked` e `disabled` effettivi. Hover, pressione, bordi, pseudo-elementi e feedback di focus dei componenti provengono dalla libreria. La composizione e le utility seguono le [regole d’uso ufficiali](https://daisyui.com/docs/use/).

## Personalizzazione Terra e confronto con il sistema

Il confronto fra [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md), tema in [src/styles.css](src/styles.css), helper condivisi e renderer conferma la continuità del sistema: verde `#4A7C59`, terra `#6B6358`, oro `#C4A66A`, neutro `#4A4E4A`, superfici `base-*`, colori di esito e rispettivi `*-content`. Literata e Nunito Sans, raggi `selector`/`field` da 0,5 rem e `box` da 1 rem, bordo da 1 px e profondità/rumore a zero restano quelli esistenti. Heroicons outline e raster locali vengono riusati.

Terra è applicato con `data-theme="terra"` e definito attraverso il plugin ufficiale `daisyui/theme`, con l’intero insieme di variabili richiesto. Le tinte, ad esempio `bg-primary/10`, derivano dai colori semantici. Questo segue la [documentazione dei temi personalizzati](https://daisyui.com/docs/themes/).

`DESIGN.md` e `.impeccable/design.json` sono conservati. Questa verifica è una rifinitura dell’implementazione esistente: nessun nuovo tema, font, token, raster o dipendenza; la deriva preesistente del sidecar resta fuori dal perimetro.

## CSS e presentazione applicativa

[src/styles.css](src/styles.css) contiene import e plugin, tema, font, tipografia di base, selezione/caret/focus e riduzione del movimento. Non ridefinisce classi o parti dei componenti per replicare pulsanti, card, input, drawer, badge, liste o chat. Il CSS compilato comprende anche le regole originali daisyUI: la loro presenza non costituisce CSS custom dell’app.

La geometria circolare del piatto viene da `mask mask-circle`; quattro pulsanti reali e una griglia Tailwind compongono i settori. L’atlante negli avatar mantiene `avatar > div > img`, con ritaglio dell’immagine tramite utility. La scena del frigo è un’illustrazione applicativa dentro una card, mentre i ripiani sono righe `list`. Non vengono ricostruite le parti interne dei componenti.

Le Web Animations in `breathing.js` e `widget-motion.js` sono feedback di presentazione dell’app. Animano avatar o copie decorative `aria-hidden` e `inert`; stato, focus e timer restano gestiti dall’app senza attendere il feedback. Le animazioni non sostituiscono controlli, stati o pseudo-elementi daisyUI. Il ciclo del respiro e il volo degli ingredienti non sono comportamenti forniti dalla libreria; funzionamento e modalità statiche sono descritti in [WIDGETS.md](WIDGETS.md).

## Tre correzioni circoscritte

| Rilievo | Correzione applicata | Evidenza mirata |
| --- | --- | --- |
| I quattro filtri del piatto usavano `join` in una griglia 2 × 2, incompatibile con la giunzione lineare | `join join-vertical w-full sm:join-horizontal`, conservando `join-item`, nomi, azioni e `aria-pressed` | Il gruppo è `flex` in colonna a 390 px e in riga a 1440 px; la direzione orizzontale è confermata anche a 1280 px. La struttura segue [Join](https://daisyui.com/components/join/). |
| Il focus sul checkbox mobile invisibile del drawer non raggiungeva il label visibile | Aggiunta della parte `drawer-button` al trigger esistente | A 390 px il focus del checkbox trasferisce al label l’outline nativo `2px solid`. Il builder ha verificato apertura con Space, chiusura con Escape e ritorno del focus secondo il protocollo esistente. Su desktop il checkbox resta `display:none` per `lg:drawer-open`. Struttura e parte seguono [Drawer](https://daisyui.com/components/drawer/). |
| `list-col-wrap` manteneva l’azione dei gruppi sulla seconda riga anche da `sm` | Aggiunta di `sm:row-start-1` al contenitore dell’azione | A 320 px le quattro azioni restano sulla seconda riga; a 1280 e 1440 px sono nella terza colonna, prima riga. Il reset responsive conserva la parte originale [List](https://daisyui.com/components/list/). |

Non sono cambiati handler, regole del prodotto, persistenza, chiave/schema dei salvataggi, timer, punti, contenuti o route.

## Prove e limiti dell’audit corrente

Tre rapporti statici coprono widget, shell/helper e viste restanti. Il confronto usa guide ufficiali e sorgenti della versione installata, verificando parti, relazioni fra elementi e categorie dei modificatori. La revisione delle viste restanti ha prodotto **77 scenari HTML da funzioni pure**: sono prove di rendering e struttura, non 77 interazioni native nel browser.

La verifica fornita dopo i fix riporta formato, controlli, **113/113 test** e build passati. Il pacchetto QA corrente contiene **10 catture native** dei filtri del piatto, gruppi e drawer alle larghezze 320, 390, 1280 e 1440 px. `qa/metrics.json` contiene **sei record DOM**, tutti con `scrollWidth` uguale alla larghezza del viewport. I controlli di immagini rotte presenti nei record dei gruppi a 320 e 1440 px restituiscono zero; non viene esteso quel dato ai record che non lo misurano.

`qa/drawer-focus.json` registra il feedback di focus nativo; `qa/native-styles.json` conferma sfondo HTML bianco, body Terra `rgb(245, 244, 239)`, raggio circolare nativo e checkbox desktop nascosto. Il reviewer indipendente ha aperto singolarmente tutte le dieci JPG e confrontato sei misure, codice e CSS originali. Le azioni dei gruppi sotto la piega mobile sono verificate dal markup e dalle misure, senza attribuire alle catture di viewport una copertura del documento completo.

I rapporti `widgets-audit.md`, `shell-audit.md`, `remaining-audit.md`, `finish-review.md` e le prove `qa/` sono conservati localmente in `.impeccable/review/daisyui-2026-10/`, esclusi dalla distribuzione. La matrice da 16 osservazioni dell’estensione widget e quella da 170 catture Stitch descrivono le rispettive verifiche precedenti. Anche la verifica iniziale di 17 schermate e sei test è storica, non la copertura dell’audit corrente.

## Tre advisory del detector ed eccezioni

Un’unica esecuzione mirata del detector ha restituito tre advisory. Il confronto con CSS originale e DOM di produzione li conferma come falsi positivi o geometria nativa intenzionale; non è stato eseguito un ciclo di detector.

| Regola e valore segnalato | Riscontro | Eccezione persistita |
| --- | --- | --- |
| `design-system-color`, `rgb(0, 0, 0)` sullo sfondo HTML | Il render autonomo del detector mostra nero; il DOM QA misura HTML `rgb(255, 255, 255)` e body `rgb(245, 244, 239)`, coerenti con Terra. | `ignore-value` per quel valore, limitato a `index.html`. |
| `design-system-radius`, `3.40282e38px` | È il raggio completamente arrotondato originale di `btn-circle`/`rounded-full`, non un nuovo token o una replica del controllo. Il browser può limitarne il valore calcolato. | `ignore-value` per quel valore, limitato a `index.html`. |
| `repeating-stripes-gradient` | Le strisce appartengono soltanto al CSS originale `progress:indeterminate`. I progress dell’app hanno valori numerici espliciti; non ci sono superfici applicative con strisce decorative. | `ignore-value` con valore `*`, limitato a `index.html` perché il rilievo non espone un valore più specifico. |

Le tre eccezioni sono registrate tramite CLI in `.impeccable/config.json` con la motivazione e il file interessato. Non disabilitano le regole a livello di progetto; non aggiungono token a `DESIGN.md` e non modificano il CSS della libreria. Le quattro eccezioni precedenti restano fuori da questa verifica.

**Revisione finale completata:** `finish-review.md` registra `disposition: ship` e tutti e tre i rilievi risolti. Il giudizio è limitato alla conformità dei componenti e alle tre correzioni; non costituisce una nuova critica generale e non certifica accessibilità completa, fluidità delle animazioni, prestazioni su dispositivi reali o prove interattive di ogni route.
