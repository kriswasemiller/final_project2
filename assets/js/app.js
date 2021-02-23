$(document).ready(function() {
    makeMap();

    //event listener
    $(window).resize(function() {
        // makePlot();

        $('#myTable').DataTable();
    });
});

//this function is going to grab the data needed for the map
function makeMap() {
    var queryUrl = "https://covid.ourworldindata.org/data/owid-covid-data.json"


    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data) {
            console.log(data);

            // buildMap(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });

    // function makePlot() {
    d3.csv("assets/data/covid19_vaccinations_in_the_united_states.csv").then(function(data2) {
        console.log(data2);


        // STEP 1: SET UP THE CANVAS
        $("#scatter").empty();

        // var svgWidth = 960;
        var svgWidth = 1300;
        var svgHeight = 500;

        var margin = {
            top: 20,
            right: 40,
            bottom: 60,
            left: 80
        };
        var chart_width = svgWidth - margin.left - margin.right;
        var chart_height = svgHeight - margin.top - margin.bottom;

        // STEP 2: create SVG
        var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .classed("chart", true);

        var chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        // STEP 3: prepare data
        data2.forEach(function(row) {
            row.Total_Delivered = +row.Total_Delivered;
            row.Total_Administered = +row.Total_Administered;
        });
        // STEP 4: Create Scales
        var xScale = d3.scaleLinear()
            .domain(d3.extent(data2, d => d.Total_Delivered))
            .range([0, chart_width]);

        var yScale = d3.scaleLinear()
            .domain(d3.extent(data2, d => d.Total_Administered))
            .range([chart_height, 0]);

        // STEP 5: create axes
        var leftAxis = d3.axisLeft(yScale);
        var bottomAxis = d3.axisBottom(xScale);

        chartGroup.append("g")
            .attr("transform", `translate(0, ${chart_height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // create state text
        var textGroup = chartGroup.append("g")
            .selectAll("text")
            .data(data2)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("alignment-baseline", "central")
            .attr("x", d => xScale(d.Total_Delivered))
            .attr("y", d => yScale(d.Total_Administered))
            .attr("font-size", 12)

        // STEP 6: create graph and append circles
        var circlesGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(data2)
            .enter()
            .append("circle")
            // .filter(function(d) { return d.close < 0 })
            .attr("cx", d => xScale(d.Total_Delivered))
            .attr("cy", d => yScale(d.Total_Administered))
            .attr("r", "15")
            .attr("fill", "purple")
            .attr("stroke-width", "1")
            .attr("stroke", "navy")
            .style("opacity", 0.25);

        // STEP 7: assign axes
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 0)
            .attr("x", 0 - (chart_height / 1.5))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Total Administered");

        chartGroup.append("text")
            .attr("transform", `translate(${chart_width / 2}, ${chart_height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("Total Delivered");

        // STEP 8: create tooltip 
        // Step 1: Initialize Tooltip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([150, -60])
            .html(function(d) {
                return (`<strong>${d.State_Territory_Federal_Entity}<strong><hr><strong>Total Delivered: ${d.Total_Delivered}, Total Administered: ${d.Total_Administered}</strong>`);
            });

        // Step 2: Create the tooltip in chartGroup.
        circlesGroup.call(toolTip);

        // Step 3: Create "mouseover" event listener to display tooltip
        circlesGroup.on("mouseover", function(event, d) {
                toolTip.show(d, this);

                //make bubbles big
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("r", 40);
            })
            // Step 4: Create "mouseout" event listener to hide tooltip
            .on("mouseout", function(event, d) {
                toolTip.hide(d);

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("r", 15);
            });


    }).catch(function(error) {
        console.log(error);
    });
}