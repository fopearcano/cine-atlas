/*
 * Concepts: a chord diagram of how ideas travel together. Ribbons join concepts
 * that share films; the outer ring shows which regions each concept draws from.
 */
(function () {
  const A = window.Atlas;
  let svg, ribbons, groups, ring, hot = null;

  function mount(el) {
    const w = el.clientWidth, h = el.clientHeight;
    const outer = Math.max(110, Math.min(h / 2 - 50, w / 2 - 175));
    const inner = outer - 12;
    svg = d3.select(el).append("svg").attr("class", "chart").attr("viewBox", [-w / 2, -h / 2, w, h])
      .attr("role", "img").attr("aria-label", "Chord diagram of concept co-occurrence");
    svg.on("click", () => A.select(null));
    mount.geom = { outer, inner };
    svg.append("g").attr("class", "chord-ribbons");
    svg.append("g").attr("class", "chord-ring");
    svg.append("g").attr("class", "chord-groups");
    svg.append("text").attr("class", "chord-center").attr("text-anchor", "middle");
    draw();
  }

  function draw() {
    if (!svg) return;
    const { outer, inner } = mount.geom;
    const films = A.films.filter(A.matches);
    const ids = A.concepts.map((c) => c.id);
    const idx = new Map(ids.map((id, i) => [id, i]));
    const M = ids.map(() => ids.map(() => 0));
    films.forEach((f) => {
      f.concepts.forEach((a) => f.concepts.forEach((b) => { if (a !== b) M[idx.get(a)][idx.get(b)] += 1; }));
      if (f.concepts.length === 1) M[idx.get(f.concepts[0])][idx.get(f.concepts[0])] += 1;
    });
    const chords = d3.chord().padAngle(0.025).sortSubgroups(d3.descending)(M);
    const arc = d3.arc().innerRadius(inner).outerRadius(outer);
    const ribbon = d3.ribbon().radius(inner - 2);

    ribbons = svg.select(".chord-ribbons").selectAll("path").data(chords, (d) => d.source.index + "-" + d.target.index).join("path")
      .attr("d", ribbon)
      .on("mouseenter", (evt, d) => {
        const a = A.concepts[d.source.index], b = A.concepts[d.target.index];
        const n = films.filter((f) => f.concepts.includes(a.id) && f.concepts.includes(b.id)).length;
        A.showTip(evt, `<strong>${A.esc(a.name)}</strong> + <strong>${A.esc(b.name)}</strong><br>${n} film${n === 1 ? "" : "s"} explore both`);
      })
      .on("mouseleave", A.hideTip)
      .on("click", (evt, d) => {
        evt.stopPropagation();
        A.setFilter({ concepts: new Set([A.concepts[d.source.index].id, A.concepts[d.target.index].id]) });
      });

    // Outer ring: regional composition of each concept
    const ringArc = d3.arc().innerRadius(outer + 4).outerRadius(outer + 10);
    const segs = [];
    chords.groups.forEach((g) => {
      const c = A.concepts[g.index];
      const fs = films.filter((f) => f.concepts.includes(c.id));
      const total = fs.length || 1;
      let a0 = g.startAngle;
      A.regions.forEach((r) => {
        const n = fs.filter((f) => f.region === r.id).length;
        if (!n) return;
        const a1 = a0 + ((g.endAngle - g.startAngle) * n) / total;
        segs.push({ startAngle: a0, endAngle: a1, region: r, concept: c, n, total });
        a0 = a1;
      });
    });
    ring = svg.select(".chord-ring").selectAll("path").data(segs).join("path")
      .attr("d", ringArc).attr("fill", (d) => d.region.color)
      .on("mouseenter", (evt, d) => A.showTip(evt, `<strong>${A.esc(d.concept.name)}</strong> in <strong>${A.esc(d.region.name)}</strong><br>${d.n} of ${d.total} films`))
      .on("mouseleave", A.hideTip)
      .on("click", (evt, d) => { evt.stopPropagation(); A.select({ type: "cell", dim: "concept", id: d.concept.id, region: d.region.id }); });

    groups = svg.select(".chord-groups").selectAll("g.group").data(chords.groups, (d) => d.index).join((en) => {
      const g = en.append("g").attr("class", "group");
      g.append("path");
      g.append("text");
      return g;
    });
    groups.select("path").attr("d", arc);
    groups.select("text")
      .attr("transform", (d) => {
        const a = (d.startAngle + d.endAngle) / 2;
        const deg = (a * 180) / Math.PI - 90;
        return `rotate(${deg}) translate(${outer + 16}) ${a > Math.PI ? "rotate(180)" : ""}`;
      })
      .attr("text-anchor", (d) => ((d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start"))
      .attr("dy", "0.35em")
      .text((d) => A.concepts[d.index].name);
    groups
      .on("mouseenter", (evt, d) => { hot = d.index; restyle(); A.showTip(evt, `<strong>${A.esc(A.concepts[d.index].name)}</strong><br><em>${A.esc(A.concepts[d.index].q)}</em>`); })
      .on("mouseleave", () => { hot = null; restyle(); A.hideTip(); })
      .on("click", (evt, d) => { evt.stopPropagation(); A.select({ type: "concept", id: A.concepts[d.index].id }); });

    svg.select(".chord-center").selectAll("tspan").data([films.length + " films", "click a concept"]).join("tspan")
      .attr("x", 0).attr("dy", (d, i) => (i ? "1.4em" : "-0.2em")).attr("class", (d, i) => (i ? "muted" : null)).text((d) => d);
    restyle();
  }

  function restyle() {
    if (!ribbons) return;
    const sel = A.state.selection;
    let focusIdx = hot;
    if (focusIdx == null && sel && sel.type === "concept") focusIdx = A.concepts.findIndex((c) => c.id === sel.id);
    const fset = A.state.filters.concepts;
    ribbons.attr("data-em", (d) => {
      if (focusIdx != null && focusIdx >= 0) return d.source.index === focusIdx || d.target.index === focusIdx ? 2 : 0;
      return 1;
    });
    groups.attr("data-em", (d) => {
      const c = A.concepts[d.index].id;
      if (fset.has(c) || d.index === focusIdx) return 3;
      return focusIdx != null && focusIdx >= 0 ? 0 : 1;
    });
    ring.attr("data-em", (d) => (focusIdx != null && focusIdx >= 0 ? (A.concepts[focusIdx] === d.concept ? 2 : 0) : 1));
  }

  function update(kind) {
    if (kind === "filter" || kind === "all") draw();
    else restyle();
  }

  function unmount() { svg = ribbons = groups = ring = null; hot = null; }

  A.views.concepts = {
    caption: "Ribbons join concepts that share films — the thicker, the more often they meet. The outer ring shows which regions each concept draws from. Click a concept for its films around the world; click a ribbon to filter by that pair.",
    mount, update, unmount,
  };
})();
