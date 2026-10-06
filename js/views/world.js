/*
 * World: films placed where they were made, connections drawn as great-circle
 * arcs — the geography of influence.
 */
(function () {
  const A = window.Atlas;
  let gArcs, gJourney, gFilms, gLabels, gCountries, k = 1;
  let land = null;

  function mount(el) {
    const w = el.clientWidth, h = el.clientHeight;
    const svg = d3.select(el).append("svg").attr("class", "chart").attr("viewBox", [0, 0, w, h])
      .attr("role", "img").attr("aria-label", "World map of films and their connections");
    svg.on("click", () => A.select(null));

    if (!land && window.WORLD_TOPO) land = topojson.feature(WORLD_TOPO, WORLD_TOPO.objects.countries);
    const sphere = { type: "Sphere" };
    const projection = d3.geoNaturalEarth1().fitExtent([[12, 12], [w - 12, h - 12]], sphere);
    const path = d3.geoPath(projection);

    const root = svg.append("g");
    root.append("path").attr("class", "sphere").attr("d", path(sphere));
    root.append("path").attr("class", "graticule").attr("d", path(d3.geoGraticule10()));
    if (land) {
      gCountries = root.append("g").attr("class", "countries").selectAll("path").data(land.features).join("path").attr("d", path);
    }

    // Place films: spiral around their location so co-located films stay legible.
    const groups = d3.group(A.films, (f) => f.lonlat.join(","));
    const pos = new Map();
    groups.forEach((fs) => {
      const [x, y] = projection(fs[0].lonlat);
      fs.slice().sort((a, b) => a.year - b.year).forEach((f, i) => {
        const a = i * 2.39996, r = i ? 6.4 * Math.sqrt(i) : 0;
        pos.set(f.id, [x + Math.cos(a) * r, y + Math.sin(a) * r]);
      });
    });
    const P = (f) => pos.get(f.id);

    // Arcs: geodesic shape, but end exactly at the (spiralled) film positions.
    const arcPath = (a, b) => {
      const [x1, y1] = P(a), [x2, y2] = P(b);
      const dx = x2 - x1, dy = y2 - y1, dist = Math.hypot(dx, dy);
      const lift = Math.min(dist * 0.28, 90);
      const mx = (x1 + x2) / 2 + (-dy / (dist || 1)) * lift, my = (y1 + y2) / 2 + (dx / (dist || 1)) * lift;
      return `M${x1},${y1}Q${mx},${my} ${x2},${y2}`;
    };

    gArcs = root.append("g").attr("class", "links arcs").selectAll("path").data(A.links).join("path")
      .attr("d", (l) => arcPath(l.source, l.target))
      .attr("stroke-dasharray", (l) => A.linkDash[l.type])
      .on("mouseenter", (evt, l) => A.showTip(evt, `<strong>${A.esc(l.source.title)}</strong> (${A.esc(l.source.countryName)}) → <strong>${A.esc(l.target.title)}</strong> (${A.esc(l.target.countryName)})<br>${A.esc(l.note)}`))
      .on("mouseleave", A.hideTip);
    gJourney = root.append("g").attr("class", "journey-layer");
    gFilms = root.append("g").attr("class", "films").selectAll("circle").data(A.films).join("circle")
      .attr("cx", (f) => P(f)[0]).attr("cy", (f) => P(f)[1])
      .attr("r", 4).attr("fill", A.filmColor)
      .call(A.bindFilmEvents);
    gLabels = root.append("g").attr("class", "labels").selectAll("text").data(A.films).join("text")
      .attr("x", (f) => P(f)[0]).attr("y", (f) => P(f)[1]).attr("dy", -8).text((f) => f.title);

    mount.arcPath = arcPath;
    mount.P = P;

    svg.call(d3.zoom().scaleExtent([1, 10]).translateExtent([[0, 0], [w, h]]).on("zoom", (e) => {
      root.attr("transform", e.transform);
      k = e.transform.k;
      restyleScale();
    }));
    update();
  }

  function restyleScale() {
    if (!gFilms) return;
    gFilms.attr("r", 4 / Math.sqrt(k)).attr("stroke-width", 1 / k);
    gArcs.attr("stroke-width", null).style("--sw", 1 / Math.sqrt(k));
    gLabels.attr("font-size", 11 / k).attr("dy", -8 / k);
    gCountries && gCountries.attr("stroke-width", 0.6 / k);
  }

  function update() {
    if (!gFilms) return;
    const fc = A.focus();
    gFilms.attr("data-em", (f) => A.filmEmphasis(f, fc));
    gArcs.attr("display", (l) => (A.linkVisible(l) ? null : "none"))
      .attr("data-type", (l) => l.type)
      .attr("data-em", (l) => A.linkEmphasis(l, fc));
    const few = fc && fc.films.size <= 30;
    gLabels.attr("data-em", (f) => {
      const em = A.filmEmphasis(f, fc);
      return em === 3 ? 3 : em === 2 && few ? 2 : 0;
    });
    gJourney.selectAll("path").data(fc && fc.ordered ? d3.pairs(fc.ordered.map((id) => A.filmById.get(id))) : []).join("path")
      .attr("d", ([a, b]) => mount.arcPath(a, b));
    restyleScale();
  }

  function unmount() { gFilms = gArcs = gLabels = gJourney = gCountries = null; k = 1; }

  A.views.world = {
    caption: "Each dot is a film placed where it was made, coloured by region. Arcs trace connections across borders. Scroll to zoom into crowded regions.",
    mount, update, unmount,
  };
})();
