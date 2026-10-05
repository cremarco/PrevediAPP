---
name: PREVEDIApp · Terra
description: Un sistema naturale e luminoso per coltivare piccoli gesti quotidiani.
colors:
  base-100: '#ffffff'
  base-200: '#f5f4ef'
  base-300: '#e4e7df'
  base-content: '#4a4e4a'
  primary: '#4a7c59'
  primary-content: '#ffffff'
  secondary: '#6b6358'
  secondary-content: '#ffffff'
  accent: '#c4a66a'
  accent-content: '#30291c'
  neutral: '#4a4e4a'
  neutral-content: '#ffffff'
  info: '#416e80'
  info-content: '#ffffff'
  success: '#3c6e4b'
  success-content: '#ffffff'
  warning: '#bb8b33'
  warning-content: '#271b09'
  error: '#a74438'
  error-content: '#ffffff'
typography:
  display:
    fontFamily: Literata, serif
    fontSize: clamp(1.8rem, 2.7vw, 2.5rem)
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.025em
  headline:
    fontFamily: Literata, serif
    fontSize: 1.35rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.015em
  title:
    fontFamily: Literata, serif
    fontSize: 1.1rem
    fontWeight: 500
    lineHeight: 1.4
  card-title:
    fontFamily: Literata, serif
    fontSize: 1.25rem
    fontWeight: 500
    lineHeight: 1.75rem
  body:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  label:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  button:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.55
  item-title:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.55
  metadata:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1rem
  navigation:
    fontFamily: '''Nunito Sans'', sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
  numeric:
    fontFamily: Literata, serif
    fontSize: 1.875rem
    fontWeight: 500
    lineHeight: 2.25rem
  timer:
    fontFamily: Literata, serif
    fontSize: 2.25rem
    fontWeight: 400
    lineHeight: 2.5rem
rounded:
  selector: 0.5rem
  field: 0.5rem
  box: 1rem
spacing:
  '4': 4px
  '6': 6px
  '8': 8px
  '12': 12px
  '16': 16px
  '20': 20px
  '24': 24px
  '28': 28px
  '32': 32px
  '44': 44px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-content}'
    typography: '{typography.button}'
    rounded: '{rounded.field}'
    padding: 0 1rem
    height: 2.5rem
  button-outline:
    backgroundColor: transparent
    textColor: '{colors.base-content}'
    typography: '{typography.button}'
    rounded: '{rounded.field}'
    padding: 0 1rem
    height: 2.5rem
  button-ghost:
    backgroundColor: transparent
    textColor: '{colors.base-content}'
    typography: '{typography.button}'
    rounded: '{rounded.field}'
    padding: 0 1rem
    height: 2.5rem
  button-soft:
    backgroundColor: color-mix(in oklab, var(--color-base-content) 8%, var(--color-base-100))
    textColor: '{colors.base-content}'
    typography: '{typography.button}'
    rounded: '{rounded.field}'
    padding: 0 1rem
    height: 2.5rem
  card:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.box}'
    padding: 1.25rem
  card-tonal-primary:
    backgroundColor: color-mix(in oklab, var(--color-primary) 15%, transparent)
    textColor: '{colors.base-content}'
    rounded: '{rounded.box}'
    padding: 1.25rem
  menu-link:
    textColor: '{colors.base-content}'
    typography: '{typography.navigation}'
    rounded: '{rounded.field}'
    height: 2.75rem
  menu-current:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-content}'
  badge-accent:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-content}'
    rounded: '{rounded.selector}'
  badge-soft-primary:
    backgroundColor: color-mix(in oklab, var(--color-primary) 8%, var(--color-base-100))
    textColor: '{colors.base-content}'
    rounded: '{rounded.selector}'
  badge-soft-accent:
    backgroundColor: color-mix(in oklab, var(--color-accent) 8%, var(--color-base-100))
    textColor: '{colors.accent-content}'
    rounded: '{rounded.selector}'
  input:
    backgroundColor: '{colors.base-100}'
    borderColor: color-mix(in oklab, var(--color-secondary) 75%, transparent)
    textColor: '{colors.base-content}'
    rounded: '{rounded.field}'
    padding: 0 0.75rem
    height: 2.5rem
    width: 100%
  select:
    backgroundColor: '{colors.base-100}'
    borderColor: color-mix(in oklab, var(--color-secondary) 75%, transparent)
    textColor: '{colors.base-content}'
    rounded: '{rounded.field}'
    height: 2.5rem
    width: 100%
  avatar-placeholder:
    backgroundColor: color-mix(in oklab, var(--color-primary) 10%, transparent)
    textColor: '{colors.base-content}'
    width: 2.5rem
    height: 2.5rem
  avatar-community:
    backgroundColor: '{colors.base-200}'
    width: 2.5rem
    height: 2.5rem
  list-row:
    textColor: '{colors.base-content}'
    rounded: '{rounded.box}'
    padding: 1rem 0
  chat-bubble-pigna:
    backgroundColor: color-mix(in oklab, var(--color-secondary) 10%, transparent)
    textColor: '{colors.base-content}'
    rounded: '{rounded.field}'
    padding: 0.5rem 1rem
  chat-bubble-user:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-content}'
    rounded: '{rounded.field}'
    padding: 0.5rem 1rem
  stats:
    backgroundColor: '{colors.base-200}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.box}'
  progress-primary:
    textColor: '{colors.primary}'
    rounded: '{rounded.box}'
    height: 0.5rem
    width: 100%
  modal-box:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.box}'
    padding: 1.5rem
    width: 91.6667%
  alert-soft-warning:
    backgroundColor: color-mix(in oklab, var(--color-warning) 8%, var(--color-base-100))
    textColor: '{colors.warning-content}'
    rounded: '{rounded.box}'
    padding: 1rem
  alert-soft-info:
    backgroundColor: color-mix(in oklab, var(--color-info) 8%, var(--color-base-100))
    textColor: '{colors.info}'
    rounded: '{rounded.box}'
    padding: 1rem
  alert-soft-success:
    backgroundColor: color-mix(in oklab, var(--color-success) 8%, var(--color-base-100))
    textColor: '{colors.success}'
    rounded: '{rounded.box}'
    padding: 1rem
---

# Design System: PREVEDIApp · Terra

## Overview

**Creative North Star: "Terra — coltiva il tuo benessere"**

Terra conserva il mondo naturale del prototipo Stitch fornito: verde foglia, terra, oro e fondi chiari, con Literata nei titoli e Nunito Sans nelle azioni. Il tono è caloroso e calmo. Alberello e Pigna danno volto al percorso; le superfici restano sobrie, con linee leggere e spazi leggibili.

La gerarchia privilegia un titolo chiaro, contenuti brevi e azioni riconoscibili. I progressi usano numeri, etichette e barre insieme. Il colore accompagna le categorie e gli stati, mentre la navigazione mantiene una forma coerente fra le viste. L'identità deriva dal prototipo confermato; il sistema di componenti approvato usa esclusivamente daisyUI 5, con il tema Terra e layout Tailwind. I token e i contratti descrivono l'implementazione in `src/styles.css`, `index.html` e i moduli in `assets/js/`. `assets/app.js` è l’entrypoint; la guida del codice è in `MAINTENANCE.md`.

**Key Characteristics:**

- Superfici avorio e bianche, verde foglia per azioni e progresso.
- Titoli Literata, testo e controlli Nunito Sans.
- Card daisyUI con bordo sottile, angoli morbidi e nessuna ombra ordinaria.
- Heroicons outline e personaggi illustrati originali del percorso.
- Movimento legato agli stati, con riduzione rispettata a livello globale.

## Colors

La palette ha la materia discreta di un quaderno chiaro e di un giardino: colori naturali nelle azioni, toni diluiti nei contenitori. I valori normativi sono nel frontmatter e coincidono con il tema ufficiale `terra` applicato tramite `data-theme="terra"`.

### Primary

- **Verde foglia** (`primary`): azione principale, selezione, destinazione corrente, messaggi personali, barre di progresso e crescita. `primary-content` fornisce il testo chiaro sui riempimenti pieni. Gli stati hover sono quelli della libreria, ricavati dal colore semantico; non esiste un token primitivo di hover separato.
- Alberello e Alimentazione usano superfici primarie al (15%). Il menu corrente e le bolle personali usano verde pieno con testo chiaro; gli avatar personali mantengono il fondo al (10%). Le varianti soft dei badge sono quelle native della libreria.

### Secondary

- **Terra** (`secondary`): introduzioni e voci Benessere al (15%), bolle Pigna al (10%) e consigli discreti al (5%). Il bordo dei campi usa Terra al (75%) per distinguere il controllo dal bianco. La guida alla respirazione usa un avatar Pigna su `primary/15` e un progresso circolare su `primary/5`, mantenendo i token Terra.

### Tertiary

- **Oro** (`accent`): contatore delle foglie pieno, ricompense e punto di notifica. Pigna usa superfici oro al (20%); Movimento al (25%) con icona Terra. I badge oro pieni e soft usano `accent-content`.
- **Azzurro riposo** (`info`): introduzione Sonno e contesti informativi. I colori di categoria derivano dal tema; non esistono palette separate blu o lilla.

### Neutral

- **Carta chiara** (`base-200`): fondo del workspace; **bianco** (`base-100`): sidebar, card e campi. **Linea naturale** (`base-300`): bordi della struttura e separazioni. Il bordo delle card conserva il trattamento nativo daisyUI su `base-200`.
- **Inchiostro naturale** (`base-content`, `neutral`): testo principale, allineato al neutro confermato in `PRODUCT.md`. Il testo di supporto, i titoli di gruppo, le descrizioni statistiche e i placeholder abilitati usano `base-content` al (85%); non aggiungere un token `muted` separato.
- `info`, `success`, `warning` ed `error` mantengono i ruoli semantici del tema. Gli errori di modulo e la cancellazione usano `error`; esiti e suggerimenti usano le rispettive varianti soft degli alert. Gli avvisi soft usano `warning-content` scuro, perché `warning` sul fondo chiaro non raggiunge il contrasto del testo.
- Focus e caret usano `primary`. La selezione del testo usa `primary` e `primary-content`. Le coppie contenuto dei colori pieni restano quelle definite dal tema.

**The Terra Continuity Rule.** Usa il verde pieno per azione, selezione e messaggi personali; oro per foglie e Pigna; tinte stabili per le categorie. Conserva i valori del tema Terra e accompagna ogni significato con testo, icona o posizione.

| Categoria | Superficie di card e avatar | Icona |
| --- | --- | --- |
| Alimentazione / acqua | `primary/15` | `primary` |
| Movimento | `accent/25` | `secondary` |
| Sonno | `info/15` | `info` |
| Benessere (introduzioni e voci) | `secondary/15` | `secondary` |

La mappa condivisa `wellnessPalette` mantiene questi ruoli fra tessere, missioni, introduzioni e diario. Contrasti calcolati, stati e simulazioni in `COLOR-AUDIT.md`. La modalità supportata resta chiara.

## Typography

**Display Font:** Literata (fallback serif).
**Body Font:** Nunito Sans (fallback sans-serif).

La serif rende i titoli familiari e narrativi; la sans mantiene diretti testo, azioni e dati. I file sono ospitati in `assets/fonts/` con `font-display: swap`. Literata dispone di file 400, 500 e 600; il file 600 copre le dichiarazioni 600–700. Nunito Sans dispone di 400, 600 e 700; il file 700 copre le dichiarazioni 700–800. Non è presente un volto monospaziato separato.

### Hierarchy

- **Display:** titolo pagina fluido in `typography.display`, senza override mobile separato. I titoli sono bilanciati con `text-wrap: balance`.
- **Headline / Title:** sezioni e sottotitoli serif in `typography.headline` e `typography.title`.
- **Card title:** la parte nativa del componente usa Literata, peso medio e la scala `typography.card-title`; tessere e banner impiegano varianti contestuali (1rem) e (1.125rem).
- **Body:** testo sans in `typography.body`, invariato fra desktop e telefono. Le introduzioni limitano la misura a (72ch); altre superfici mantengono i limiti del proprio contenitore.
- **Small / Metadata:** contenuti di supporto in `typography.small` e metadati in `typography.metadata`. I titoli delle righe usano sans semibold in `typography.item-title`.
- **Label / Button:** label dei campi in `typography.label`; pulsanti nativi sans semibold in `typography.button`. Le legende ordinarie seguono daisyUI (0.75rem, 600); la libreria conserva la propria scala per badge e dock. Non aggiungere maiuscolo o spaziatura da soprattitolo ai titoli.
- **Numeric / Timer:** metriche Literata medio in `typography.numeric`, timer in `typography.timer`; i valori di tempo e movimento usano numeri tabulari dove necessario.

**The Two Voices Rule.** Literata titola e racconta; Nunito Sans guida azioni, campi, elenchi e metadati. Le icone restano SVG, mai glifi tipografici.

## Layout

Il workspace usa il drawer nativo daisyUI. La sidebar misura (256px); da (1024px) rimane aperta e il contenuto occupa la colonna adiacente. Sotto questa soglia, la navigazione completa si apre dal navbar e il dock mostra cinque destinazioni. Navbar, main e footer condividono una larghezza massima di (1320px), centrata e comprensiva del padding. Il navbar ha altezza minima (72px), poi (80px) da `sm`. Il contenuto del drawer è una colonna flex con minimo (100dvh): main cresce e il footer segue il contenuto, senza sottrarre al viewport una stima fissa delle altre aree.

| Soglia minima | Struttura e ritmo osservati |
| --- | --- |
| Base | Navbar e main con gutter (20px); main con padding verticale (24px). Card con padding (20px), gap principale (24px). Le griglie principali sono in colonna; le tessere delle abitudini hanno una colonna sotto (360px), poi due, con padding (16px) prima di `sm`. |
| (640px), `sm` | Gutter (28px), padding verticale main (36px), padding card (24px). Filtri e campi selezionati passano a due colonne; le statistiche diventano orizzontali e le card Pigna possono diventare affiancate. |
| (1024px), `lg` | Drawer aperto, dock nascosto. Breadcrumb visibile, footer con padding inferiore (24px), toast vicino al bordo inferiore. |
| (1280px), `xl` | Gutter (44px); dimensione maggiore dell’Alberello nella home. |
| Contenuto main (896px), `@4xl` | Le griglie rispondono alla larghezza interna disponibile, dopo sidebar e gutter. Home a due colonne (1.65fr / 1fr); altre viste usano (1.5fr / 1fr) o colonne uguali. Le tessere delle abitudini passano a quattro colonne. Chat e guida Pigna si affiancano, con guida larga (288px). |

Informazioni ha larghezza massima (56rem); quiz e test (48rem). La chat segue l’allineamento del titolo e occupa la colonna principale, con guida affiancata quando c’è spazio e successiva nel DOM sugli schermi stretti. Il gruppo crescita occupa la larghezza della card anche su telefono. L'immagine Alberello home misura (208px), poi (240px) da `xl`; quella del Giardino (256px), poi (288px) da `sm`.

Gli spazi seguono le utility Tailwind osservate: gap compatti (4–12px), righe e controlli (16px), card e colonne (20–24px), stacchi tra sezioni (28–32px). Le utility responsive sono soglie minime inclusive. `min-width: 0`, testi che vanno a capo e azioni flessibili preservano i contenuti nelle griglie.

**The Available Space Rule.** Le griglie rispondono alla larghezza effettiva del main; conversazione e scrittura precedono i suggerimenti nel DOM, con guida laterale da (896px) di contenuto. Dettagli e verifica in `LAYOUT-AUDIT.md`.

Il dock conserva la safe area nativa daisyUI. Il footer riserva (112px) più `env(safe-area-inset-bottom)` sotto il contenuto finché il dock è presente. I toast partono a (96px) più safe area dal bordo inferiore, poi (20px) da `lg`, con larghezza massima `calc(100vw - 2rem)`. I dialoghi conservano larghezza (91.6667%), massimo (32rem), e lo scorrimento interno nativo.

## Elevation & Depth

La profondità viene principalmente da fondo, bordo e spazio. Le card ordinarie usano superfici bianche o tonali, bordo nativo e nessuna ombra aggiunta. Il tema dichiara profondità e rumore a zero. Il modello del piatto e l'andamento settimanale sono ora statistiche, elenchi e progressi daisyUI; non esiste un disco del piatto con ombra propria.

### Shadow Vocabulary

- **Dialogo:** (`0 25px 50px -12px oklch(0% 0 0 / .25)`), ombra nativa del modal-box; il livello modale usa il backdrop della libreria al (40%).
- **Toast:** (`0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a`), utility `shadow-sm` sul feedback temporaneo. Gli alert soft ordinari non aggiungono ombra.

**The Quiet Surface Rule.** Le card si separano con tono e bordo. Le ombre documentate restano al dialogo e al feedback temporaneo.

Gli stati dei componenti conservano i tempi daisyUI: pulsanti (200ms) con curva `cubic-bezier(0, 0, .2, 1)` e pressione verticale (0.5px); barre native (300ms) quando il browser supporta il relativo pseudo-elemento e la preferenza consente movimento. Drawer, dialoghi, card e dock mantengono le proprie transizioni della libreria.

La respirazione anima l’avatar nativo con Pigna mediante una Web Animation: ciclo (8s), scala da (0.8) a (1) e opacità da (0.85) a (1). Ogni metà usa ease-in-out, con tempo complessivo lineare, così l’inversione a quattro secondi rimane morbida e coincide con Inspira/Espira. La fase e il tempo restano testo fermo; il radial-progress nativo mostra la sessione completa. Il timer conserva i millisecondi e riposiziona l’animazione in pausa, ripresa e rimontaggio della pagina; non cambia il colore durante il ciclo.

La regola globale `prefers-reduced-motion: reduce` riduce animazioni e transizioni a (0.001ms), limita le iterazioni a una e usa scorrimento automatico. La guida osserva la stessa preferenza per cancellare la Web Animation e conservare una posa statica, fase e countdown. Il toggle nativo Animazione consente di fermare il movimento; a scheda nascosta e fuori vista l’animazione è sospesa, mentre il timer mantiene il proprio tempo.

## Shapes

Card, alert e dialoghi condividono il raggio morbido `box`; campi, pulsanti, voci menu e bolle chat seguono `field`; badge e selettori seguono `selector`. I valori normativi sono nel frontmatter. Le varianti circolari della libreria e gli avatar con utility completamente arrotondata restano elementi compatti; non trasformano le card in pillole.

Il bordo di tema misura (1px). Le dimensioni native dei campi e dei selettori derivano dal passo (0.25rem); usare le varianti daisyUI per la scala del componente e utility Tailwind per i suoi vincoli di layout.

Alberello conserva il PNG del prototipo, incluso il paesaggio circolare. Pigna conserva il PNG trasparente generato con il prompt in `assets/images/pigna.prompt.txt`, linee organiche scure e colori opachi terra/salvia. Entrambi usano `object-fit: contain`, senza ritagli o deformazioni. Le icone provengono da Heroicons v2.1.5 outline su viewBox (24 × 24), tratto (1.5), cap e join arrotondati: dimensione normale (20px), metadati (16px), enfasi (32px). Nella guida alla respirazione, Pigna occupa l’avatar centrale e gli Heroicons nominano i controlli.

I nomi delle icone nel codice sono quelli ufficiali Heroicons. `star` accompagna le foglie, `arrow-trending-up` i livelli, `face-smile` il benessere, `paper-airplane` l’invio e `clipboard-document-check` il questionario. Per i cibi senza icona dedicata, il nome identifica l’alimento e `plus` / `check` comunica l’azione o la selezione. Non usare simboli estranei come sostituti figurativi. Gli SVG sono decorativi, esclusi dalla sequenza di focus; le etichette accessibili appartengono ai controlli. La verifica completa è in `HEROICONS-AUDIT.md`.

## Components

**Contratto approvato:** ogni controllo e contenitore UI usa il componente daisyUI reale, incluse le sue parti ufficiali. Tailwind gestisce layout, spazi, dimensioni, tipografia e opacità dei colori semantici. `src/styles.css` contiene tema completo, font, tipografia di base, focus/selezione/caret e riduzione del movimento; non contiene classi che ridisegnano i componenti. `assets/js/breathing.js` gestisce la guida animata e la sincronizza al timer. La mappatura completa è in `DAISYUI-AUDIT.md`.

### Buttons

Diretti e morbidi. Il componente `btn` usa primario verde pieno, outline trasparente, ghost o soft. Ogni pulsante conserva una sola variante di stile e, quando serve, un colore semantico, una taglia e una forma nativa. La misura ordinaria è (40px), con padding laterale (16px); `btn-sm` misura (32px), con padding (12px). Le azioni che richiedono più spazio applicano altezza automatica e minimo (44px) o superiore tramite utility.

Hover, focus, pressione e disabilitazione provengono da daisyUI. `btn-active`, `aria-pressed` e gli attributi nativi descrivono lo stato delle scelte; il testo e le icone lo rendono riconoscibile. Il focus globale usa linea primaria (3px), offset (3px); i componenti conservano anche le proprie regole di focus.

### Chips

I badge sono componenti informativi, con varianti soft, primary, accent, success o ghost. I badge soft verdi usano testo `base-content`; quelli oro `accent-content`. Il contatore foglie usa `badge-accent` pieno; le missioni completate usano `badge-success` pieno con testo esplicito. Le foglie e il livello usano `badge` con piccola icona SVG, mai una pillola CSS sostitutiva. Ingredienti rimovibili, opzioni durata e decorazioni sono pulsanti reali; i gruppi contigui usano `join` e `join-item`.

### Cards / Containers

La card usa `card`, eventuale `card-border`, `card-body`, `card-title` e `card-actions`. Corpo con padding (20px), poi (24px) da `sm`, gap (20px), raggio box e nessuna ombra ordinaria. Le tessere benessere sono link-card con le stesse parti e passaggio al fondo bianco in hover.

Il banner Pigna usa la variante `card-side` quando lo spazio lo consente, figure originale, fondo accent diluito, titolo serif e azione ghost. Le introduzioni di categoria mantengono card native e avatar, con superfici semantiche diluite. La loro funzione è orientare, non aggiungere una nuova voce tipografica.

### Inputs / Fields

Moduli raggruppati con `fieldset` e `fieldset-legend`; etichette vere con `label`, campi `input` e `select`, scelte `radio` e `checkbox`. I campi ordinari sono bianchi, raggio field, altezza (40px) e padding laterale nativo; le utility espandono la larghezza al contenitore. I bordi dei controlli usano `secondary/75`, e radio/checkbox selezionati riprendono `primary`. I placeholder abilitati usano `base-content` al (85%). Le label che contengono i controlli usano testo principale; il testo di aiuto mantiene il (85%).

Errori vicini ai campi in `alert alert-error alert-soft` con `role="alert"`. I contenitori delle radio del test ricevono bordo primario e fondo primario al (5%) quando il controllo è selezionato, attraverso le utility di stato. Gli attributi `required`, `disabled` e i controlli nativi conservano la semantica del modulo.

### Navigation

Desktop e menu espanso usano `drawer` con toggle, content, side e overlay. Le destinazioni sono voci `menu` con titolo di gruppo e stato `menu-active`; la destinazione corrente applica fondo primario pieno, `primary-content` e `aria-current="page"`. Le righe hanno altezza minima (44px). Il navbar usa le parti start/end; notifiche tramite `indicator`, profilo tramite avatar.

Sotto `lg`, il dock usa pulsanti nativi con `dock-label` e `dock-active`: Percorso, Giardino, Pigna, Community e Profilo. Attività, diario e apprendimento sono ricondotti a Percorso nel dock. Il drawer completo resta disponibile e si chiude dopo la navigazione. Focus visibile e nome accessibile restano necessari anche sulle azioni solo icona.

### Missioni quotidiane ed elenchi

Missioni, diario, ricompense e community usano `list`, `list-row` e, per il contenuto esteso, `list-col-wrap`. La riga combina avatar con un `div` diretto, titolo sans semibold, testo di supporto, badge di punti/esito e azione `btn`. Il completamento cambia badge e icona freccia/check; non è espresso dal solo colore.

Nella community, Anna, Marco ed Elena usano ritratti illustrati fittizi con colori Terra e sfondo avorio. La struttura nativa è `avatar > div > img`, con misura (40 × 40px) e ritaglio circolare tramite utility; non si applica `avatar-placeholder` a un’immagine. Lo stesso asset accompagna la stessa persona negli elenchi e nei messaggi. Il nome resta testo HTML adiacente; `alt=""` evita di ripeterlo. I WebP locali conservano i pixel originali e includono prompt e provenienza nei metadati. Le iniziali restano disponibili per il profilo personale. Dettagli in `AVATARS.md`.

### Alberello e crescita

L'ordine visivo è titolo, descrizione dove presente, illustrazione, eventuale decorazione, gruppo crescita. **Il livello è dentro il gruppo crescita sotto l'illustrazione**, prima dell'etichetta del prossimo livello e della barra. Mantieni insieme livello, contatore e barra anche su telefono; non riportare il livello sopra il titolo.

Le barre sono `progress progress-primary`, a tutta larghezza, con altezza nativa (8px) e nome accessibile. Numeri e testo rendono lo stato comprensibile senza il solo colore. Metriche e proporzioni del piatto usano `stats`, `stat`, `stat-title`, `stat-value` e `stat-desc`; le etichette di supporto usano testo al (85%).

### Chat e respirazione

Pigna usa `chat-start` e le persone `chat-end`, con `chat-header` e `chat-bubble`. Le bolle di Pigna usano `secondary/10` con testo principale; quelle personali usano la variante nativa `chat-bubble-primary`, verde pieno e `primary-content`. Le intestazioni “Pigna” e “Tu” e i lati della conversazione distinguono gli autori anche senza colore. Le bolle hanno misura massima `min(90%, 65ch)`, testo (14px), interlinea (1.625), righe e parole lunghe a capo. `loading loading-dots` indica la risposta in preparazione.

La card della conversazione separa intestazione, registro e form di scrittura. Il corpo è flex e ha altezza `clamp(20rem, 100dvh - 20rem, 38rem)`; con il layout affiancato passa a `clamp(24rem, 100dvh - 17rem, 42rem)`. Il registro cresce nello spazio disponibile, conserva `min-height: 0`, scorre internamente e riceve focus da tastiera. Il campo e l’invio misurano almeno (44px) e rimangono dopo il registro, prima dei suggerimenti nell’ordine DOM. La guida mantiene Pigna, suggerimenti e informazioni sul servizio. “Risposte guidate” compare anche nell’intestazione della conversazione.

All’invio e alla ricarica, il registro mostra l’ultimo messaggio. Quando cambia dimensione, segue il fondo se era già in fondo; chi sta leggendo la cronologia conserva la sua posizione. Nei viewport molto bassi resta disponibile lo scorrimento della pagina: la card conserva un’altezza minima utilizzabile.

La respirazione usa `radial-progress` (208px, 224px da 640px; spessore 3px) e `avatar` con Pigna, fondo `primary/15` e figura contenuta. Il valore percentuale numerico e gli attributi del progressbar descrivono l’avanzamento della sessione; fase, countdown e comandi sono esterni all’avatar animato. Il toggle nativo consente la guida statica. `assets/js/breathing.js` gestisce una sola Web Animation e la sincronizza al timer; forma e superficie rimangono quelle dei componenti nativi.

### Dialoghi e feedback

Dialogo HTML nativo con `modal`, `modal-box`, `modal-backdrop` e `modal-action`; apertura tramite `showModal()` e form di chiusura. Il titolo è collegato con `aria-labelledby`. Il modal-box conserva taglia, scorrimento, angoli e livello della libreria.

Avvisi, errori ed esiti usano `alert` e varianti semantiche soft; `alert-warning` applica `text-warning-content` per un inchiostro leggibile. Il toast è il contenitore daisyUI con alert success interno, utility di posizione e ombra piccola; compare per (4500ms) ed è annunciato con `role="status"` e `aria-live="polite"`. Separazioni, fonti e fondo pagina usano `divider`, `link` e `footer` reali.

## Do's and Don'ts

### Do:

- **Do** conserva verde foglia, fondi chiari e gerarchia Literata/Nunito Sans fra le viste.
- **Do** usa componenti daisyUI reali e le loro parti ufficiali, personalizzati tramite il tema Terra; usa Tailwind per il layout.
- **Do** usa il bordo sottile per le card e riserva il fondo tonale ai contenuti di accompagnamento.
- **Do** colloca livello, contatore e barra nel gruppo crescita sotto Alberello.
- **Do** mantieni Heroicons outline con tratto coerente e testo accessibile per le azioni solo icona.
- **Do** applica le soglie responsive minime e preserva il dock con il suo spazio inferiore.
- **Do** conserva focus visibile, etichette dei campi, numeri del progresso e riduzione del movimento.
- **Do** usa testo `base-content` al (85%) per supporto e placeholder abilitati; conserva gli inchiostri leggibili dei badge soft.
- **Do** riusa i PNG di Alberello e Pigna senza deformarli, mantenendo la provenienza degli asset.

### Don't:

- **Don't** aggiungere soprattitoli decorativi sopra i titoli o spostare il livello sopra il titolo di Alberello.
- **Don't** sostituire componenti della libreria con pannelli, badge, chat o controlli dipinti da CSS proprio.
- **Don't** sostituire le illustrazioni con emoji, glifi o personaggi di un'altra identità.
- **Don't** applicare ombre ordinarie alle card o usare ombre rigide a offset.
- **Don't** usare una sans di sistema come voce dei titoli o introdurre un nuovo font senza una decisione di identità.
- **Don't** affidare completamento, selezione, errore o progresso al solo colore.
- **Don't** trasformare le rampe sintetiche del sidecar in nuovi token del tema o reintrodurre i token e i widget custom rimossi.
