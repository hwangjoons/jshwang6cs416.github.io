function drawXAxis(g, { x, innerHeight, ticks = 6, format }) {
    g.append("g")
     .attr("class", "axis axis-x")
     .attr("transform", `translate(0, ${innerHeight})`)
     .call(d3.axisBottom(x).ticks(ticks).tickFormat(format).tickSizeOuter(0));
}

function drawYAxis(g, { y, ticks = 6, format }) {
    g.append("g")
     .attr("class", "axis axis-y")
     .call(d3.axisLeft(y).ticks(ticks).tickFormat(format).tickSizeOuter(0));
}

function drawTitle(g, { text, x, y, rotate = false }) {
    const title = g.append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .attr("x", x)
        .attr("y", y)
        .text(text);
    
    if (rotate) {
        title.attr("transform", "rotate(-90)");
    }
}

function drawTitle(g, options) {
    return drawAxisTitle(g, options);
}