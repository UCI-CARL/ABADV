var margin = { top: 50, right: 0, bottom: 100, left: 70 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 12),
    legendElementWidth = gridSize*2,
    buckets = 4,
    abaLink="http://mouse.brain-map.org/experiment/show/";

function importData() {

    genes = document.getElementById('genes').value.split(/[ ,]+/),
    structures = document.getElementById('brainstruct').value.split(/[ ,]+/);

    obtainIds(genes, structures, function(data, colors, maxExpr, minExpr, expmList) {

        // Covert JSON into a string, then covert into CSV.
        var jsonObject = JSON.stringify(data);
        var csvData = convertJSON2CSV(jsonObject);
        csvData = d3.csv.parse(csvData);

        // Keep track of the amount of unique experiments (section Ids).
        var uniqueExpm = [];
        $.each(expmList, function(i, el) {
            if($.inArray(el, uniqueExpm) === -1) uniqueExpm.push(el);
        });

        // Define color scheme to use based on user response.
        if (document.getElementById('PuBuGn').checked) {
            var heatmapcolors = ['rgb(246,239,247)','rgb(189,201,225)','rgb(103,169,207)','rgb(2,129,138)'];
        }
        else if (document.getElementById('YlOrRd').checked) {
            var heatmapcolors = ['rgb(255,255,178)','rgb(254,204,92)','rgb(253,141,60)','rgb(227,26,28)'];
        }

        // Set the colorscale.
        var colorScale = d3.scale.quantile()
            .domain([0, buckets - 1, maxExpr])
            .range(heatmapcolors);

        // Insert an svg element for each brain structure and SectionDataSetId.
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Label the y-axis with brain structures.
        var structureLabels = svg.selectAll(".structureLabel")
            .data(structures)
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
            .text(function(d) { return d; })
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
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "gene bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", heatmapcolors[0]);

        heatMap.transition().duration(1000)
            .style("fill", function(d) { return colorScale(d.Expression); });

        heatMap.append("title").text(function(d) { return d.Expression; });

        // Define a legend.
        var legend = d3.select("#legend").append("svg")
            .attr("class","legend")
            .attr("width", 300)
            .attr("height", 150)
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
    });
}

// convertJSON2CSV() turns JSON objects into a CSV string.
function convertJSON2CSV(objArray) {

    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';

        for (var index in array[i]) {
            line += array[i][index] + ',';
        }

        line.slice(0, line.length - 1);
        line = line.substring(0, line.length - 1);
        str += line + '\r\n';
    }
    return str;
}
