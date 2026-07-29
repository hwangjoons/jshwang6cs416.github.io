const HAPPINESS_COLOR = d3.scaleLinear()
    .domain([2, 4.5, 6, 8])
    .range(["#8dc5f4", "#5678e7", "#345abf", "#1c256b"])
    .clamp(true);

function setHappinessColorDomain(data) {
    const values = data.map((d) => d.happiness).sort(d3.ascending);
    const stops = [0, 1 / 3, 2 / 3, 1].map((p) => d3.quantileSorted(values, p));
    HAPPINESS_COLOR.domain(stops);
}

const CORRELATION_COLOR = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(["#e45756", "#d2d3a7", "#4cc9f0"])
    .clamp(true);

const INK = {
    primary: "#0b0b0b",
    secondary: "#3a3a3a",
    muted: "#787891",
    grid: "#f1f0d9",
    baseline: "#d2d1b7",
    surface: "#f5f5f5",
    background: "#ffffff" 
}

const Tooltip = (() => {
    const el = d3.select("body")
    .append("div")
    .attr("class", "viz-tooltip")
    .style("opacity", 0)
    const titleEl = el.append("div").attr("class", "tooltip-title");
    const rowsEl = el.append("div").attr("class", "tooltip-rows");

    function show({ title, rows}, event) {
        titleEl.text(title  || "");
        rowsEl.selectAll("div.tooltip-row").remove();

        const row = rowsEl.selectAll("div.tooltip-row").data(rows || []).join("div").attr("class", "tooltip-row");

        row.append("span").attr("class", "tooltip-label").text((d) => d.label);
        row.append("span").attr("class", "tooltip-value").text((d) => d.value);
        el.style("opacity", 1)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    }

    function move(event) {
        el.style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    }

    function hide() {
        el.style("opacity", 0);
    }
    return { show, hide };
})();

function drawAnnotations(svg, annotations) {
    svg.selectAll("g.annotation-group").remove();
    if (!annotations || !annotations.length) return;

    const group = svg.append("g").attr("class", "annotation-group");

    annotations.forEach((annotation) => {
        const text = group.append("text")
            .attr("class", "annotation-label")
            .attr("x", annotation.x)
            .attr("y", annotation.y);

        text.append("tspan")
            .attr("class", "annotation-title")
            .attr("x", annotation.x)
            .attr("dy", 0)
            .text(annotation.note.title);

        text.append("tspan")
            .attr("x", annotation.x)
            .attr("dy", "1.2em")
            .text(annotation.note.label);
    });
}

function pearson(xs, ys) {
    const n = xs.length;
    const meanX = d3.mean(xs);
    const meanY = d3.mean(ys);
    let num = 0; 
    let denX = 0; 
    let denY = 0;

    for (let i = 0; i < n; i += 1) {
        const dx = xs[i] - meanX;
        const dy = ys[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : num / den;
}

function linearRegression(xs, ys) {
    const n = xs.length;
    const meanX = d3.mean(xs);
    const meanY = d3.mean(ys);
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i += 1) {
        const dx = xs[i] - meanX;
        const dy = ys[i] - meanY;
        num += dx * dy;
        den += dx * dx;

}
const slope = den === 0 ? 0 : num / den;
const intercept = meanY - slope * meanX;
return { slope, intercept, predict: (x) => slope * x + intercept };
}