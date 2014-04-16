var abaLink = "http://mouse.brain-map.org/experiment/show/";
var legendCreated = false;

function visualizeData(data, colors, expmList) {

    // Covert JSON into a string, then covert into CSV.
    var jsonObject = JSON.stringify(data);
    var csvData = convertJSON2CSV(jsonObject);
    csvData = d3.csv.parse(csvData);

    legendCreated = false;
    $('#debugDiv').empty();

    if (document.getElementById('pieVis').checked)
        visualizePieCharts(csvData, colors);
    else if (document.getElementById('barVis').checked)
        visualizeBarCharts(csvData, colors);
    else if (document.getElementById('heatVis').checked)
        visualizeHeatMaps(csvData, colors, expmList);
    else if (document.getElementById('allVis').checked) {
        visualizePieCharts(csvData, colors);
        visualizeBarCharts(csvData, colors);
        visualizeHeatMaps(csvData, colors, expmList);
    }
}

function visualizePieCharts(csvData, colors) {

    // Define margin, radius and min/max opacity.
    var m = 10, r = 65, opacityMin = 0.15, opacityMax = 1.0;

    var z = defineColorScheme(colors);

    // Define the pie layout.
    var pie = d3.layout.pie()
        .value(function (d) { return +d.Expression; })
        .sort(function(a, b) { return b.Expression - a.Expression; });

    // Define an arc generator.
    var arc = d3.svg.arc()
        .startAngle(function(d) { return d.startAngle; })
        .endAngle(function(d) { return (d.endAngle - 0.05); })
        .innerRadius(r / 2)
        .outerRadius(r);

    // Nest the expression data by SectionDataSetId (which is stored in Gene).
    var geneExpr = d3.nest()
        .key(function(d) { return d.Gene; })
        .entries(csvData);

    // Insert an svg element (with margin) for each SectionDataSetId in our dataset.
    var svg = d3.select("#pie").selectAll("div")
        .data(geneExpr)
      .enter().append("div")
        .style("display", "inline-block")
        .style("width", (r + m) * 2 + "px")
        .style("height", (r + m) * 2 + "px")
      .append("svg:svg")
        .attr("width", (r + m) * 2)
        .attr("height", (r + m) * 2)
      .append("svg:g")
        .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")")
      .append("svg:a")
        .attr("xlink:href", function(d) { // Makes each pie chart click-able.
            return abaLink + d.key.split("-")[1];});

    // Add a gene symbol label per SectionId.
    svg.append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) {
            symbolSplitStr = d.key.split("-")[0];
            return symbolSplitStr;
        });

    // Pass the nested expression values to the pie layout.
    var g = svg.selectAll("g")
        .data(function (d) {
            return pie(d.values); })
      .enter().append("svg:g");

    // Add a colored arc path.
    g.append("svg:path")
        .attr("d", arc)
        .style("fill", function(d) { return z(d.data.Structure); })
        .style("opacity", scaledOpacity)
      .append("svg:title")
        .text(function(d) {
            return d.data.Structure + ": " + d.data.Expression; });

    // Add a label to the larger arcs.
    g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform",
            function(d) {
                return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
        .text(function(d) { return d.data.Structure; });

    // Computes the label angle of an arc, converting from radians to degrees.
    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    // Scales energy expression to a value within opacity's range (generally, 0.25 to 1.00)
    function scaledOpacity(d) {
        scale = (opacityMax - opacityMin) / (d3.max(csvData, function(d) { return +d.Expression;}) - 0);
        return opacityMin + (d.data.Expression - 0) * scale;
    }

    defineLegend(z);
}

