var abaLink="http://mouse.brain-map.org/experiment/show/";

function importData() {

    genes = document.getElementById('genes').value.split(/[ ,]+/),
    structures = document.getElementById('brainstruct').value.split(/[ ,]+/);

    obtainIds(genes, structures, function(data, colors, maxExpr, minExpr) {

        //Covert JSON into a string, then covert into CSV.
        var jsonObject = JSON.stringify(data);
        var csvData = convertJSON2CSV(jsonObject);
        csvData = d3.csv.parse(csvData);

        // Define nested gene expression data.
        var geneExpr = d3.nest()
            .key(function(d) { return d.Gene; })
            .entries(csvData);

        // Define color scheme to use based on user response.
        if (document.getElementById('atlas').checked) {
            var z = d3.scale.ordinal().domain(structures).range(colors);
        }
        else if (document.getElementById('default').checked) {
            var z = d3.scale.category10();
            z.domain(structures);
        }

        // Define the margin object with properties for the four sides (clockwise from the top, as in CSS).
        var margin = {top: 20, right: 10, bottom: 20, left: 20};

        // Define width and height as the inner dimensions of the chart area.
        var width = 600 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

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
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set the domain for each scale.
        x0.domain(csvData.map(function(d) { return d.Gene; }));
        x1.domain(structures).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, maxExpr]);

        // Start creating the grouped bar chart.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

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
            return z(d.Structure); })
        .text(function (d) {
            return d.Expression;
        });

        // Define a legend.
        var legend = d3.select("#legend").append("svg")
            .attr("class","legend")
            .attr("width", 100)
            .attr("height", 500)
            .selectAll("g")
            .data(z.domain().slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0, " + i * 20 + ")"; });

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", z);

        // Add a label for each color in the legend.
        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d; });
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

