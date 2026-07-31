const state = {
    rankFilter: "All",
    rankRange: [1, 156],
    metric: "gdp_per_capita",
    factor: "gdp_per_capita",
    continent: "All",
    country1: "Finland",
    country2: "United States",
    spotlightCountry: "United States"
};

function renderSceneSection(index) {
    const body = d3.select(`#scene-${index} .scene-body`);
    body.html("");
    const sceneRenderer = [renderScene1, renderScene2, renderScene3][index];
    Promise.resolve(sceneRenderer(body, index)).catch((err) => {
        console.error(err);
    })
}

function rerenderSceneSection(index) {
    renderSceneSection(index);
}

function buildSceneSections() {
    const container = d3.select("#scene-container");
    container.html("");

    const scenes = container.selectAll("section.scene-section")
        .data([0, 1, 2])
        .join("section")
        .attr("class", "scene-section")
        .attr("id", (d, i) => `scene-${i}`)
        .classed("active", (d, i) => i === 0);

    scenes.append("div").attr("class", "scene-header").call((h) => {
        h.append("h2").attr("class", "scene-title").text((d, i) => {
            const titles = [
                "Happiest countries in the world",
                "Correlation between different metrics and Happiness of countries",
                "What characteristics contribute to happiness"
            ];
            return titles[i];
        });
        h.append("p").attr("class", "scene-caption").text((d, i) => {
            const captions = [
                "Self-reported happiness varies by country. Darker blue indicates higher happiness score.",
                "GDP per capita correlates with happiness to a certain degree, but there are other factors to consider.",
                "Ranking every factor by correlation with happiness revealing what matthers the most."
            ];
            return captions[i];
        });
    });

    scenes.append("div").attr("class", "scene-body");

    [0, 1, 2].forEach((_, index) => renderSceneSection(index));

    d3.select("#step-dots")
        .selectAll("a.step-dot")
        .data([0, 1, 2])
        .join("a")
        .attr("class", "step-dot")
        .attr("href", (d, i) => `#scene-${i}`)
        .attr("aria-label", (d, i) => `Go to scene ${i + 1}`);

    const circles = d3.selectAll("a.step-dot").nodes();
    const observer = new IntersectionObserver((entries) => {
        const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        const index = Number(visibleEntry.target.id.replace("scene-", ""));
        circles.forEach((circle, i) => circle.classList.toggle("step-dot-active", i === index));

        document.querySelectorAll(".scene-section").forEach((section) => {
            section.classList.toggle("active", section.id === visibleEntry.target.id);
        });
    }, { threshold: [0.4, 0.6], rootMargin: "-20% 0px -20% 0px" });

    document.querySelectorAll(".scene-section").forEach((el) => observer.observe(el));
}


async function loadData() {
    d3.select("#scene-container").html('<p class="chart">Loading data...</p>');
    try {
        MAIN_DATA = await loadMainData("data/2019.csv");
        setHappinessColorDomain(MAIN_DATA);
        buildSceneSections();
    } catch (err) {
        console.error(err);
        d3.select("#scene-container").html('<p class="chart">Failed to load data.</p>');
    }
}


loadData();