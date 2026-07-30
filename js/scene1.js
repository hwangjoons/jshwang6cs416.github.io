let _worldTopology = null;

async function renderScene1(container, index) {
    const width = 900, height = 500;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const n = MAIN_DATA.length;

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

    renderRankRangeSlider(container, n, state.rankRange, (newRange) => {
        state.rankRange = newRange;
        scheduleUpdate();
    });

    function combinedPasses(d) {
        return RANK_FILTERS[state.rankFilter](d, n)
            && d.rank >= state.rankRange[0]
            && d.rank <= state.rankRange[1];
    }

    function isDefaultFilter() {
        return state.rankFilter === "All" && state.rankRange[0] === 1 && state.rankRange[1] === n;
    }

    const svgWrap = container.append("div").attr("class", "chart-wrap");
    const svg = svgWrap.append("svg").attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "chart-svg");

    const mapLayer = svg.append("g").attr("class", "map-layer");
    const status = svgWrap.append("div").attr("class", "chart-status").text("Loading world map...");

    const listArea = svgWrap.append("div");

    let countryPaths = null;
    let dataByMapName = null;

    function updateMapOpacity() {
        if (!countryPaths) return;
        countryPaths.attr("opacity", (d) => {
            const rec = dataByMapName.get(d.properties.name);
            if (!rec) return 1;
            return combinedPasses(rec) ? 1 : 0.15;
        });
    }

    function updateListArea() {
        listArea.selectAll("*").remove();
        if (isDefaultFilter()) {
            drawLegend(listArea);
            return;
        }
        const matches = MAIN_DATA.filter(combinedPasses).sort((a, b) => a.rank - b.rank);
        const parts = [];
        if (state.rankFilter !== "All") parts.push(state.rankFilter);
        if (!(state.rankRange[0] === 1 && state.rankRange[1] === n)) {
            parts.push(`Ranks ${state.rankRange[0]}–${state.rankRange[1]}`);
        }
        drawRankedList(listArea, matches, `${parts.join(" · ")} (${matches.length} countries)`);
    }

    updateListArea();

    let rafPending = false;
    function scheduleUpdate() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;
            updateMapOpacity();
            updateListArea();
        });
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
    dataByMapName = new Map(MAIN_DATA.map((d) => [d.mapName, d]));

    const projection = d3.geoNaturalEarth1().fitSize(
        [width - margin.left - margin.right, height - margin.top - margin.bottom], countries
    );

    const path = d3.geoPath(projection);

    const g = mapLayer.attr("transform", `translate(${margin.left},${margin.top})`);

    countryPaths = g.selectAll("path.country")
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

    updateMapOpacity();
}

function renderRankRangeSlider(container, n, range, onChange) {
    const wrap = container.append("div").attr("class", "rank-slider-container");

    const heading = wrap.append("span").attr("class", "rank-slider-heading");
    function updateHeading(r) {
        heading.text(`Custom rank range: ${r[0]}–${r[1]} (${r[1] - r[0] + 1} countries)`);
    }
    updateHeading(range);

    const slider = wrap.append("div").attr("class", "rank-slider");
    const track = slider.append("div").attr("class", "rank-slider-track");
    const highlight = track.append("div").attr("class", "rank-slider-range");

    function updateHighlight(r) {
        const loPct = ((r[0] - 1) / (n - 1)) * 100;
        const hiPct = ((r[1] - 1) / (n - 1)) * 100;
        highlight.style("left", `${loPct}%`).style("width", `${Math.max(hiPct - loPct, 0)}%`);
    }
    updateHighlight(range);

    let current = [range[0], range[1]];

    const minInput = slider.append("input")
        .attr("type", "range")
        .attr("class", "rank-slider-input rank-slider-min")
        .attr("min", 1).attr("max", n).attr("step", 1)
        .property("value", range[0])
        .on("input", function () {
            const lo = Math.min(Number(this.value), current[1]);
            this.value = lo;
            current = [lo, current[1]];
            updateHighlight(current);
            updateHeading(current);
            onChange(current);
        });

    const maxInput = slider.append("input")
        .attr("type", "range")
        .attr("class", "rank-slider-input rank-slider-max")
        .attr("min", 1).attr("max", n).attr("step", 1)
        .property("value", range[1])
        .on("input", function () {
            const hi = Math.max(Number(this.value), current[0]);
            this.value = hi;
            current = [current[0], hi];
            updateHighlight(current);
            updateHeading(current);
            onChange(current);
        });

    const endpoints = wrap.append("div").attr("class", "rank-slider-endpoints");
    endpoints.append("span").text("1");
    endpoints.append("span").text(n);
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
    legend.append("span").attr("class", "legend-scale-label")
        .text(`Least happy (${d3.format(".1f")(low)}) → Most happy (${d3.format(".1f")(high)})`);
}

function drawRankedList(wrap, matches, headingText) {
    const legend = wrap.append("div").attr("class", "legend legend-rank");
    legend.append("span").attr("class", "legend-label").text(headingText);

    const list = legend.append("div").attr("class", "legend-rank-list");
    const rows = list.selectAll("div.legend-rank-row")
        .data(matches)
        .join("div")
        .attr("class", "legend-rank-row");

    rows.append("span").attr("class", "legend-rank-name").text((d) => `#${d.rank} ${d.name}`);
    rows.append("span").attr("class", "legend-rank-score").text((d) => d3.format(".2f")(d.happiness));
}
