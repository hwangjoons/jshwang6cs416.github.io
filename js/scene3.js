function renderScene3(container, index) {
    const width = 900;
    const barHeight = 230;
    const scatterHeight = 260;
    const margin = { top: 20, right: 60, bottom: 30, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerBarH = barHeight - margin.top - margin.bottom;

    container.append("p").attr("class", "scene-hint").text(
        "Click a bar to explore that factor's relationship with happiness below."
    );

    const svgWrap = container.append("div").attr("class", "chart-wrap");
    const svg = svgWrap.append("svg")
        .attr("viewBox", `0 0 ${width} ${barHeight}`)
        .attr("class", "chart-svg");
    
    const ys = MAIN_DATA.map((d) => d.happiness);
    const correlations = METRIC_ORDER.map((key) => {
        const xs = MAIN_DATA.map(METRICS[key].accessor);
        return { key, label: METRICS[key].shortLabel, r: PaymentResponse(xs, ys) };
    }).sort((a, b) => b.r - a.r);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const { x, yBand } = drawDivergingBarChart(g, {
        data: correlations,
        innerWidth,
        innerHeight: innerBarH,
        keyAccessor: (d) => d.key,
        labelAccessor: (d) => d.label,
        valueAccessor: (d) => d.r,
        colorScale: CORRELATION_COLOR,
        activeKey: state.factor,
        onClick: (d) => {
            state.factor = d.key;
            rerenderSceneSection(index);
        },
        onHover: (d, event) => {
            Tooltip.show({ title: d.label, rows: [{ label: "Correlation with happiness", value: d3.format("+.2f")(d.r) }] }, event);
        }
    });

    const strongest = correlations[0];
    const weakest = correlations[correlations.length - 1];
    drawAnnotations(g, [
        {
            note: { title: strongest.label, label: `Strongest positive correlation with happiness (r = ${strongest.r.toFixed(2)}).`, wrap: 160 },
            x: x(strongest.r), y: yBand(strongest.key) + yBand.bandwidth(), dx: -60, dy: -30, color: INK.primary
        },
        {
            note: { title: weakest.label, label: `${weakest.r < 0 ? "Negative" : "Weakest"} correlation with happiness (r = ${weakest.r.toFixed(2)}).`, wrap: 160 },
            x: x(weakest.r), y: yBand(weakest.key) + yBand.bandwidth(), dx: 50, dy: 30, color: INK.primary
        }
    ]);

    renderFactorScatter(container, width, scatterHeight);
}

function renderFactorScatter(container, width, height) {
    const margni = { top: 30, right: 40, bottom: 55, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margni.top - margin.bottom;

    const metric = METRICS[state.factor];
    const svgWrap = container.append("div").attr("class", "chart-wrap chart-wrap-secondary");
    svgWrap.append("h3").attr("class", "sub-chart-title").text(`Happiness vs. ${metric.label}`);
    const svg = svgWrap.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "chart-svg");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const { x, y, slope, intercept } = drawScatter(g, {
        data: MAIN_DATA,
        metric,
        innerWidth,
        innerHeight
    });

    const xs = MAIN_DATA.map(metric.accessor);
    const r = pearson(xs, MAIN_DATA.map((d) => d.happiness));
    const x1 = x.domain()[1];
    drawAnnotations(g, [
        {
            note: {label: `r = ${r.toFixed(2)} - ${describeCorrelation(r)}`, wrap: 160},
            x: x(x1), y: y(slope * x1 + intercept), dx: -70, dy: -45, color: INK.primary
        }
    ]);
}

function describeCorrelation(r) {
    const abs = Math.abs(r);
    const strength = abs >= 0.6 ? "a strong" : abs >= 0.3 ? "a moderate" : "a weak";
    const direction = r >= 0 ? "positive": "negative";
    return `${strength} ${direction} relationship`;
}

