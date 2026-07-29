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

    drawLegend(svgWrap);

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
    const n = MAIN_DATA.length;
    const passesFilter = RANK_FILTERS[state.rankFilter];

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

    const sorted = [...MAIN_DATA].sort((a, b) => b.happiness - a.happiness);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    function centroidFor (record) {
        const feature = countries.features.find((f) => f.properties.name === record.mapName);
        if (!feature) return null;
        return path.centroid(feature);
    }

    const topXY = centroidFor(top)
    const bottomXY = centroidFor(bottom);
    const annotations = [];
    if (topXY) {
        annotations.push({
            note: { title: top.name, label: `Highest happiness score: ${top.happiness.toFixed(1)} / 10`, wrap: 150},
            x: topXY[0], y: topXY[1], dx: - 50, dy: 40,
            color: INK.primary
        });
    }
    drawAnnotations(mapLayer, annotations);
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
    legend.append("span").attr("class", "legend-scale-label").text(`${d3.format(".1f")(low)} -> ${d3.format(".1f")(high)}`)
}