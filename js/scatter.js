function drawScatter(g, { data, metric, innerWidth, innerHeight, dim, highlightData, labelDots = false }) {
    const xs = data.map(metric.accessor);
    const ys = data.map((d) => d.happiness);

    const x = d3.scaleLinear().domain(d3.extent(xs)).nice().range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, 8.5]).nice().range([innerHeight, 0]);

    drawXAxis(g, { x, innerHeight, format: metric.format });
    drawYAxis(g, { y });
    drawAxisTitle(g, { text: metric.label, x: innerWidth / 2, y: innerHeight + 40 });
    drawAxisTitle(g, { text: "Happiness Score", x: -innerHeight / 2, y: -50, rotate: true });

    const { slope, intercept } = linearRegression(xs, ys);
    
    const regression = linearRegression(xs, ys);

    const [x0, x1] = x.domain();
    g.append("line")
     .attr("class", "trend-line")
     .attr("x1", x(x0))
     .attr("y1", y(regression.predict(x0)))
     .attr("x2", x(x1))
     .attr("y2", y(regression.predict(x1)))

    const dotData = highlightData || data;

    const scatterDotGroups = g.selectAll("g.dot-group")
        .data(dotData)
        .join("g")
        .attr("class", "dot-group")
        .attr("transform", d => `translate(${x(metric.accessor(d))}, ${y(d.happiness)})`);

    scatterDotGroups.append("circle")
        .attr("class", "dot")
        .attr("r", labelDots ? 6 : 5)
        .attr("fill", (d) => HAPPINESS_COLOR(d.happiness))
        .attr("opacity", (d) => (dim && dim(d) ? 0.2: 0.95))

    if (labelDots) {
        scatterDotGroups.append("text")
            .attr("class", "dot-label")
            .attr("x", 10)
            .attr("y", 4)
            .text((d) => d.name);
    }

    scatterDotGroups.append("circle")
        .attr("class", "dot-hit")
        .attr("r", 10)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mousemove", (event, d) => {
            Tooltip.show({ title: d.name,
                rows: [
                    { label: "Happiness", value: d3.format(".2f")(d.happiness) },
                    { label: "Rank", value: `#${d.rank} of ${MAIN_DATA}.length` },
                    { label: metric.label, value: metric.format(metric.accessor(d)) }
                ]
            }, event);
        })
        .on("mouseleave", () => {
            Tooltip.hide();
        });

    return { x, y, slope: regression.slope, intercept: regression.intercept };
}