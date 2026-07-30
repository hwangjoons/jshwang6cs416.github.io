let _worldTopology = null;

async function renderScene1(container, index) {
    const width = 900, height = 500;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    container.append("div").attr("class", "scene-controls").call((c) => {
        c.append("span").attr("class", "control-label").text("Filter by rank: ");
        const group = c.append("div").attr("class", "chip-group");
        group.selectAll("button.chip")
        .data(RANK_FILTER_ORDER)
        .join("button")
        .attr("class", (d) => `chip ${d === state.rankFilter ? "chip-active" : ""}`)
        .text((d) => d)
        .on("click", (event, d) => {
            state.rankFilter = d;
            rerenderSceneSection(index);
        });
    });

    const svgWrap = container.append("div").attr("class", "chart-wrap");
    const svg = svgWrap.append("svg").attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "chart-svg");

    const mapLayer = svg.append("g").attr("class", "map-layer");
    const status = svgWrap.append("div").attr("class", "chart-status").text("Loading world map...");

    const n = MAIN_DATA.length;
    const passesFilter = RANK_FILTERS[state.rankFilter];

    if (state.rankFilter === "All") {
        drawLegend(svgWrap);
    } else {
        drawRankedList(svgWrap, MAIN_DATA, state.rankFilter, n);
    }

    try {
        if (!_worldTopology) {
            _worldTopology = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        }
        status.remove();
    } catch (err) {
        status.text("Could not load world map data.");
        return;
    }

    const countries = topojson.feature(_worldTopology, _worldTopology.objects.countries);
    const dataByMapName = new Map(MAIN_DATA.map((d) => [d.mapName, d]));

    const projection = d3.geoNaturalEarth1().fitSize(
        [width - margin.left - margin.right, height - margin.top - margin.bottom], countries
    );

    const path = d3.geoPath(projection);

    const g = mapLayer.attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("path.country")
        .data(countries.features)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", (d) => {
            const rec = dataByMapName.get(d.properties.name);
            return rec ? HAPPINESS_COLOR(rec.happiness) : INK.surface;
        })
        .attr("opacity", (d) => {
            const rec = dataByMapName.get(d.properties.name);
            if (!rec) return 1;
            return passesFilter(rec, n) ? 1 : 0.15;
        })
        .style("cursor", (d) => (dataByMapName.get(d.properties.name) ? "pointer" : "default"))
        .on("mousemove", (event, d) => {
            const rec = dataByMapName.get(d.properties.name);
            if (!rec) return;
            Tooltip.show({
                title: rec.name,
                rows: [
                    { label: "Happiness", value: `${d3.format(".2f")(rec.happiness)} / 10`},
                    { label: "Rank", value: `#${rec.rank} of ${n}` }
                ]
            }, event);
        })
        .on("mouseleave", () => Tooltip.hide());
}

function drawLegend(wrap) {
    const legend = wrap.append("div").attr("class", "legend");
    legend.append("span").attr("class", "legend-label").text("Happiness score");
    const swatch = legend.append("div").attr("class", "legend-ramp");
    const [low, , , high] = HAPPINESS_COLOR.domain();
    const stops = d3.range(5).map((i) => low + ((high - low) * i) / 4);
    swatch.selectAll("span")
        .data(stops)
        .join("span")
        .style("background", (d) => HAPPINESS_COLOR(d));
    legend.append("span").attr("class", "legend-scale-label").text(`Least happy (${d3.format(".1f")(low)}) → Most happy (${d3.format(".1f")(high)})`);
}

function drawRankedList(wrap, data, rankFilter, n) {
    const passesFilter = RANK_FILTERS[rankFilter];
    const matches = data.filter((d) => passesFilter(d, n)).sort((a, b) => a.rank - b.rank);

    const legend = wrap.append("div").attr("class", "legend legend-rank");
    legend.append("span").attr("class", "legend-label").text(`${rankFilter} happiness scores`);

    const list = legend.append("div").attr("class", "legend-rank-list");
    const rows = list.selectAll("div.legend-rank-row")
        .data(matches)
        .join("div")
        .attr("class", "legend-rank-row");
    
    rows.append("span").attr("class", "legend-rank-name").text((d) => `#${d.rank} ${d.name}`);
    rows.append("span").attr("class", "legend-rank-score").text((d) => d3.format(".2f")(d.happiness));
}
