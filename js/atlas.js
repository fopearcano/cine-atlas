/*
 * Atlas core: indexed data, shared state, focus rules and graph helpers.
 * Views read from here and re-style themselves whenever the state changes.
 */
(function () {
  const RAW = window.ATLAS;

  const regions = RAW.regions;
  const regionById = new Map(regions.map((r) => [r.id, r]));
  const conceptById = new Map(RAW.concepts.map((c) => [c.id, c]));
  const valueById = new Map(RAW.values.map((v) => [v.id, v]));
  const movementById = new Map(RAW.movements.map((m) => [m.id, m]));

  const films = RAW.films.map((f) => {
    const [countryName, region, lon, lat] = RAW.countries[f.country];
    return Object.assign({}, f, {
      countryName, region,
      lonlat: f.loc || [lon, lat],
      neighbors: [], // { film, link }
    });
  });
  const filmById = new Map(films.map((f) => [f.id, f]));

  const links = RAW.links.map((l, i) => ({
    id: "l" + i,
    source: filmById.get(l.source),
    target: filmById.get(l.target),
    type: l.type,
    note: l.note,
  }));
  links.forEach((l) => {
    l.source.neighbors.push({ film: l.target, link: l });
    l.target.neighbors.push({ film: l.source, link: l });
  });
  const pairKey = (a, b) => (a < b ? a + "|" + b : b + "|" + a);
  const linkByPair = new Map(links.map((l) => [pairKey(l.source.id, l.target.id), l]));

  const LINK_TYPES = [
    { id: "influence", name: "Lineage", d: "Documented influence or continuity" },
    { id: "dialogue", name: "Dialogue", d: "One film answers or rewrites another" },
    { id: "echo", name: "Echo", d: "Curatorial thematic rhyme across cultures" },
  ];

  const yearExtent = d3.extent(films, (f) => f.year);

  // ——— State ———
  const state = {
    view: "constellation",
    selection: null, // { type: film|concept|value|region|movement|cell|journey|path, ... }
    hover: null, // film id
    filters: {
      concepts: new Set(),
      values: new Set(),
      regions: new Set(),
      yearMin: Math.floor(yearExtent[0] / 10) * 10,
      yearMax: Math.ceil((yearExtent[1] + 1) / 10) * 10,
      linkTypes: new Set(LINK_TYPES.map((t) => t.id)),
    },
  };
  const DEFAULT_YEARS = [state.filters.yearMin, state.filters.yearMax];

  const listeners = [];
  const on = (fn) => listeners.push(fn);
  let pending = null;
  function emit(kind) {
    // Coalesce bursts (e.g. hover storms) into one frame.
    pending = pending ? (pending === kind ? kind : "all") : kind;
    if (emit.raf) return;
    emit.raf = requestAnimationFrame(() => {
      const k = pending;
      pending = null;
      emit.raf = null;
      listeners.forEach((fn) => fn(k));
    });
  }

  function select(sel) {
    state.selection = sel;
    emit("selection");
  }
  function hover(id) {
    if (state.hover === id) return;
    state.hover = id;
    emit("hover");
  }
  function setFilter(patch) {
    Object.assign(state.filters, patch);
    filterCache = null;
    emit("filter");
  }
  function toggleIn(setName, id) {
    const s = state.filters[setName];
    s.has(id) ? s.delete(id) : s.add(id);
    filterCache = null;
    emit("filter");
  }
  function resetFilters() {
    const f = state.filters;
    f.concepts.clear(); f.values.clear(); f.regions.clear();
    f.yearMin = DEFAULT_YEARS[0]; f.yearMax = DEFAULT_YEARS[1];
    LINK_TYPES.forEach((t) => f.linkTypes.add(t.id));
    filterCache = null;
    emit("filter");
  }

  // ——— Filters ———
  let filterCache = null;
  function matches(film) {
    if (!filterCache) {
      const f = state.filters;
      filterCache = new Set(
        films
          .filter((d) =>
            d.year >= f.yearMin && d.year <= f.yearMax &&
            (!f.regions.size || f.regions.has(d.region)) &&
            [...f.concepts].every((c) => d.concepts.includes(c)) &&
            [...f.values].every((v) => d.values.includes(v)))
          .map((d) => d.id)
      );
    }
    return filterCache.has(film.id);
  }
  const matchCount = () => films.filter(matches).length;
  const filtersActive = () => {
    const f = state.filters;
    return f.concepts.size || f.values.size || f.regions.size ||
      f.yearMin !== DEFAULT_YEARS[0] || f.yearMax !== DEFAULT_YEARS[1];
  };
  const linkVisible = (l) => state.filters.linkTypes.has(l.type) && matches(l.source) && matches(l.target);

  // ——— Focus: which films and links are lit ———
  // Returns null (nothing focused) or { films:Set, primary:id|null, pairs:Set|null, label }
  function focusFor(sel) {
    if (!sel) return null;
    const ids = (arr) => new Set(arr.map((f) => f.id));
    switch (sel.type) {
      case "film": {
        const f = filmById.get(sel.id);
        const s = new Set([f.id]);
        f.neighbors.forEach((n) => state.filters.linkTypes.has(n.link.type) && s.add(n.film.id));
        return { films: s, primary: f.id, pairs: null };
      }
      case "concept": return { films: ids(films.filter((f) => f.concepts.includes(sel.id))), concept: sel.id };
      case "value": return { films: ids(films.filter((f) => f.values.includes(sel.id))), value: sel.id };
      case "region": return { films: ids(films.filter((f) => f.region === sel.id)) };
      case "movement": return { films: ids(films.filter((f) => f.movement === sel.id)) };
      case "cell": {
        const key = sel.dim === "value" ? "values" : "concepts";
        return { films: ids(films.filter((f) => f.region === sel.region && f[key].includes(sel.id))) };
      }
      case "journey":
      case "path": {
        const steps = sel.steps;
        const pairs = new Set();
        for (let i = 1; i < steps.length; i++) pairs.add(pairKey(steps[i - 1], steps[i]));
        return { films: new Set(steps), primary: steps[sel.index || 0] ?? null, pairs, ordered: steps };
      }
    }
    return null;
  }
  function focus() {
    if (state.hover && (!state.selection || state.selection.type !== "journey")) {
      return focusFor({ type: "film", id: state.hover });
    }
    return focusFor(state.selection);
  }

  // Link emphasis under a focus: 2 = strong, 1 = normal, 0 = faded
  function linkEmphasis(l, fc) {
    if (!fc) return 1;
    if (fc.pairs) return fc.pairs.has(pairKey(l.source.id, l.target.id)) ? 2 : 0;
    if (fc.primary) return l.source.id === fc.primary || l.target.id === fc.primary ? 2 : 0;
    return fc.films.has(l.source.id) && fc.films.has(l.target.id) ? 2 : 0;
  }
  // Film emphasis: 3 = primary, 2 = in focus, 1 = normal, 0 = faded, -1 = filtered out
  function filmEmphasis(f, fc) {
    if (!matches(f)) return -1;
    if (!fc) return 1;
    if (fc.primary === f.id) return 3;
    return fc.films.has(f.id) ? 2 : 0;
  }

  // ——— Similarity & paths ———
  function similarity(a, b) {
    let shared = 0, total = 0;
    const tally = (xa, xb, w) => {
      const u = new Set([...xa, ...xb]);
      u.forEach((x) => { total += w; if (xa.includes(x) && xb.includes(x)) shared += w; });
    };
    tally(a.concepts, b.concepts, 1);
    tally(a.values, b.values, 0.6);
    return total ? shared / total : 0;
  }
  // Cross-cultural resonances: similar films from other regions, not already linked.
  function resonances(film, n = 5) {
    const linked = new Set(film.neighbors.map((x) => x.film.id));
    return films
      .filter((f) => f.region !== film.region && f.id !== film.id && !linked.has(f.id))
      .map((f) => ({ film: f, score: similarity(film, f) }))
      .sort((a, b) => b.score - a.score || a.film.year - b.film.year)
      .slice(0, n);
  }
  // Shortest chain of connections between two films (BFS over enabled link types).
  function shortestPath(fromId, toId) {
    if (fromId === toId) return [fromId];
    const prev = new Map([[fromId, null]]);
    const queue = [fromId];
    while (queue.length) {
      const id = queue.shift();
      for (const n of filmById.get(id).neighbors) {
        if (!state.filters.linkTypes.has(n.link.type) || prev.has(n.film.id)) continue;
        prev.set(n.film.id, id);
        if (n.film.id === toId) {
          const path = [toId];
          let cur = id;
          while (cur) { path.unshift(cur); cur = prev.get(cur); }
          return path;
        }
        queue.push(n.film.id);
      }
    }
    return null;
  }

  // ——— Shared visual helpers ———
  const regionColor = (id) => regionById.get(id).color;
  const filmColor = (f) => regionColor(f.region);
  const filmRadius = (f) => 3.5 + Math.sqrt(f.neighbors.length) * 1.6;
  const linkDash = { influence: null, dialogue: "6 4", echo: "1.5 3.5" };

  const tooltip = document.getElementById("tooltip");
  function showTip(evt, html) {
    tooltip.innerHTML = html;
    tooltip.hidden = false;
    const pad = 14, r = tooltip.getBoundingClientRect();
    let x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
    tooltip.style.left = Math.max(8, x) + "px";
    tooltip.style.top = Math.max(8, y) + "px";
  }
  const hideTip = () => { tooltip.hidden = true; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const filmTip = (f) =>
    `<strong>${esc(f.title)}</strong> <span class="muted">${f.year}</span><br>` +
    `${esc(f.director)}<br><span class="dot" style="background:${filmColor(f)}"></span>${esc(f.countryName)}` +
    `<div class="tip-concepts">${f.concepts.map((c) => esc(conceptById.get(c).name)).join(" · ")}</div>`;

  // Common film-node interaction wiring for any view.
  function bindFilmEvents(selection) {
    selection
      .on("mouseenter", (evt, f) => { hover(f.id); showTip(evt, filmTip(f)); })
      .on("mousemove", (evt, f) => showTip(evt, filmTip(f)))
      .on("mouseleave", () => { hover(null); hideTip(); })
      .on("click", (evt, f) => { evt.stopPropagation(); hideTip(); select({ type: "film", id: f.id }); });
  }

  window.Atlas = {
    raw: RAW, regions, regionById, concepts: RAW.concepts, conceptById, values: RAW.values, valueById,
    movements: RAW.movements, movementById, films, filmById, links, linkByPair, pairKey, journeys: RAW.journeys,
    LINK_TYPES, yearExtent, state, on, emit, select, hover, setFilter, toggleIn, resetFilters,
    matches, matchCount, filtersActive, linkVisible, focus, focusFor, linkEmphasis, filmEmphasis,
    similarity, resonances, shortestPath,
    regionColor, filmColor, filmRadius, linkDash, showTip, hideTip, esc, filmTip, bindFilmEvents,
    views: {},
  };
})();
