// Constants for chart dimensions
const CHART_CONFIG = {
    margin: {
        top: 50,
        right: 50,
        bottom: 120,
        left: 120
    },
    get width() {
        return 1200 - this.margin.left - this.margin.right;
    },
    get height() {
        return 700 - this.margin.top - this.margin.bottom;
    }
};

// Number of channels to display
const DISPLAY_LIMIT = 40; // Change this to 30 if you want to show 30 channels

// Format numbers with commas and abbreviate large numbers
const formatSubscribers = num => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    return d3.format(",")(num);
};

// Create main SVG container
const svg = d3.select("#barChart")
    .append("svg")
    .attr("width", CHART_CONFIG.width + CHART_CONFIG.margin.left + CHART_CONFIG.margin.right)
    .attr("height", CHART_CONFIG.height + CHART_CONFIG.margin.top + CHART_CONFIG.margin.bottom)
    .append("g")
    .attr("transform", `translate(${CHART_CONFIG.margin.left},${CHART_CONFIG.margin.top})`);

// Create tooltip div if it doesn't exist
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("display", "none");

// Function to prepare data
function prepareData(data) {
    // Sort data by subscribers in descending order
    const sortedData = data.sort((a, b) => b.subscribers - a.subscribers);
    // Limit to top N channels
    return sortedData.slice(0, DISPLAY_LIMIT);
}

// Main visualization logic
function createVisualization(rawData) {
    // Prepare and limit data
    const data = prepareData(rawData);
    
    // Clear any existing chart
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Youtuber))
        .range([0, CHART_CONFIG.width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.subscribers) * 1.1])
        .range([CHART_CONFIG.height, 0]);

    // Create and style axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(formatSubscribers);

    // Add and style X axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${CHART_CONFIG.height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    // Add and style Y axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px");

    // Add axis labels
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", CHART_CONFIG.width / 2)
        .attr("y", CHART_CONFIG.height + 80)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("YouTube Channels");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -CHART_CONFIG.height / 2)
        .attr("y", -80)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Subscribers");

    // Add grid lines
    svg.selectAll("grid-line")
        .data(yScale.ticks())
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", CHART_CONFIG.width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d));

    // Create and animate bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Youtuber))
        .attr("width", xScale.bandwidth())
        .attr("y", CHART_CONFIG.height)
        .attr("height", 0)
        .on("mouseover", (event, d) => {
            tooltip
                .style("display", "block")
                .html(`
                <div style="font-family: Arial, sans-serif">
                    <strong style="color: #1a73e8">${d.Youtuber}</strong><br>
                    <strong>Rank:</strong> #${d.rank}<br>
                    <strong>Subscribers:</strong> ${formatSubscribers(d.subscribers)}<br>
                    <strong>Views:</strong> ${formatSubscribers(d["video views"])}<br>
                    <strong>Videos:</strong> ${d["video count"].toLocaleString()}<br>
                    <strong>Category:</strong> ${d.category}<br>
                    <strong>Started:</strong> ${d.started}
                </div>
            `)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr("y", d => yScale(d.subscribers))
        .attr("height", d => CHART_CONFIG.height - yScale(d.subscribers));
}

// If using CSV data
// d3.csv('https://raw.githubusercontent.com/curran/data/gh-pages/youtube/youtube.csv').then(data => {
d3.csv('youtube_data.csv').then(data => {
    // Convert string numbers to actual numbers
    data.forEach(d => {
        d.subscribers = parseInt(d.subscribers.replace(/,/g, ''));
        d["video views"] = parseInt(d["video views"].replace(/,/g, ''));
        d["video count"] = parseInt(d["video count"].replace(/,/g, ''));
        d.rank = parseInt(d.rank);
    });
    createVisualization(data);
}).catch(error => {
    // If CSV fails to load, use sample data
    console.log("Using sample data instead:", error);
    const sampleData = [
        { 
            rank: 1, 
            Youtuber: "T-Series", 
            subscribers: 222000000, 
            "video views": 198459090822, 
            "video count": 17317, 
            category: "Music", 
            started: 2006 
        },
        { 
            rank: 2, 
            Youtuber: "YouTube Movies", 
            subscribers: 154000000, 
            "video views": 0, 
            "video count": 0, 
            category: "Film & Animation", 
            started: 2015 
        },
        { 
            rank: 3, 
            Youtuber: "Cocomelon - Nursery Rhymes", 
            subscribers: 140000000, 
            "video views": 135481339848, 
            "video count": 786, 
            category: "Education", 
            started: 2006 
        }
        // Add more sample data here if needed
    ];
    createVisualization(sampleData);
});