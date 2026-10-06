/*
 * Constellation: a force-directed map of films pulled toward the concepts they
 * explore. Concept hubs form the skeleton; film-to-film links are the lineages.
 */
(function () {
  const A = window.Atlas;
  let sim, nodes, conceptNodes, filmNodes, links, conceptEdges, layoutDone = false;
  let root, gLinks, gConceptEdges, gJourney, gBadges, gFilms, gConcepts, gLabels, zoom, k = 1;

  function buildLayout(w, h) {
    conceptNodes = A.concepts.map((c, i) => {
      const a = (i / A.concepts.length) * Math.PI * 2;
      return { kind: "concept", id: "c:" + c.id, concept: c, x: Math.cos(a) * w * 0.32, y: Math.sin(a) * h * 0.32 };
    });
    const cMap = new Map(conceptNodes.map((n) => [n.concept.id, n]));
    const rand = d3.randomLcg(0.42); // seeded, so the constellation looks the same on every visit
    filmNodes = A.films.map((f) => {
      const cs = f.concepts.map((c) => cMap.get(c));
      return { kind: "film", id: f.id, film: f, x: d3.mean(cs, (c) => c.x) + (rand() - 0.5) * 30, y: d3.mean(cs, (c) => c.y) + (rand() - 0.5) * 30 };
    });
    const fMap = new Map(filmNodes.map((n) => [n.id, n]));
    nodes = conceptNodes.concat(filmNodes);
    conceptEdges = [];
    A.films.forEach((f) => f.concepts.forEach((c) => conceptEdges.push({ source: fMap.get(f.id), target: cMap.get(c), film: f })));
    links = A.links.map((l) => ({ link: l, source: fMap.get(l.source.id), target: fMap.get(l.target.id) }));

    sim = d3.forceSimulation(nodes)
      .force("concept", d3.forceLink(conceptEdges).distance(80).strength((e) => 0.55 / e.film.concepts.length))
      .force("film", d3.forceLink(links).distance(45).strength(0.12))
      .force("charge", d3.forceManyBody().strength((n) => (n.kind === "concept" ? -2600 : -50)).distanceMax(520))
      .force("collide", d3.forceCollide((n) => (n.kind === "concept" ? 58 : A.filmRadius(n.film) + 2.5)).iterations(2))
      .force("x", d3.forceX(0).strength(0.03))
      .force("y", d3.forceY(0).strength(0.03))
      .randomSource(d3.randomLcg(0.7))
      .stop();
    for (let i = 0; i < 420; i++) sim.tick();
    layoutDone = true;
  }

  function mount(el) {
    const w = el.clientWidth, h = el.clientHeight;
    if (!layoutDone) buildLayout(w, h);

    const svg = d3.select(el).append("svg").attr("class", "chart").attr("viewBox", [-w / 2, -h / 2, w, h])
      .attr("role", "img").attr("aria-label", "Network of films grouped around concept hubs");
    svg.on("click", () => A.select(null));
    root = svg.append("g");
    zoom = d3.zoom().scaleExtent([0.4, 6]).on("zoom", (e) => {
      root.attr("transform", e.transform);
      k = e.transform.k;
      updateLabels();
      drawJourney();
    });
    svg.call(zoom);

    // Fit layout into view
    const xs = d3.extent(nodes, (n) => n.x), ys = d3.extent(nodes, (n) => n.y);
    const s = Math.min(w / (xs[1] - xs[0] + 120), h / (ys[1] - ys[0] + 80), 1.6);
    svg.call(zoom.transform, d3.zoomIdentity.scale(s).translate(-(xs[0] + xs[1]) / 2, -(ys[0] + ys[1]) / 2));

    gConceptEdges = root.append("g").attr("class", "concept-edges").selectAll("line").data(conceptEdges).join("line");
    gLinks = root.append("g").attr("class", "links").selectAll("line").data(links).join("line")
      .attr("stroke-dasharray", (d) => A.linkDash[d.link.type])
      .on("mouseenter", (evt, d) => A.showTip(evt, linkTip(d.link)))
      .on("mousemove", (evt, d) => A.showTip(evt, linkTip(d.link)))
      .on("mouseleave", A.hideTip);
    gJourney = root.append("g").attr("class", "journey-layer");

    gConcepts = root.append("g").attr("class", "concept-hubs").selectAll("g").data(conceptNodes).join("g")
      .attr("class", "hub")
      .on("click", (evt, d) => { evt.stopPropagation(); A.select({ type: "concept", id: d.concept.id }); })
      .on("mouseenter", (evt, d) => A.showTip(evt, `<strong>${A.esc(d.concept.name)}</strong><br><em>${A.esc(d.concept.q)}</em>`))
      .on("mouseleave", A.hideTip);
    gConcepts.append("circle").attr("r", 7);
    gConcepts.append("text").attr("dy", -12).text((d) => d.concept.name);

    gFilms = root.append("g").attr("class", "films").selectAll("circle").data(filmNodes).join("circle")
      .attr("r", (d) => A.filmRadius(d.film))
      .attr("fill", (d) => A.filmColor(d.film))
      .datum((d) => d) // keep node datum
      .call((s) => s
        .on("mouseenter", (evt, d) => { A.hover(d.id); A.showTip(evt, A.filmTip(d.film)); })
        .on("mousemove", (evt, d) => A.showTip(evt, A.filmTip(d.film)))
        .on("mouseleave", () => { A.hover(null); A.hideTip(); })
        .on("click", (evt, d) => { evt.stopPropagation(); A.hideTip(); A.select({ type: "film", id: d.id }); }));
    gFilms.call(d3.drag()
      .on("start", (evt, d) => { if (!evt.active) sim.alphaTarget(0.15).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (evt, d) => { d.fx = evt.x; d.fy = evt.y; })
      .on("end", (evt, d) => { if (!evt.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    gLabels = root.append("g").attr("class", "labels").selectAll("text").data(filmNodes).join("text")
      .attr("dy", (d) => -A.filmRadius(d.film) - 4).text((d) => d.film.title);
    gBadges = root.append("g").attr("class", "journey-badges");

    sim.on("tick", position);
    position();
    update();
  }

  function linkTip(l) {
    const t = A.LINK_TYPES.find((x) => x.id === l.type);
    return `<span class="tag">${t.name}</span> <strong>${A.esc(l.source.title)}</strong> → <strong>${A.esc(l.target.title)}</strong><br>${A.esc(l.note)}`;
  }

  function position() {
    gConceptEdges.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
    gLinks.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
    gFilms.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    gLabels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    gConcepts.attr("transform", (d) => `translate(${d.x},${d.y})`);
    drawJourney();
  }

  let fc = null;
  function update() {
    if (!gFilms) return;
    fc = A.focus();
    const conceptFocus = fc && fc.concept;
    gFilms
      .attr("data-em", (d) => A.filmEmphasis(d.film, fc))
      .attr("stroke-width", (d) => (A.filmEmphasis(d.film, fc) === 3 ? 2.5 : 1));
    gLinks
      .attr("display", (d) => (A.linkVisible(d.link) ? null : "none"))
      .attr("data-type", (d) => d.link.type)
      .attr("data-em", (d) => A.linkEmphasis(d.link, fc));
    gConceptEdges.attr("data-em", (d) => {
      if (!A.matches(d.film)) return -1;
      if (!fc) return 1;
      if (conceptFocus) return d.target.concept.id === conceptFocus ? 2 : 0;
      return fc.primary === d.film.id ? 2 : 0;
    });
    const activeConcepts = new Set();
    if (fc) fc.films.forEach((id) => A.filmById.get(id).concepts.forEach((c) => activeConcepts.add(c)));
    gConcepts.attr("data-em", (d) => {
      if (A.state.filters.concepts.has(d.concept.id) || conceptFocus === d.concept.id) return 3;
      if (!fc) return 1;
      return activeConcepts.has(d.concept.id) ? 2 : 0;
    });
    updateLabels();
    drawJourney();
  }

  function updateLabels() {
    if (!gLabels) return;
    const few = fc && fc.films.size <= 40;
    gLabels
      .attr("font-size", 11 / Math.sqrt(k))
      .attr("dy", (d) => -A.filmRadius(d.film) - 4 / Math.sqrt(k))
      .attr("data-em", (d) => {
        const em = A.filmEmphasis(d.film, fc);
        if (em === 3) return 3;
        if (em === 2 && few) return 2;
        if (em >= 1 && k > 2.2 && (!fc || em === 2)) return 1;
        return 0;
      });
    gConcepts && gConcepts.select("text").attr("font-size", 12.5 / Math.sqrt(k));
  }

  function drawJourney() {
    if (!gJourney) return;
    const ordered = fc && fc.ordered;
    const pts = ordered ? ordered.map((id) => filmNodes.find((n) => n.id === id)) : [];
    gJourney.selectAll("path").data(ordered ? [pts] : []).join("path")
      .attr("d", (p) => d3.line().curve(d3.curveCatmullRom.alpha(0.5)).x((n) => n.x).y((n) => n.y)(p));
    const r = 7 / Math.sqrt(k);
    const b = gBadges.selectAll("g").data(ordered ? pts : []).join((en) => {
      const g = en.append("g");
      g.append("circle");
      g.append("text");
      return g;
    });
    b.attr("transform", (n) => `translate(${n.x + A.filmRadius(n.film) + r * 0.6},${n.y + A.filmRadius(n.film) + r * 0.6})`)
      .classed("current", (n) => n.id === fc.primary);
    b.select("circle").attr("r", r);
    b.select("text").attr("font-size", 9 / Math.sqrt(k)).attr("dy", "0.35em").text((n, i) => i + 1);
  }

  function unmount() {
    if (sim) sim.on("tick", null).stop();
    gFilms = gLinks = gLabels = gConcepts = gConceptEdges = gJourney = gBadges = null;
  }

  A.views.constellation = {
    caption: "Films gather around the <b>concepts</b> they explore. Lines are connections: <span class=\"key solid\"></span> lineage, <span class=\"key dashed\"></span> dialogue, <span class=\"key dotted\"></span> echo. Hover a film to light its links; scroll to zoom; drag to rearrange.",
    mount, update, unmount,
  };
})();
