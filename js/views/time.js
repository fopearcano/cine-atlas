/*
 * Time: a century of cinema in regional lanes. Arcs show how ideas travel
 * forward through time and across cultures.
 */
(function () {
  const A = window.Atlas;
  let gArcs, gJourney, gFilms, gLabels;
  let layout = null;

  function mount(el) {
    const w = Math.max(el.clientWidth, 720), h = el.clientHeight;
    const m = { top: 28, right: 24, bottom: 34, left: 150 };
    const svg = d3.select(el).append("svg").attr("class", "chart").attr("viewBox", [0, 0, w, h])
      .attr("role", "img").attr("aria-label", "Timeline of films by region with connections");
    svg.on("click", () => A.select(null));

    const x = d3.scaleLinear().domain([1915, 2025]).range([m.left, w - m.right]);
    const lane = d3.scaleBand().domain(A.regions.map((r) => r.id)).range([m.top, h - m.bottom]).paddingInner(0.12);

    // Beeswarm within each lane
    const nodes = A.films.map((f) => ({ f, x: x(f.year), y: lane(f.region) + lane.bandwidth() / 2 }));
    const sim = d3.forceSimulation(nodes)
      .force("x", d3.forceX((d) => x(d.f.year)).strength(1))
      .force("y", d3.forceY((d) => lane(d.f.region) + lane.bandwidth() / 2).strength(0.08))
      .force("collide", d3.forceCollide(5.2)).stop();
    for (let i = 0; i < 200; i++) sim.tick();
    nodes.forEach((d) => {
      const top = lane(d.f.region) + 6, bot = lane(d.f.region) + lane.bandwidth() - 6;
      d.y = Math.max(top, Math.min(bot, d.y));
    });
    layout = new Map(nodes.map((d) => [d.f.id, d]));

    // Decade grid
    const decades = d3.range(1920, 2030, 10);
    svg.append("g").attr("class", "grid").selectAll("line").data(decades).join("line")
      .attr("x1", x).attr("x2", x).attr("y1", m.top - 6).attr("y2", h - m.bottom);
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h - m.bottom + 4})`)
      .call(d3.axisBottom(x).tickValues(decades).tickFormat((d) => d + "s").tickSize(0)).call((g) => g.select(".domain").remove());

    const lanes = svg.append("g").attr("class", "lanes").selectAll("g").data(A.regions).join("g")
      .attr("transform", (r) => `translate(0,${lane(r.id)})`);
    lanes.append("rect").attr("x", m.left - 8).attr("width", w - m.left - m.right + 16).attr("height", lane.bandwidth()).attr("rx", 6);
    lanes.append("circle").attr("cx", 14).attr("cy", lane.bandwidth() / 2).attr("r", 5).attr("fill", (r) => r.color);
    lanes.append("text").attr("x", 26).attr("y", lane.bandwidth() / 2).attr("dy", "0.35em").text((r) => r.name)
      .attr("class", "lane-label")
      .on("click", (evt, r) => { evt.stopPropagation(); A.select({ type: "region", id: r.id }); });

    const arc = (a, b) => {
      const p = layout.get(a.id), q = layout.get(b.id);
      const [s, t] = p.x <= q.x ? [p, q] : [q, p];
      const dx = t.x - s.x, lift = Math.max(18, Math.min(110, dx * 0.45));
      return `M${s.x},${s.y}C${s.x + dx * 0.25},${Math.min(s.y, t.y) - lift} ${t.x - dx * 0.25},${Math.min(s.y, t.y) - lift} ${t.x},${t.y}`;
    };
    mount.arc = arc;

    gArcs = svg.append("g").attr("class", "links").selectAll("path").data(A.links).join("path")
      .attr("d", (l) => arc(l.source, l.target))
      .attr("stroke-dasharray", (l) => A.linkDash[l.type])
      .on("mouseenter", (evt, l) => A.showTip(evt, `<strong>${A.esc(l.source.title)}</strong> (${l.source.year}) → <strong>${A.esc(l.target.title)}</strong> (${l.target.year})<br>${A.esc(l.note)}`))
      .on("mouseleave", A.hideTip);
    gJourney = svg.append("g").attr("class", "journey-layer");
    gFilms = svg.append("g").attr("class", "films").selectAll("circle").data(A.films).join("circle")
      .attr("cx", (f) => layout.get(f.id).x).attr("cy", (f) => layout.get(f.id).y)
      .attr("r", 4.2).attr("fill", A.filmColor).call(A.bindFilmEvents);
    gLabels = svg.append("g").attr("class", "labels").selectAll("text").data(A.films).join("text")
      .attr("x", (f) => layout.get(f.id).x).attr("y", (f) => layout.get(f.id).y).attr("dy", -8).text((f) => `${f.title} (${f.year})`);
    update();
  }

  function update() {
    if (!gFilms) return;
    const fc = A.focus();
    gFilms.attr("data-em", (f) => A.filmEmphasis(f, fc));
    gArcs.attr("display", (l) => (A.linkVisible(l) ? null : "none"))
      .attr("data-type", (l) => l.type)
      .attr("data-em", (l) => A.linkEmphasis(l, fc));
    const few = fc && fc.films.size <= 24;
    gLabels.attr("data-em", (f) => {
      const em = A.filmEmphasis(f, fc);
      return em === 3 ? 3 : em === 2 && few ? 2 : 0;
    });
    gJourney.selectAll("path").data(fc && fc.ordered ? d3.pairs(fc.ordered.map((id) => A.filmById.get(id))) : []).join("path")
      .attr("d", ([a, b]) => mount.arc(a, b));
  }

  function unmount() { gFilms = gArcs = gLabels = gJourney = null; }

  A.views.time = {
    caption: "A century of cinema in eight regional lanes. Arcs carry ideas forward in time and across cultures — follow one from Rome in 1948 to Calcutta, Bahia and Los Angeles.",
    mount, update, unmount,
  };
})();
