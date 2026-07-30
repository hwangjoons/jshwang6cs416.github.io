const MAP_NAME_ALIASES = {
    "United States": "United States of America",
    "Ivory Coast": "Côte d'Ivoire",
    "Congo (Brazzaville)": "Congo",
    "Congo (Kinshasa)": "Dem. Rep. Congo",
    "Bosnia and Herzegovina": "Bosnia and Herz."
};

const COUNTRY_CONTINENT = {
    "Finland": "Europe", "Denmark": "Europe", "Norway": "Europe", "Iceland": "Europe",
    "Netherlands": "Europe", "Switzerland": "Europe", "Sweden": "Europe", "New Zealand": "Australia",
    "Canada": "North America", "Austria": "Europe", "Australia": "Australia", "Costa Rica": "North America",
    "Israel": "Asia", "Luxembourg": "Europe", "United Kingdom": "Europe", "Ireland": "Europe",
    "Germany": "Europe", "Belgium": "Europe", "United States": "North America", "Czech Republic": "Europe",
    "United Arab Emirates": "Asia", "Malta": "Europe", "Mexico": "North America", "France": "Europe",
    "Taiwan": "Asia", "Chile": "South America", "Guatemala": "North America", "Saudi Arabia": "Asia",
    "Qatar": "Asia", "Spain": "Europe", "Panama": "North America", "Brazil": "South America",
    "Uruguay": "South America", "Singapore": "Asia", "El Salvador": "North America", "Italy": "Europe",
    "Bahrain": "Asia", "Slovakia": "Europe", "Trinidad & Tobago": "North America", "Poland": "Europe",
    "Uzbekistan": "Asia", "Lithuania": "Europe", "Colombia": "South America", "Slovenia": "Europe",
    "Nicaragua": "North America", "Kosovo": "Europe", "Argentina": "South America", "Romania": "Europe",
    "Cyprus": "Europe", "Ecuador": "South America", "Kuwait": "Asia", "Thailand": "Asia",
    "Latvia": "Europe", "South Korea": "Asia", "Estonia": "Europe", "Jamaica": "North America",
    "Mauritius": "Africa", "Japan": "Asia", "Honduras": "North America", "Kazakhstan": "Asia",
    "Bolivia": "South America", "Hungary": "Europe", "Paraguay": "South America", "Northern Cyprus": "Europe",
    "Peru": "South America", "Portugal": "Europe", "Pakistan": "Asia", "Russia": "Europe",
    "Philippines": "Asia", "Serbia": "Europe", "Moldova": "Europe", "Libya": "Africa",
    "Montenegro": "Europe", "Tajikistan": "Asia", "Croatia": "Europe", "Hong Kong": "Asia",
    "Dominican Republic": "North America", "Bosnia and Herzegovina": "Europe", "Turkey": "Asia", "Malaysia": "Asia",
    "Belarus": "Europe", "Greece": "Europe", "Mongolia": "Asia", "North Macedonia": "Europe",
    "Nigeria": "Africa", "Kyrgyzstan": "Asia", "Turkmenistan": "Asia", "Algeria": "Africa",
    "Morocco": "Africa", "Azerbaijan": "Asia", "Lebanon": "Asia", "Indonesia": "Asia",
    "China": "Asia", "Vietnam": "Asia", "Bhutan": "Asia", "Cameroon": "Africa",
    "Bulgaria": "Europe", "Ghana": "Africa", "Ivory Coast": "Africa", "Nepal": "Asia",
    "Jordan": "Asia", "Benin": "Africa", "Congo (Brazzaville)": "Africa", "Gabon": "Africa",
    "Laos": "Asia", "South Africa": "Africa", "Albania": "Europe", "Venezuela": "South America",
    "Cambodia": "Asia", "Palestinian Territories": "Asia", "Senegal": "Africa", "Somalia": "Africa",
    "Namibia": "Africa", "Niger": "Africa", "Burkina Faso": "Africa", "Armenia": "Asia",
    "Iran": "Asia", "Guinea": "Africa", "Georgia": "Asia", "Gambia": "Africa",
    "Kenya": "Africa", "Mauritania": "Africa", "Mozambique": "Africa", "Tunisia": "Africa",
    "Bangladesh": "Asia", "Iraq": "Asia", "Congo (Kinshasa)": "Africa", "Mali": "Africa",
    "Sierra Leone": "Africa", "Sri Lanka": "Asia", "Myanmar": "Asia", "Chad": "Africa",
    "Ukraine": "Europe", "Ethiopia": "Africa", "Swaziland": "Africa", "Uganda": "Africa",
    "Egypt": "Africa", "Zambia": "Africa", "Togo": "Africa", "India": "Asia",
    "Liberia": "Africa", "Comoros": "Africa", "Madagascar": "Africa", "Lesotho": "Africa",
    "Burundi": "Africa", "Zimbabwe": "Africa", "Haiti": "North America", "Botswana": "Africa",
    "Syria": "Asia", "Malawi": "Africa", "Yemen": "Asia", "Rwanda": "Africa",
    "Tanzania": "Africa", "Afghanistan": "Asia", "Central African Republic": "Africa", "South Sudan": "Africa"
};

const CONTINENT_ORDER = ["All", "Africa", "Asia", "Europe", "North America", "South America", "Australia"];

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
    "Bottom 10": (d, n) => d.rank > n - 10
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
            mapName: MAP_NAME_ALIASES[row["Country or region"]] || row["Country or region"],
            continent: COUNTRY_CONTINENT[row["Country or region"]] || "Unknown",
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