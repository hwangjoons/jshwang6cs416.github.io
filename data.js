const MAP_NAME_ALIASES = {
    "United States": "United States of America",
    "Ivory Coast": "Côte d'Ivoire",
    "Congo (Brazzaville)": "Congo",
    "Congo (Kinshasa)": "Dem. Rep. Congo",
    "Bosnia and Herzegovina": "Bosnia and Herz."
};

const METRICS = {
    gdp_per_capita: {
        key: "gdp_per_capita",
        label: "GDP per Capita (report index)",
        shortLabel: "GDP/Capita",
        format: (v) => d3.format(".2f")(v),
        accessor: (d) => d.gdp_per_capita
    },
    social_support: {
        key: "social_support",
        label: "Social Support (report index)",
        shortLabel: "Social Support",
        format: (v) => d3.format(".2f")(v),
        accessor: (d) => d.social_support
    },
    life_expectancy: {
        key: "life_expectancy",
        label: "Healthy Life Expectancy (report index)",
        shortLabel: "Life Expectancy",
        format: (v) => d3.format(".2f")(v),
        accessor: (d) => d.life_expectancy
    },
    freedom: {
        key: "freedom",
        label: "Freedom to Make Life Choices (report index)",
        shortLabel: "Freedom",
        format: (v) => d3.format(".2f")(v),
        accessor: (d) => d.freedom
    },
    generosity: {
        key: "generosity",
        label: "Generosity (report index)",
        shortLabel: "Generosity",   
        format: (v) => d3.format(".2f")(v),
        accessor: (d) => d.generosity
    },
    corruption: {
        key: "corruption",
        label: "Perceptions of Corruption (report index)",
        shortLabel: "Corruption",
        format: (v) => d3.format(".2f")(v),
        accessor: (d) => d.corruption
    }
};

const METRIC_ORDER = ["gdp_per_capita", "social_support", "life_expectancy", "freedom", "generosity", "corruption"];

const RANK_FILTERS = {
    All: (d, n) => true,
    "Top 10": (d, n) => d.rank <= 10,
    "Bottom 10": (d, n) => d.rank > n - 20
}

const RANK_FILTER_ORDER = ["All", "Top 10", "Bottom 10"];

let MAIN_DATA = [];

async function loadMainData(url) {
    const rows = await d3.csv(url, d3.autoType);
    return rows
        .filter((row) => row["Country or region"])
        .map((row) => ({
            name: row["Country or region"],
            rank: Number(row["Overall rank"]),
            mapName: Number(MAP_NAME_ALIASES[row["Country or region"]] || row["Country or region"]),
            happiness: Number(row["Score"]),
            gdp_per_capita: Number(row["GDP per capita"]),
            social_support: Number(row["Social support"]),
            life_expectancy: Number(row["Healthy life expectancy"]),
            freedom: Number(row["Freedom to make life choices"]),
            generosity: Number(row["Generosity"]),
            corruption: Number(row["Perceptions of corruption"])
        })
    );
}