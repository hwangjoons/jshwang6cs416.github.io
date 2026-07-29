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

    const svgWrap = container.append("div").attr("class", "chart-wrap");
    const svg = svgWrap.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "chart-svg");

    drawLegend(svgWrap);

    const metric = METRICS[state.metric];
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const { x, y } = drawScatter(g, {
        data: MAIN_DATA,
        metric,
        innerWidth,
        innerHeight,
        dim: (d) => !RANK_FILTERS[state.rankFilter](d, MAIN_DATA.length)
    });

    const costaRica = MAIN_DATA.find((d) => d.name === "Costa Rica");
    const usa = MAIN_DATA.find((d) => d.name === "United States");
    const annotations = [];
    if (costaRica) {
        annotations.push({
            note: {
                title: "Costa Rica",
                label: "High happiness despite modest GDP per capita",
                wrap: 190
            },
            x: x(metric.accessor(costaRica)), y: y(costaRica.happiness),
            dx: state.metric === "gdp_per_capita" ? 90: 60, dy: -60,
            color: INK.primary
        });
    }
    if (usa) {
        annotations.push({
            note: {
                title: "United States",
                label: "High GDP per capita, but happiness is not the highest",
                wrap: 190
            },
            x: x(metric.accessor(usa)), y: y(usa.happiness),
            dx: state.metric === "gdp_per_capita" ? -30 : 40, dy: 50,
            color: INK.primary
        });
    }
    drawAnnotations(g, annotations);
}