/*
 * Patterns: which values and concepts each region's films put at stake.
 * Shares are computed over this atlas's curated sample, not over cultures as wholes.
 */
(function () {
  const A = window.Atlas;
  let host, cells;

  const color = d3.scaleLinear().domain([0, 0.15, 0.45]).range(["#22221f", "#1c5cab", "#b7d3f6"]).clamp(true);

  function mount(el) {
    host = d3.select(el).append("div").attr("class", "patterns");
    draw();
  }

  function heatmap(container, title, sub, rows, key, dim) {
    const films = A.films.filter(A.matches);
    const byRegion = d3.group(films, (f) => f.region);
    const cell = 30, labelW = 190, headH = 140;
    const w = labelW + A.regions.length * (cell + 2) + 110, h = headH + rows.length * (cell + 2) + 4;

    const block = container.append("section").attr("class", "heat-block");
    block.append("h3").text(title);
    block.append("p").attr("class", "hint").text(sub);
    const svg = block.append("svg").attr("class", "chart heatmap").attr("viewBox", [0, 0, w, h]).attr("width", w).attr("height", h)
      .attr("role", "img").attr("aria-label", title);

    svg.append("g").selectAll("text").data(A.regions).join("text")
      .attr("class", "col-label")
      .attr("transform", (r, i) => `translate(${labelW + i * (cell + 2) + cell / 2},${headH - 8}) rotate(-50)`)
      .text((r) => `${r.name} (${(byRegion.get(r.id) || []).length})`)
      .on("click", (evt, r) => A.select({ type: "region", id: r.id }));
    svg.append("g").selectAll("circle").data(A.regions).join("circle")
      .attr("cx", (r, i) => labelW + i * (cell + 2) + cell / 2).attr("cy", headH - 2).attr("r", 3).attr("fill", (r) => r.color);

    const rowG = svg.append("g").selectAll("g").data(rows).join("g")
      .attr("transform", (r, i) => `translate(0,${headH + 4 + i * (cell + 2)})`);
    rowG.append("text").attr("class", "row-label").attr("x", labelW - 10).attr("y", cell / 2).attr("dy", "0.35em").attr("text-anchor", "end")
      .text((r) => r.name)
      .on("click", (evt, r) => A.select({ type: dim, id: r.id }));

    const data = [];
    rows.forEach((row, ri) => A.regions.forEach((reg, ci) => {
      const fs = byRegion.get(reg.id) || [];
      const n = fs.filter((f) => f[key].includes(row.id)).length;
      data.push({ row, reg, ri, ci, n, total: fs.length, share: fs.length ? n / fs.length : 0, dim });
    }));
    const c = svg.append("g").selectAll("rect").data(data).join("rect")
      .attr("class", "cell")
      .attr("x", (d) => labelW + d.ci * (cell + 2)).attr("y", (d) => headH + 4 + d.ri * (cell + 2))
      .attr("width", cell).attr("height", cell).attr("rx", 4)
      .attr("fill", (d) => (d.total ? color(d.share) : "transparent"))
      .on("mouseenter", (evt, d) => A.showTip(evt, `<strong>${A.esc(d.row.name)}</strong> · ${A.esc(d.reg.name)}<br>${d.n} of ${d.total} films (${Math.round(d.share * 100)}%)`))
      .on("mouseleave", A.hideTip)
      .on("click", (evt, d) => d.n && A.select({ type: "cell", dim, id: d.row.id, region: d.reg.id }));
    return c;
  }

  function draw() {
    if (!host) return;
    host.selectAll("*").remove();
    const intro = host.append("div").attr("class", "patterns-intro");
    intro.append("p").html("Each cell is the share of a region's films in this atlas that put a value or concept at stake. " +
      "Read it as a portrait of <em>this curated selection</em>, an invitation to ask why patterns appear — not as a verdict on any culture.");
    const legend = intro.append("div").attr("class", "ramp-legend");
    legend.append("span").text("0%");
    legend.append("span").attr("class", "ramp").style("background", `linear-gradient(90deg, ${d3.range(0, 0.46, 0.045).map(color).join(",")})`);
    legend.append("span").text("45%+");
    const grid = host.append("div").attr("class", "heat-grid");
    const a = heatmap(grid, "Values × Regions", "Which values do films from each region put at stake?", A.values, "values", "value");
    const b = heatmap(grid, "Concepts × Regions", "Which questions do they ask?", A.concepts, "concepts", "concept");
    cells = a.merge(b);
    update("selection");
  }

  function update(kind) {
    if (!host) return;
    if (kind === "filter" || kind === "all") return draw();
    const sel = A.state.selection;
    cells.attr("data-em", (d) => {
      if (!sel) return 1;
      if (sel.type === "cell") return sel.dim === d.dim && sel.id === d.row.id && sel.region === d.reg.id ? 3 : 0;
      if (sel.type === d.dim) return sel.id === d.row.id ? 2 : 0;
      if (sel.type === "region") return sel.id === d.reg.id ? 2 : 0;
      return 1;
    });
  }

  function unmount() { host = cells = null; }

  A.views.patterns = {
    caption: "Values and concepts by region. Click a cell to see the films behind it.",
    mount, update, unmount,
  };
})();