function visualizeBarCharts(csvData, colors) {

    // Define nested gene expression data.
    var geneExpr = d3.nest()
        .key(function(d) { return d.Gene; })
        .entries(csvData);
        
    var z = defineColorScheme(colors);

    // Define the margin object with properties for the four sides (clockwise from the top, as in CSS).
    var margin = {top: 20, right: 20, bottom: 30, left: 40};

    // Define width and height as the inner dimensions of the chart area.
    var width = 100 + (100 * geneExpr.length) - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Create x and y scales.
    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    // Set the x and y axis.
    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(3);

    // Define SVG as a 'g' element that translates the origin to the top-left corner of the chart area.
    var svg = d3.select("#bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set the domain for each scale.
    x0.domain(csvData.map(function(d) { 
        return d.Gene; 
    }));
    x1.domain(window.structures).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(csvData, function(d) { return +d.Expression;})]);

    // Start creating the grouped bar chart.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    var geneGroup = svg.selectAll(".gene")
        .data(geneExpr)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
            return "translate(" + x0(d.key) + ",0)"; })
        .append("svg:a")
        .attr("xlink:href", function(d) { return abaLink + d.values[0].SectionDataId;});

    geneGroup.selectAll("rect")
        .data(function(d) { return d.values; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.Structure); })
        .attr("y", function(d) { return y(+d.Expression); })
        .attr("height", function(d) { return height - y(+d.Expression); })
        .style("fill", function(d) {
            return z(d.Structure); });

    defineLegend(z);
}

function visualizeHeatMaps(csvData, colors, expmList) {

    // Keep track of the amount of unique experiments (section Ids).
    var uniqueExpm = [];
    $.each(expmList, function(i, el) {
        if($.inArray(el, uniqueExpm) === -1) uniqueExpm.push(el);
    });

    var margin = {top: 20, right: 10, bottom: 10, left: 50};

    var width = (75 * uniqueExpm.length),
        height = (75 * window.structures.length) + margin.top + margin.bottom;

    var heatmapcolors = ['rgb(246,239,247)','rgb(189,201,225)','rgb(103,169,207)','rgb(2,129,138)'];

    var gridSize = Math.floor(width / uniqueExpm.length),
        buckets = heatmapcolors.length;

    // Set the colorscale.
    var colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, d3.max(csvData, function(d) { return +d.Expression;})])
        .range(heatmapcolors);

    // Insert an svg element for each brain structure and SectionDataSetId.
    var svg = d3.select("#heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Label the y-axis with brain structures.
    var structureLabels = svg.selectAll(".structureLabel")
        .data(window.structures)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")");

    // Label the x-axis with gene acronyms.
    var geneLabels = svg.selectAll(".geneLabel")
        .data(uniqueExpm)
        .enter().append("text")
        .text(function(d) { return d.split("-")[0]; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")

    // Generate the heatmap and fill each cell with a color that is
    // scaled by the amount of energy expression.
    var heatMap = svg.selectAll(".expr")
        .data(csvData)
        .enter().append("rect")
        .attr("x", function(d) { return (d.Column) * gridSize; })
        .attr("y", function(d) { return (d.Row) * gridSize; })
        .attr("class", "gene bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", heatmapcolors[0]);

    heatMap.transition().duration(1000)
        .style("fill", function(d) { return colorScale(d.Expression); });

    heatMap.append("title").text(function(d) { return d.Expression; });

    // Define a legend.
    var legend = d3.select("#heatscale").append("svg")
        .attr("class","legend")
        .attr("width", 50)
        .attr("height", 500)
        .selectAll("g")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; })
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0, " + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return heatmapcolors[i]; });

    // Add a label for each color in the legend.
    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return "≥ " + Math.round(d); });

    document.getElementById('scaleLabel').innerHTML="Scale";
}

function defineColorScheme(colors) {
    // Define color scheme to use based on user response.
    if (document.getElementById('atlas').checked) {
        var z = d3.scale.ordinal().domain(window.structures).range(colors);
    }
    else if (document.getElementById('default').checked) {
        var z = d3.scale.category10();
        z.domain(window.structures);
    }

    return z;
}

function defineLegend(colorScheme) {
    // Define a legend.
    if (!legendCreated) {
        var legend = d3.select("#legend").append("svg")
            .attr("class","legend")
            .attr("width", 70)
            .attr("height", 500)
            .selectAll("g")
            .data(colorScheme.domain().slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0, " + i * 20 + ")"; });

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colorScheme);

        // Add a label for each color in the legend.
        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d; });

        document.getElementById('legendLabel').innerHTML="Legend";

        legendCreated = true;
    }
}

// convertJSON2CSV() turns JSON objects into a CSV string.
function convertJSON2CSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';

        for (var index in array[i])
            line += array[i][index] + ',';

        line.slice(0, line.length - 1);
        line = line.substring(0, line.length - 1);
        str += line + '\r\n';
    }

    return str;
}