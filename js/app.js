/*
 * App shell: lenses (filters), view switching, the detail panel, journeys,
 * the path finder and URL state.
 */
(function () {
  const A = window.Atlas;
  const { state, esc } = A;
  const $ = (sel) => document.querySelector(sel);

  const viewEl = $("#view");
  const detail = $("#detail");
  let current = null;

  // ——— Views ———
  function showView(name) {
    if (!A.views[name]) name = "constellation";
    if (current) current.unmount();
    viewEl.innerHTML = "";
    state.view = name;
    current = A.views[name];
    $("#view-caption").innerHTML = current.caption;
    document.querySelectorAll(".tabs [data-view]").forEach((b) => b.setAttribute("aria-selected", b.dataset.view === name));
    viewEl.dataset.view = name;
    current.mount(viewEl);
    syncHash();
  }
  document.querySelectorAll(".tabs [data-view]").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => showView(state.view), 200);
  });

  // ——— Lenses ———
  function chip(label, attrs, color) {
    const b = document.createElement("button");
    b.className = "chip";
    Object.entries(attrs).forEach(([k, v]) => (b.dataset[k] = v));
    b.innerHTML = (color ? `<span class="dot" style="background:${color}"></span>` : "") + esc(label);
    return b;
  }
  function buildLenses() {
    const cc = $("#concept-chips");
    A.concepts.forEach((c) => {
      const b = chip(c.name, { concept: c.id });
      b.title = c.q;
      b.addEventListener("click", () => A.toggleIn("concepts", c.id));
      cc.append(b);
    });
    const vc = $("#value-chips");
    A.values.forEach((v) => {
      const b = chip(v.name, { value: v.id });
      b.title = v.d;
      b.addEventListener("click", () => A.toggleIn("values", v.id));
      vc.append(b);
    });
    const rc = $("#region-chips");
    A.regions.forEach((r) => {
      const b = chip(r.name, { region: r.id }, r.color);
      b.addEventListener("click", () => A.toggleIn("regions", r.id));
      rc.append(b);
    });
    const lt = $("#link-types");
    A.LINK_TYPES.forEach((t) => {
      const l = document.createElement("label");
      l.className = "link-type";
      l.innerHTML = `<input type="checkbox" checked data-type="${t.id}"><span class="key ${t.id === "influence" ? "solid" : t.id === "dialogue" ? "dashed" : "dotted"}"></span><span><b>${t.name}</b><br><small>${t.d}</small></span>`;
      l.querySelector("input").addEventListener("change", (e) => {
        const s = state.filters.linkTypes;
        e.target.checked ? s.add(t.id) : s.delete(t.id);
        A.setFilter({});
      });
      lt.append(l);
    });
    const ymin = $("#year-min"), ymax = $("#year-max");
    const applyYears = () => {
      let a = +ymin.value || state.filters.yearMin, b = +ymax.value || state.filters.yearMax;
      if (a > b) [a, b] = [b, a];
      A.setFilter({ yearMin: a, yearMax: b });
    };
    ymin.addEventListener("change", applyYears);
    ymax.addEventListener("change", applyYears);

    // Decade histogram doubles as a quick era picker
    const dec = $("#decades");
    const counts = d3.rollup(A.films, (v) => v.length, (f) => Math.floor(f.year / 10) * 10);
    const max = d3.max(counts.values());
    d3.range(1920, 2030, 10).forEach((d) => {
      const b = document.createElement("button");
      b.className = "decade";
      b.dataset.decade = d;
      b.title = `${d}s · ${counts.get(d) || 0} films`;
      b.innerHTML = `<span style="height:${((counts.get(d) || 0) / max) * 100}%"></span><small>${String(d).slice(2)}</small>`;
      b.addEventListener("click", () => {
        const f = state.filters;
        const isOnly = f.yearMin === d && f.yearMax === d + 9;
        A.setFilter(isOnly ? { yearMin: 1910, yearMax: 2030 } : { yearMin: d, yearMax: d + 9 });
      });
      dec.append(b);
    });

    const jl = $("#journey-list");
    A.journeys.forEach((j) => {
      const li = document.createElement("li");
      li.innerHTML = `<button data-journey="${j.id}"><b>${esc(j.title)}</b><small>${j.steps.length} films</small></button>`;
      li.querySelector("button").addEventListener("click", () => startJourney(j.id));
      jl.append(li);
    });

    $("#reset").addEventListener("click", () => { A.resetFilters(); A.select(null); });
    const dl = $("#film-list");
    A.films.slice().sort((a, b) => a.title.localeCompare(b.title)).forEach((f) => {
      const o = document.createElement("option");
      o.value = `${f.title} (${f.year})`;
      o.label = `${f.director} · ${f.countryName}`;
      dl.append(o);
    });
  }

  function syncLenses() {
    const f = state.filters;
    document.querySelectorAll("[data-concept].chip").forEach((b) => b.setAttribute("aria-pressed", f.concepts.has(b.dataset.concept)));
    document.querySelectorAll("[data-value].chip").forEach((b) => b.setAttribute("aria-pressed", f.values.has(b.dataset.value)));
    document.querySelectorAll("[data-region].chip").forEach((b) => b.setAttribute("aria-pressed", f.regions.has(b.dataset.region)));
    document.querySelectorAll("#decades .decade").forEach((b) => {
      const d = +b.dataset.decade;
      b.classList.toggle("in-range", d + 9 >= f.yearMin && d <= f.yearMax);
    });
    $("#year-min").value = f.yearMin;
    $("#year-max").value = f.yearMax;
    document.querySelectorAll("#link-types input").forEach((i) => (i.checked = f.linkTypes.has(i.dataset.type)));
    const n = A.matchCount();
    $("#match-count").textContent = A.filtersActive() ? `${n} of ${A.films.length} films match` : `${A.films.length} films · ${A.links.length} connections`;
    document.querySelectorAll(".journey-list button").forEach((b) =>
      b.setAttribute("aria-pressed", !!state.selection && state.selection.type === "journey" && state.selection.journey === b.dataset.journey));
  }

  // ——— Search ———
  $("#search").addEventListener("change", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    const f = A.films.find((d) => `${d.title} (${d.year})`.toLowerCase() === q) ||
      A.films.find((d) => d.title.toLowerCase().includes(q) || (d.orig || "").toLowerCase().includes(q)) ||
      A.films.find((d) => d.director.toLowerCase().includes(q));
    if (f) { A.select({ type: "film", id: f.id }); e.target.value = ""; e.target.blur(); }
  });

  // ——— Journeys & paths ———
  function startJourney(id, index = 0) {
    const j = A.journeys.find((x) => x.id === id);
    A.select({ type: "journey", journey: id, steps: j.steps, index });
  }
  function stepJourney(delta) {
    const s = state.selection;
    if (!s || (s.type !== "journey" && s.type !== "path")) return;
    const i = Math.max(0, Math.min(s.steps.length - 1, (s.index || 0) + delta));
    A.select(Object.assign({}, s, { index: i }));
  }

  // ——— Detail panel ———
  const filmBtn = (f, extra = "") =>
    `<button class="film-link" data-film="${f.id}"><span class="dot" style="background:${A.filmColor(f)}"></span>${esc(f.title)}<small>${f.year} · ${esc(f.countryName)}${extra}</small></button>`;
  const conceptChip = (id) => `<button class="chip" data-goto-concept="${id}">${esc(A.conceptById.get(id).name)}</button>`;
  const valueChip = (id) => `<button class="chip value" data-goto-value="${id}">${esc(A.valueById.get(id).name)}</button>`;
  const regionChip = (id) => { const r = A.regionById.get(id); return `<button class="chip" data-goto-region="${id}"><span class="dot" style="background:${r.color}"></span>${esc(r.name)}</button>`; };
  const typeName = (t) => A.LINK_TYPES.find((x) => x.id === t).name;
  const keyClass = (t) => (t === "influence" ? "solid" : t === "dialogue" ? "dashed" : "dotted");

  function filmsByRegion(fs) {
    return A.regions.map((r) => {
      const list = fs.filter((f) => f.region === r.id).sort((a, b) => a.year - b.year);
      if (!list.length) return "";
      return `<h4><span class="dot" style="background:${r.color}"></span>${esc(r.name)} <small>${list.length}</small></h4><div class="film-list">${list.map((f) => filmBtn(f)).join("")}</div>`;
    }).join("");
  }
  function topCounts(fs, key, lookup, n, exclude) {
    const counts = d3.rollups(fs.flatMap((f) => f[key]).filter((x) => x !== exclude), (v) => v.length, (d) => d)
      .sort((a, b) => b[1] - a[1]).slice(0, n);
    return counts.map(([id, c]) => ({ id, c, item: lookup.get(id) }));
  }
  function barList(items, total, attr) {
    return `<ul class="bars">${items.map(({ id, c, item }) =>
      `<li><button data-${attr}="${id}"><span class="bar-label">${esc(item.name)}</span><span class="bar"><span style="width:${(c / total) * 100}%"></span></span><span class="bar-n">${c}</span></button></li>`).join("")}</ul>`;
  }

  function renderAbout() {
    const crossLinks = A.links.filter((l) => l.source.region !== l.target.region).length;
    return `
      <div class="about">
        <p class="eyebrow">An atlas of world cinema</p>
        <h2>Films as a conversation across cultures</h2>
        <p>Cine Atlas maps <b>${A.films.length} films</b> from <b>${new Set(A.films.map((f) => f.country)).size} countries</b> not by box office or canon rank, but by the <b>questions</b> they ask and the <b>values</b> they put at stake — and by the <b>${A.links.length} connections</b> that bind them, ${crossLinks} of which cross regional borders.</p>
        <h3>How to read it</h3>
        <ul class="legend-list">
          <li><span class="key solid"></span><b>Lineage</b> — documented influence or continuity: a filmmaker's own words, a dedication, shared crew.</li>
          <li><span class="key dashed"></span><b>Dialogue</b> — one film answers, rewrites or continues another.</li>
          <li><span class="key dotted"></span><b>Echo</b> — a curatorial rhyme across cultures, offered as an invitation to compare.</li>
        </ul>
        <div class="chips">${A.regions.map((r) => regionChip(r.id)).join("")}</div>
        <h3>Start somewhere</h3>
        <div class="start">
          ${A.journeys.slice(0, 4).map((j) => `<button class="start-card" data-journey="${j.id}"><b>${esc(j.title)}</b><small>${esc(j.intro)}</small></button>`).join("")}
        </div>
        <p><button class="text-btn" data-surprise>Surprise me with a film →</button></p>
        <p class="fine">A curated, partial and arguable map. Every link has a note — hover any line to read it.</p>
      </div>`;
  }

  function renderFilm(f) {
    const mv = A.movementById.get(f.movement);
    const enabled = f.neighbors.filter((n) => state.filters.linkTypes.has(n.link.type));
    const groups = A.LINK_TYPES.map((t) => {
      const ns = enabled.filter((n) => n.link.type === t.id).sort((a, b) => a.film.year - b.film.year);
      if (!ns.length) return "";
      return `<h4><span class="key ${keyClass(t.id)}"></span>${t.name}</h4><ul class="conn">${ns.map((n) =>
        `<li>${filmBtn(n.film, n.link.source === f ? " · from this film" : " · into this film")}<p>${esc(n.link.note)}</p></li>`).join("")}</ul>`;
    }).join("");
    const res = A.resonances(f);
    const options = A.films.filter((x) => x !== f).sort((a, b) => a.title.localeCompare(b.title))
      .map((x) => `<option value="${x.id}">${esc(x.title)} (${x.year})</option>`).join("");
    return `
      <article class="film">
        <p class="eyebrow"><span class="dot" style="background:${A.filmColor(f)}"></span>${esc(f.countryName)} · ${f.year}</p>
        <h2>${esc(f.title)}</h2>
        ${f.orig ? `<p class="orig">${esc(f.orig)}</p>` : ""}
        <p class="director">${esc(f.director)}</p>
        <p class="logline">${esc(f.logline)}</p>
        <p class="movement">Movement: <button class="text-btn" data-goto-movement="${f.movement}">${esc(mv.name)}</button> <small>${esc(mv.years)}</small></p>
        <h3>Concepts</h3><div class="chips">${f.concepts.map(conceptChip).join("")}</div>
        <h3>Values at stake</h3><div class="chips">${f.values.map(valueChip).join("")}</div>
        <h3>Connections <small>${enabled.length}</small></h3>
        ${groups || `<p class="muted">No connections of the enabled types.</p>`}
        <h3>Resonances across cultures</h3>
        <p class="hint">Unlinked films from other regions that share the most concepts and values — computed, not curated.</p>
        <ul class="conn">${res.map((r) => {
          const shared = r.film.concepts.filter((c) => f.concepts.includes(c)).map((c) => A.conceptById.get(c).name)
            .concat(r.film.values.filter((v) => f.values.includes(v)).map((v) => A.valueById.get(v).name));
          return `<li>${filmBtn(r.film)}<p>Shares ${esc(shared.join(", ") || "little")}.</p></li>`;
        }).join("")}</ul>
        <h3>Find a path</h3>
        <p class="hint">The shortest chain of connections from this film to another.</p>
        <div class="pathfinder"><select id="path-to" aria-label="Destination film"><option value="">Choose a film…</option>${options}</select><button class="btn" id="path-go">Trace</button></div>
        <p class="muted" id="path-msg"></p>
      </article>`;
  }

  function renderGroup(title, eyebrow, body, fs, extra = "") {
    return `<article class="group">
      <p class="eyebrow">${eyebrow}</p><h2>${esc(title)}</h2>${body}${extra}
      <h3>${fs.length} film${fs.length === 1 ? "" : "s"} across ${new Set(fs.map((f) => f.region)).size} region${new Set(fs.map((f) => f.region)).size === 1 ? "" : "s"}</h3>
      ${filmsByRegion(fs)}</article>`;
  }

  function renderConcept(c) {
    const fs = A.films.filter((f) => f.concepts.includes(c.id));
    const related = topCounts(fs, "concepts", A.conceptById, 5, c.id);
    const vals = topCounts(fs, "values", A.valueById, 5);
    const body = `<p class="question">${esc(c.q)}</p><p>${esc(c.d)}</p>
      <p><button class="btn" data-filter-concept="${c.id}">${state.filters.concepts.has(c.id) ? "Remove from lens" : "Use as a lens"}</button></p>
      <h3>Travels with</h3>${barList(related, fs.length, "goto-concept")}
      <h3>Values at stake</h3>${barList(vals, fs.length, "goto-value")}`;
    return renderGroup(c.name, "Concept", body, fs);
  }
  function renderValue(v) {
    const fs = A.films.filter((f) => f.values.includes(v.id));
    const cs = topCounts(fs, "concepts", A.conceptById, 6);
    const body = `<p class="question">${esc(v.d)}</p>
      <p><button class="btn" data-filter-value="${v.id}">${state.filters.values.has(v.id) ? "Remove from lens" : "Use as a lens"}</button></p>
      <h3>Explored through</h3>${barList(cs, fs.length, "goto-concept")}`;
    return renderGroup(v.name, "Value at stake", body, fs);
  }
  function renderRegion(r) {
    const fs = A.films.filter((f) => f.region === r.id);
    const out = A.links.filter((l) => (l.source.region === r.id) !== (l.target.region === r.id));
    const partners = d3.rollups(out, (v) => v.length, (l) => (l.source.region === r.id ? l.target.region : l.source.region)).sort((a, b) => b[1] - a[1]);
    const body = `<h3>Most explored concepts</h3>${barList(topCounts(fs, "concepts", A.conceptById, 5), fs.length, "goto-concept")}
      <h3>Values at stake</h3>${barList(topCounts(fs, "values", A.valueById, 5), fs.length, "goto-value")}
      <h3>Conversations with other regions <small>${out.length}</small></h3>
      <div class="chips">${partners.map(([id, n]) => regionChip(id).replace("</button>", ` <small>${n}</small></button>`)).join("")}</div>
      <p><button class="btn" data-filter-region="${r.id}">${state.filters.regions.has(r.id) ? "Remove from lens" : "Use as a lens"}</button></p>`;
    return renderGroup(r.name, `<span class="dot" style="background:${r.color}"></span>Region`, body, fs);
  }
  function renderMovement(m) {
    const fs = A.films.filter((f) => f.movement === m.id);
    return renderGroup(m.name, `Movement · ${esc(m.years)}`, `<p>${esc(m.d)}</p>`, fs);
  }
  function renderCell(sel) {
    const item = sel.dim === "value" ? A.valueById.get(sel.id) : A.conceptById.get(sel.id);
    const r = A.regionById.get(sel.region);
    const key = sel.dim === "value" ? "values" : "concepts";
    const fs = A.films.filter((f) => f.region === sel.region && f[key].includes(sel.id));
    const elsewhere = A.films.filter((f) => f.region !== sel.region && f[key].includes(sel.id));
    return `<article class="group"><p class="eyebrow"><span class="dot" style="background:${r.color}"></span>${esc(r.name)}</p>
      <h2>${esc(item.name)}</h2><p class="question">${esc(item.q || item.d)}</p>
      <h3>In ${esc(r.name)}</h3><div class="film-list">${fs.sort((a, b) => a.year - b.year).map((f) => filmBtn(f)).join("")}</div>
      <h3>The same ${sel.dim} elsewhere</h3>${filmsByRegion(elsewhere)}</article>`;
  }
  function renderSequence(sel) {
    const isJourney = sel.type === "journey";
    const j = isJourney ? A.journeys.find((x) => x.id === sel.journey) : null;
    const i = sel.index || 0;
    const f = A.filmById.get(sel.steps[i]);
    const steps = sel.steps.map((id, n) => {
      const s = A.filmById.get(id);
      const next = sel.steps[n + 1];
      const l = next && A.linkByPair.get(A.pairKey(id, next));
      const bridge = next ? (l
        ? `<p class="bridge"><span class="key ${keyClass(l.type)}"></span>${typeName(l.type)}: ${esc(l.note)}</p>`
        : `<p class="bridge muted">↓ ${esc(sharedLine(s, A.filmById.get(next)))}</p>`) : "";
      return `<li class="${n === i ? "current" : ""}"><button class="step" data-step="${n}"><span class="n">${n + 1}</span>${esc(s.title)}<small>${s.year} · ${esc(s.countryName)}</small></button>${bridge}</li>`;
    }).join("");
    return `<article class="sequence">
      <p class="eyebrow">${isJourney ? "Journey" : "Path of connections"}</p>
      <h2>${isJourney ? esc(j.title) : `${esc(A.filmById.get(sel.steps[0]).title)} → ${esc(A.filmById.get(sel.steps[sel.steps.length - 1]).title)}`}</h2>
      ${isJourney ? `<p>${esc(j.intro)}</p>` : `<p>${sel.steps.length - 1} step${sel.steps.length === 2 ? "" : "s"} apart.</p>`}
      <div class="stepper"><button class="btn" data-prev ${i === 0 ? "disabled" : ""}>← Previous</button><span>${i + 1} / ${sel.steps.length}</span><button class="btn" data-next ${i === sel.steps.length - 1 ? "disabled" : ""}>Next →</button></div>
      <div class="step-card">
        <p class="eyebrow"><span class="dot" style="background:${A.filmColor(f)}"></span>${esc(f.countryName)} · ${f.year} · ${esc(f.director)}</p>
        <h3>${esc(f.title)}</h3><p>${esc(f.logline)}</p>
        <div class="chips">${f.concepts.map(conceptChip).join("")}${f.values.map(valueChip).join("")}</div>
        <button class="text-btn" data-film="${f.id}">Open film →</button>
      </div>
      <ol class="steps">${steps}</ol></article>`;
  }
  function sharedLine(a, b) {
    const c = a.concepts.filter((x) => b.concepts.includes(x)).map((x) => A.conceptById.get(x).name);
    const v = a.values.filter((x) => b.values.includes(x)).map((x) => A.valueById.get(x).name);
    const all = c.concat(v);
    if (a.movement === b.movement) all.unshift(A.movementById.get(a.movement).name);
    else if (a.director === b.director) all.unshift(`same director, ${a.director}`);
    return all.length ? `Shared ground: ${all.join(", ")}` : "A leap — what do they share?";
  }

  function renderDetail() {
    const s = state.selection;
    let html;
    if (!s) html = renderAbout();
    else if (s.type === "film") html = renderFilm(A.filmById.get(s.id));
    else if (s.type === "concept") html = renderConcept(A.conceptById.get(s.id));
    else if (s.type === "value") html = renderValue(A.valueById.get(s.id));
    else if (s.type === "region") html = renderRegion(A.regionById.get(s.id));
    else if (s.type === "movement") html = renderMovement(A.movementById.get(s.id));
    else if (s.type === "cell") html = renderCell(s);
    else html = renderSequence(s);
    const close = s ? `<button class="icon-btn close" data-close aria-label="Close details">×</button>` : "";
    detail.innerHTML = close + html;
    detail.scrollTop = 0;
    detail.classList.toggle("has-selection", !!s);
  }

  detail.addEventListener("click", (e) => {
    const t = e.target.closest("button, [data-film]");
    if (!t) return;
    const d = t.dataset;
    if (d.close !== undefined) return A.select(null);
    if (d.film) return A.select({ type: "film", id: d.film });
    if (d.gotoConcept) return A.select({ type: "concept", id: d.gotoConcept });
    if (d.gotoValue) return A.select({ type: "value", id: d.gotoValue });
    if (d.gotoRegion) return A.select({ type: "region", id: d.gotoRegion });
    if (d.gotoMovement) return A.select({ type: "movement", id: d.gotoMovement });
    if (d.filterConcept) { A.toggleIn("concepts", d.filterConcept); return renderDetail(); }
    if (d.filterValue) { A.toggleIn("values", d.filterValue); return renderDetail(); }
    if (d.filterRegion) { A.toggleIn("regions", d.filterRegion); return renderDetail(); }
    if (d.journey) return startJourney(d.journey);
    if (d.step) return A.select(Object.assign({}, state.selection, { index: +d.step }));
    if (d.prev !== undefined) return stepJourney(-1);
    if (d.next !== undefined) return stepJourney(1);
    if (d.surprise !== undefined) return A.select({ type: "film", id: A.films[Math.floor(Math.random() * A.films.length)].id });
    if (t.id === "path-go") {
      const to = $("#path-to").value;
      if (!to) return;
      const p = A.shortestPath(state.selection.id, to);
      if (p) A.select({ type: "path", steps: p, index: 0 });
      else $("#path-msg").textContent = "No chain of enabled connections links these films — try enabling all connection types.";
    }
  });
  // Hovering a film in the panel lights it in the view.
  detail.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-film]");
    A.hover(t ? t.dataset.film : null);
  });
  detail.addEventListener("mouseleave", () => A.hover(null));

  // ——— URL state ———
  function syncHash() {
    const s = state.selection;
    let h = state.view;
    if (s) {
      if (s.type === "journey") h += `/journey/${s.journey}/${(s.index || 0) + 1}`;
      else if (s.type === "film" || s.type === "concept" || s.type === "value" || s.type === "region" || s.type === "movement") h += `/${s.type}/${s.id}`;
    }
    history.replaceState(null, "", "#" + h);
  }
  function readHash() {
    const [view, type, id, step] = location.hash.slice(1).split("/");
    const lookups = { film: A.filmById, concept: A.conceptById, value: A.valueById, region: A.regionById, movement: A.movementById };
    let sel = null;
    if (type === "journey" && A.journeys.some((j) => j.id === id)) {
      const j = A.journeys.find((x) => x.id === id);
      sel = { type: "journey", journey: id, steps: j.steps, index: Math.max(0, Math.min(j.steps.length - 1, (+step || 1) - 1)) };
    } else if (lookups[type] && lookups[type].has(id)) sel = { type, id };
    return { view: A.views[view] ? view : "constellation", sel };
  }

  window.addEventListener("hashchange", () => {
    const { view, sel } = readHash();
    if (view !== state.view) showView(view);
    A.select(sel);
  });

  // ——— Keyboard ———
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, select, textarea")) return;
    if (e.key === "Escape") A.select(null);
    if (e.key === "ArrowRight") stepJourney(1);
    if (e.key === "ArrowLeft") stepJourney(-1);
    if (e.key === "/") { e.preventDefault(); $("#search").focus(); }
  });

  // ——— Mobile lens drawer ———
  const lens = $("#lens"), toggle = $("#toggle-lens");
  toggle.addEventListener("click", () => {
    const open = !lens.classList.contains("open");
    lens.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
  });
  document.querySelector(".stage").addEventListener("click", () => {
    lens.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  });

  // ——— Wire up ———
  A.on((kind) => {
    if (kind !== "hover") {
      syncLenses();
      renderDetail();
      syncHash();
    }
    current && current.update(kind);
  });

  buildLenses();
  const init = readHash();
  state.selection = init.sel;
  showView(init.view);
  syncLenses();
  renderDetail();
})();
