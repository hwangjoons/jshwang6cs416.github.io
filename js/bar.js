function drawBar(g, { data, innerWidth, innerHeight, key, label, value, color, activeKey, onClick, onHover}) {
    const x = d3.scaleLinear().domain([-1, 1]).range([0, innerWidth]);
    const y = d3.scaleBand().domain(data.map(d => d[key])).range([0, innerHeight]).padding(0.3);

    g.append("line")
     .attr("class", "zero-line")
     .attr("x1", x(0))
     .attr("x2", x(0))
     .attr("y1", 0)
     .attr("y2", innerHeight);

    g.selectAll("text.metric-label")
     .data(data)
     .join("text")
     .attr("class", "metric-label")
     .attr("x", -10)
     .attr("y", (d) => y(d[key]) + y.bandwidth() / 2)
     .attr("dy", "0.35em")
     .attr("text-anchor", "end")
     .text((d) => d[label]);

    g.selectAll("rect.bar")
     .data(data)
     .join("rect")
     .attr("class", (d) => `bar ${d[key] === activeKey ? "active" : ""}`)
     .attr("y", (d) => y(d[key]))
     .attr("height", y.bandwidth())
     .attr("x", (d) => x(Math.min(0, d[value])))
     .attr("width", (d) => Math.abs(x(d[value]) - x(0)))
     .attr("fill", (d) => color(d[value]))
     .style("cursor", "pointer")
     .on("click", (event, d) => onClick(d[key]))
     .on("mouseover", (event, d) => onHover(d[key], event))
     .on("mouseout", () => Tooltip.hide());

     g.selectAll("text.value-label")
     .data(data)
     .join("text")
     .attr("class", "value-label")
     .attr("x", (d) => x(d[value]) + (d[value] >= 0 ? 8 : -8))
     .attr("y", (d) => y(d[key]) + y.bandwidth() / 2)
     .attr("dy", "0.35em")
     .attr("text-anchor", "middle")
     .text((d) => d3.format("+.2f")(d[value]));

    return { x, y };
}

function drawDivergingBarChart(g, { data, innerWidth, innerHeight, keyAccessor, labelAccessor, valueAccessor, colorScale, activeKey, onClick, onHover }) {
    const x = d3.scaleLinear().domain([-1, 1]).range([0, innerWidth]);
    const y = d3.scaleBand().domain(data.map(keyAccessor)).range([0, innerHeight]).padding(0.25);

    g.append("line")
        .attr("class", "zero-line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", innerHeight);
    
    const gruops = g.selectAll("g.bar-group")
        .data(data)
        .join("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(0, ${y(keyAccessor(d))})`);

    gruops.append("text")
        .attr("class", "metric-label")
        .attr("x", -10)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text((d) => labelAccessor(d));

    gruops.append("rect")
        .attr("class", (d) => `bar ${keyAccessor(d) === activeKey ? "active" : ""}`)
        .attr("x", (d) => x(Math.min(0, valueAccessor(d))))
        .attr("width", (d) => Math.abs(x(valueAccessor(d)) - x(0)))
        .attr("height", y.bandwidth())
        .attr("fill", (d) => colorScale(valueAccessor(d)))
        .style("cursor", "pointer")
        .on("click", (event, d) => onClick(d))
        .on("mouseover", (event, d) => onHover(d, event))
        .on("mouseout", () => Tooltip.hide());

    gruops.append("text")
        .attr("class", "value-label")
        .attr("x", (d) => x(valueAccessor(d)) + (valueAccessor(d) => 0 ? 8 : -8 ))
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text((d) => d3.format("+.2f")(valueAccessor(d)));

    return { x, y};
}