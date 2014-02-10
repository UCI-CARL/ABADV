var apiPath = "http://api.brain-map.org/api/v2/",
    ontologyId = 1,
    colorArray = new Boolean(),
    setMinMax = new Boolean(),
    colors = [],
    output = [],
    expmList = [],
    column = -1,
    row = 0,
    maxExpr = 0,
    minExpr = 0,
    currExpm = "";

function obtainIds(genes, structures, callback) {

    output.push({'symbol': 'Gene',
        'structure': 'Structure',
        'expression': 'Expression',
        'sectionid': 'SectionDataId',
        'column': 'Column',
        'row': 'Row'});

    var symbol = null;

    // For each gene, retrieve available section IDs.
    for (var i = 0; i < genes.length; i++) {
        var urlSectionId = apiPath + "data/query.json" + "?criteria=model::SectionDataSet," +
            "rma::criteria,products[id$eq" + ontologyId + "]," +
            "genes[acronym$eq" + genes[i] + "]";

        symbol = genes[i];

        $.ajax(urlSectionId, {
            crossDomain: true,
            async: false,
            success: obtainExpression,
            error: function(response) { apiError(response.statusTest,url); }
        });

    }

    processData();

    // obtainExpression() pairs each section ID with each brain structure in order to
    // later obtain expression energy data.
    function obtainExpression(data) {

        for (var j = 0; j < data.msg.length; j++) {

            for (var k = 0; k < structures.length; k++) {

                row = k;

                apiQuery("data/query.json" + "?criteria=model::StructureUnionize," +
                        "rma::criteria,structure[ontology_id$eq" + ontologyId + "]," +
                        "structure[acronym$eq" + structures[k] + "]," +
                        "section_data_set[id$eq" + data.msg[j].id + "]," +
                        "rma::include,structure,",
                        processExpression);

                if (k == (structures.length - 1))
                        colorArray = true;
            }
        }
    }

    // processExpression() transforms the returned section IDs into a
    // dictionary with expression energy data and other important information
    // for indexing purposes, such as row, column, name of brain structure, and
    // the ID number itself.
    function processExpression(data) {
        expression = {};

        for (var l = 0; l < data.length; l++) {

            var e = data[l];
            var str = e.section_data_set_id.toString();

            var genestr = symbol + "-" + str.substring(0,3);

            expmList.push(genestr);

            if (currExpm != genestr) {
                column++;
                currExpm = genestr;
            }

            output.push({'symbol': genestr,
                'structure': e.structure.acronym,
                'expression': e.expression_energy,
                'sectionid': str,
                'column': column,
                'row': row});

            if (setMinMax == false) {
                maxExpr = e.expression_energy;
                minExpr = e.expression_energy;
                setMinMax = true;
            }
            else {
                if (e.expression_energy > maxExpr)
                    maxExpr = e.expression_energy;
                else if (e.expression_energy < minExpr)
                    minExpr = e.expression_energy;
            }

            if (colorArray == false)
                colors.push('#' + e.structure.color_hex_triplet);
        }
    }

    function processData() { callback(output, colors, maxExpr, minExpr, expmList); }

    // apiError() will alert the user if something goes wrong with ABA API.
    function apiError(response, url) {

        var errorHtml =
            "<p>There was an error with the following query:</p>" +
            "<p>" + url + "</p>" +
            "<p>Error message:</p>" +
            "<p>" + response + "</p>";

        var dialog = $( "#errorDialog" );

        var existingErrors = dialog.html();

        $( "#errorDialog" )
            .html(existingErrors + errorHtml)
            .dialog({
                width: 500,
                height: 200,
                modal: true
            });
    }

    // apiQuery() queries ABA API for data. However, there is a 2000-row limit, so
    // this function also takes care of appending all the results together.
    function apiQuery(path, onsuccess) {

        var rows = [];
        var num_rows = 2000;
        var total_rows = -1;

        apiPageQuery();

        function apiPageQuery() {
            var url = apiPath + path + "rma::options" +
                "[start_row$eq" + rows.length + "]" + "[num_rows$eq" + num_rows + "]";

            $.ajax(url, {
                crossDomain: true,
                async: false,
                success: function(response) {

                    if (response.success) {
                        rows.push.apply(rows, response.msg);
                        total_rows = parseInt(response.total_rows);

                        if (total_rows < 0 || isNaN(total_rows))
                            apiError("total_rows incorrect", url);
                        else if (rows.length >= total_rows)
                            onsuccess(rows);
                        else
                            apiPageQuery();
                    } else {
                        apiError(response.msg, url);
                    }
                },
                error: function(response) {
                        apiError(response.statusText, url);
                    }
            });
        }
    }
}
