/*
 * Index: the whole atlas as a sortable table — the accessible, text-first view.
 */
(function () {
  const A = window.Atlas;
  let host, sortKey = "year", sortDir = 1;

  const cols = [
    { key: "title", name: "Film", get: (f) => f.title },
    { key: "year", name: "Year", get: (f) => f.year },
    { key: "director", name: "Director", get: (f) => f.director },
    { key: "country", name: "Country", get: (f) => f.countryName },
    { key: "movement", name: "Movement", get: (f) => A.movementById.get(f.movement).name },
    { key: "concepts", name: "Concepts", get: (f) => f.concepts.map((c) => A.conceptById.get(c).name).join(", ") },
    { key: "values", name: "Values", get: (f) => f.values.map((v) => A.valueById.get(v).name).join(", ") },
    { key: "links", name: "Links", get: (f) => f.neighbors.length },
  ];

  function mount(el) {
    host = d3.select(el).append("div").attr("class", "index-wrap");
    draw();
  }

  function draw() {
    if (!host) return;
    host.selectAll("*").remove();
    const col = cols.find((c) => c.key === sortKey);
    const rows = A.films.filter(A.matches).slice().sort((a, b) => d3.ascending(col.get(a), col.get(b)) * sortDir || a.year - b.year);
    const table = host.append("table").attr("class", "index-table");
    table.append("caption").text(`${rows.length} films`);
    table.append("thead").append("tr").selectAll("th").data(cols).join("th")
      .attr("scope", "col")
      .attr("aria-sort", (c) => (c.key === sortKey ? (sortDir > 0 ? "ascending" : "descending") : "none"))
      .append("button").text((c) => c.name + (c.key === sortKey ? (sortDir > 0 ? " ↑" : " ↓") : ""))
      .on("click", (evt, c) => { sortDir = c.key === sortKey ? -sortDir : 1; sortKey = c.key; draw(); });
    const tr = table.append("tbody").selectAll("tr").data(rows).join("tr")
      .attr("tabindex", 0)
      .on("click", (evt, f) => A.select({ type: "film", id: f.id }))
      .on("keydown", (evt, f) => { if (evt.key === "Enter") A.select({ type: "film", id: f.id }); });
    tr.selectAll("td").data((f) => cols.map((c) => ({ c, f }))).join("td")
      .html(({ c, f }) => c.key === "title"
        ? `<span class="dot" style="background:${A.filmColor(f)}"></span>${A.esc(f.title)}`
        : A.esc(c.get(f)));
    update();
  }

  function update(kind) {
    if (!host) return;
    if (kind === "filter" || kind === "all") return draw();
    const fc = A.focusFor(A.state.selection);
    host.selectAll("tbody tr").classed("is-focus", (f) => !!fc && fc.films.has(f.id)).classed("is-primary", (f) => !!fc && fc.primary === f.id);
  }

  function unmount() { host = null; }

  A.views.index = { caption: "Every film in the atlas. Click a column to sort, a row to open it.", mount, update, unmount };
})();
