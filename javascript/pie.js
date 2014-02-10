// Define margin, radius and min/max opacity.
var m=10,
    r=65,
    opacityMin=0.25,
    opacityMax=1.0,
    abaLink="http://mouse.brain-map.org/experiment/show/";

function importData() {

    genes = document.getElementById('genes').value.split(/[ ,]+/),
    structures = structures = document.getElementById('brainstruct').value.split(/[ ,]+/);

    obtainIds(genes, structures, function(data, colors, maxExpr, minExpr) {

        //Covert JSON into a string, then covert into CSV.
        var jsonObject = JSON.stringify(data);
        var csvData = convertJSON2CSV(jsonObject);
        csvData = d3.csv.parse(csvData);

        // Define color scheme to use based on user response.
        if (document.getElementById('atlas').checked) {
            var z = d3.scale.ordinal().domain(structures).range(colors);
        }
        else if (document.getElementById('default').checked) {
            var z = d3.scale.category10();
            z.domain(structures);
        }

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
        var svg = d3.select("#chart").selectAll("div")
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
            .attr("xlink:href", function(d) {
                return abaLink + d.values[0].SectionDataId;});

        // Add a label for the expression data.
        svg.append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.key; });

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
            scale = (opacityMax - opacityMin) / (maxExpr - minExpr);
            return opacityMin + (d.data.Expression - minExpr) * scale;
        }

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
