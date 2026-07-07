# Service area toggle — design

## Obiettivo

Aggiungere un'impostazione utente attivabile dal menu di navigazione, "Mostra
raggio di servizio", che quando attiva disegna sotto ciascun marker un cerchio
semi-trasparente blu chiaro con raggio reale di 700m, per visualizzare l'area
di copertura di ogni stabilimento balneare.

## Atom dei settings

Nuovo file `src/atoms/settings.ts`:

```ts
export const SETTINGS = ["beach_stand_cover_area"] as const;
export type Setting = (typeof SETTINGS)[number];

export const activeSettingsAtom = atomWithReset<Setting[]>([]);

export const toggleSettingAtom = atom(null, (get, set, setting: Setting) => {
  const current = get(activeSettingsAtom);
  set(
    activeSettingsAtom,
    current.includes(setting)
      ? current.filter(s => s !== setting)
      : [...current, setting]
  );
});
```

Stato in-memory (coerente con `selectedBeachStandAtom` esistente), si resetta
al reload della pagina. Nessuna persistenza in localStorage.

`SETTINGS` è un array di literal string che rappresenta i settings attivabili;
al momento contiene solo `"beach_stand_cover_area"`, pensato per essere esteso
in futuro con altri flag.

## Componente `ServiceAreaCircle`

Nuovo file `src/components/ServiceAreaCircle.tsx` + `.module.css`.

Costanti esportate dal componente:

- `SERVICE_AREA_RADIUS_METERS = 700`
- `SERVICE_AREA_OPACITY = 0.25`

Il `<Marker>` di react-map-gl è un overlay DOM posizionato per lat/lng, non
una geometria proiettata sulla mappa: un cerchio disegnato come `div` avrebbe
una dimensione in pixel fissa che non corrisponde a 700m reali se non viene
ricalcolata ad ogni zoom. Il componente:

- legge lo zoom corrente della mappa tramite `useMap()` (react-map-gl) e si
  iscrive all'evento `zoom` della mappa per aggiornarlo in tempo reale;
- converte metri → pixel con la formula standard di proiezione Web Mercator:
  `metersPerPixel = 156543.03392 * cos(latitude * PI/180) / 2^zoom`;
- calcola il diametro in pixel (`2 * SERVICE_AREA_RADIUS_METERS /
  metersPerPixel`) e lo applica come `width`/`height` inline a un `div`
  circolare;
- il `div` è centrato via `position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%)`, con `pointer-events: none` (non deve
  intercettare i click, che restano di competenza del pallino), colore blu
  chiaro `#4dabf7` (Mantine `blue.4`) e opacity dalla costante
  `SERVICE_AREA_OPACITY`.

Props: `{ latitude: number }` (la longitudine non serve per la conversione
metri/pixel, che dipende solo da lat e zoom).

## Integrazione in `BeachStandMarker.tsx`

Oggi il pallino (`.dot`) è l'unico figlio del `<Marker anchor="center">`, e
questo è ciò che permette all'ancoraggio di centrarlo correttamente sul
punto. Per aggiungere il cerchio come fratello dello stesso marker senza
alterare quel comportamento, i due elementi vengono avvolti in un wrapper a
"dimensione zero" (`position: relative`, nessuna width/height propria):
entrambi i figli sono centrati al suo interno via absolute positioning,
quindi il wrapper non introduce alcun ingombro proprio e l'ancoraggio del
Marker resta invariato.

Il cerchio viene renderizzato per primo (quindi visivamente sotto il
pallino) e solo se `activeSettingsAtom` contiene `"beach_stand_cover_area"`.

Il pallino (`.dot`) e la sua area di tap allargata restano invariati.

## Toggle nel menu di navigazione

In `App.tsx`, sotto il testo "Navigazione" già presente nella
`AppShell.Navbar`, viene aggiunto un `Switch` di Mantine con label "Mostra
raggio di servizio", collegato a `activeSettingsAtom` /
`toggleSettingAtom("beach_stand_cover_area")`.

## Fuori scope

- Persistenza della preferenza tra reload.
- Altri settings oltre a `beach_stand_cover_area` (l'array è predisposto per
  estensioni future ma non ne vengono aggiunti altri ora).
- Ottimizzazione con stato di zoom condiviso tra i marker (ogni
  `ServiceAreaCircle` si iscrive individualmente all'evento `zoom`; il numero
  di stabilimenti è ridotto, quindi non è un problema di performance).
