# Cine Atlas

A visual atlas of world cinema, organised by **the questions films ask** and **the values they put at stake**, not by box office or canon rank. It also maps the **connections** that carry ideas between cultures.

It covers 165 films from 55 countries in 8 world regions, with 152 annotated connections, 20 concepts, 14 values, 32 movements and 8 curated journeys.

## Views

| View | What it shows |
|---|---|
| **Constellation** | A force-directed map. Films cluster around the concept hubs they explore, and lines show film-to-film connections. Hover a film to light up its links. |
| **World** | Films placed where they were made, with arcs tracing influence across borders. |
| **Time** | A century of cinema in regional lanes, with arcs showing how ideas move forward in time. |
| **Concepts** | A chord diagram of which concepts travel together. The outer ring shows each concept's regional make-up. |
| **Patterns** | Heatmaps of values × regions and concepts × regions, computed over this curated sample. |
| **Index** | A sortable table of every film, for text-first and accessible browsing. |

Every view shares the same **lenses**: concepts, values, regions, era and connection types. The detail panel also offers:

- **Connections**: each link has a note explaining it.
- **Resonances across cultures**: unlinked films from other regions that share the most concepts and values. These are computed, not curated.
- **Find a path**: the shortest chain of connections between any two films.
- **Journeys**: curated, step-through paths such as *The Neorealist Diaspora*, *The Art of Stillness*, *Decolonising the Screen*, *The Gaze Returned*, *Children Who See*, *Memory Against Erasure*, *Faces of the Sacred* and *Women Look Back*.

The URL tracks the current view and selection (for example `#world/film/patherpanchali` or `#time/journey/neorealism/3`), so any state can be shared. Keyboard shortcuts: `/` focuses search, `Esc` clears the selection, and `←`/`→` step through a journey.

## Connection types

- **Lineage**: documented influence or continuity, such as a filmmaker's own statement, a dedication, shared crew or the same director.
- **Dialogue**: one film answers, rewrites or continues another.
- **Echo**: a curatorial thematic rhyme across cultures. It is an invitation to compare, not a claim of influence.

## Running it

The site is static, with no build step and no network dependencies; D3 and the world map are vendored in `vendor/`. Either open `index.html` directly, or serve the folder:

```sh
npm start            # python3 -m http.server 8000
```

It can be deployed as-is to GitHub Pages or any static host.

## Editing the data

All content lives in [`js/data.js`](js/data.js):

- `F(id, title, year, director, countryCode, movement, concepts[], values[], logline, { orig, loc })` adds a film.
- `I(a, b, note)`, `D(a, b, note)` and `E(a, b, note)` add lineage, dialogue and echo links.
- `journeys` holds the curated step lists.

Run the integrity check after editing:

```sh
npm run validate
```

It confirms that every film, concept, value, movement, country and journey reference resolves, and that there are no duplicate or self links.

## Caveats

This is a curated, partial and arguable map. Concept and value tags are interpretive. The Patterns view describes this selection, not cultures as wholes. Additions and corrections are welcome.
