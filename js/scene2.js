function renderScene2(container, index) {
    const width = 900, height = 500;
    const margin = { top: 30, right: 40, bottom: 50, left: 60 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    container.append("div").attr("class", "scene-controls").call((c) => {
        c.append("span").attr("class", "control-label").text("Compare happiness against:");
        const group = c.append("div").attr("class", "chip-group");
        group.selectAll("button.chip")
            .data(METRIC_ORDER)
            .join("button")
            .attr("class", (d) => `chip${d === state.metric ? " chip-active": ""}`)
            .text((d) => METRICS[d].shortLabel)
            .on("click", (event, d) => {
                state.metric = d;
                rerenderSceneSection(index);
            });
    });

    container.append("div").attr("class", "scene-controls").call((c) => {
        c.append("span").attr("class", "control-label").text("Continent:");
        const group = c.append("div").attr("class", "chip-group");
        group.selectAll("button.chip")
            .data(CONTINENT_ORDER)
            .join("button")
            .attr("class", (d) => `chip${d === state.continent ? " chip-active": ""}`)
            .text((d) => d)
            .on("click", (event, d) => {
                state.continent = d;
                rerenderSceneSection(index);
            });
    });

    container.append("div").attr("class", "scene-controls").call((c) => {
        c.append("span").attr("class", "control-label").text("Highlight a country:");
        const names = MAIN_DATA.map((d) => d.name).sort(d3.ascending);
        const select = c.append("select").attr("class", "country-select");
        select.selectAll("option")
            .data(names)
            .join("option")
            .attr("value", (d) => d)
            .property("selected", (d) => d === state.spotlightCountry)
            .text((d) => d);
        select.on("change", function () {
            state.spotlightCountry = this.value;
            rerenderSceneSection(index);
        });
    });

    const svgWrap = container.append("div").attr("class", "chart-wrap");
    const svg = svgWrap.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "chart-svg");

    drawLegend(svgWrap);

    const metric = METRICS[state.metric];
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const filteredData = state.continent === "All"
        ? MAIN_DATA
        : MAIN_DATA.filter((d) => d.continent === state.continent);

    if (!filteredData.length) {
        svgWrap.append("p").attr("class", "chart-status").text("No countries in this continent for the current dataset.");
        return;
    }

    const { x, y } = drawScatter(g, {
        data: filteredData,
        metric,
        innerWidth,
        innerHeight,
        dim: (d) => !RANK_FILTERS[state.rankFilter](d, MAIN_DATA.length)
    });

    const spotlight = filteredData.find((d) => d.name === state.spotlightCountry);
    if (spotlight) {
        drawAnnotations(g, [{
            note: {
                title: spotlight.name,
                label: `Happiness ${d3.format(".2f")(spotlight.happiness)} · ${metric.shortLabel} ${metric.format(metric.accessor(spotlight))}`,
                wrap: 190
            },
            x: x(metric.accessor(spotlight)), y: y(spotlight.happiness),
            dx: 60, dy: -50,
            color: INK.primary
        }]);
    } else {
        drawAnnotations(g, []);
        svgWrap.append("p").attr("class", "chart-status")
            .text(`${state.spotlightCountry} isn't in the selected continent — pick another country or switch continent to All.`);
    }
}
