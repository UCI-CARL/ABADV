// Display console messages to main column of ABADV.
if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    $('#debugDiv').append(message + '\n');
};
console.error = console.debug = console.info =  console.log

var ontologyId = 1,
    symbol = [],
    row = [],
    colors = [];

// Obtain expression energy data.
function obtainData(genes, structures) {

    clearInnerHtml();

    symbol = [],
    row = [],
    colors = [];

    var filters = checkFilters();

    var genesVal = document.getElementById('genes').value.trim();
    var structVal = document.getElementById('brainstruct').value.trim();
    window.genes = genesVal ? genesVal.split(/[ ,]+/).filter(Boolean) : [];
    window.structures = structVal ? structVal.split(/[ ,]+/).filter(Boolean) : [];
    
    if (window.genes.length === 0 || window.structures.length === 0) {
        $('#debugDiv').empty();
        var msg = 'Make sure you have both gene symbols and structures typed in ' +
            'the appropriate text fields and try again.';
        console.log(msg);
        return;
    }
    else {
        var urlSectionId = [];

        // For each gene, retrieve available section IDs.
        for (var i = 0; i < window.genes.length; i++) {
            urlSectionId.push(generateSectionIdUrl(i, filters, ontologyId, 'acronym'));
        }

        $('#debugDiv').empty();
        console.log('Retrieving SectionDataSetId for each gene in query...');
        apiQuery(urlSectionId, function(data) {
            // Fall back to original_symbol for genes whose nomenclature was updated in ABA (e.g., Drd1a -> Drd1)
            var fallbackIndices = [];
            var fallbackUrls = [];
            for (var i = 0; i < data.length; i++) {
                if (!data[i] || data[i].length === 0) {
                    fallbackIndices.push(i);
                    fallbackUrls.push(generateSectionIdUrl(i, filters, ontologyId, 'original_symbol'));
                }
            }
            if (fallbackUrls.length > 0) {
                apiQuery(fallbackUrls, function(fallbackData) {
                    for (var j = 0; j < fallbackIndices.length; j++) {
                        data[fallbackIndices[j]] = fallbackData[j];
                    }
                    structureUnionize(data);
                });
            } else {
                structureUnionize(data);
            }
        });
    }
}

function checkFilters() {
    // Identify selected filters.
    if (document.getElementById('antisense').checked)
        orientId = 'probes[orientation_id$eq2]';
    else if (document.getElementById('sense').checked)
        orientId = 'probes[orientation_id$eq1]';
    else
        orientId = null;

    if (document.getElementById('coronal').checked)
        refSpace = 'reference_space[id$eq9]';
    else if (document.getElementById('sagittal').checked)
        refSpace = 'reference_space[id$eq10]';
    else
        refSpace = null;

    return [orientId, refSpace];
}

function generateSectionIdUrl(index, filters, ontologyId, geneField) {
    var field = geneField || 'acronym';
    var geneCriterion = "genes[" + field + "$eq'" + window.genes[index] + "']";

    // Generate SectionDataSet query based on filters.
    if (orientId && refSpace)
        var urlSectionId = 'data/query.json' + '?criteria=model::SectionDataSet,' +
            'rma::criteria,products[id$eq' + ontologyId + '],' +
            geneCriterion + ',' +
            orientId + ',' + refSpace;
    else if (orientId && !refSpace)
        var urlSectionId = 'data/query.json' + '?criteria=model::SectionDataSet,' +
            'rma::criteria,products[id$eq' + ontologyId + '],' +
            geneCriterion + ',' +
            orientId;
    else if (!orientId && refSpace)
        var urlSectionId = 'data/query.json' + '?criteria=model::SectionDataSet,' +
            'rma::criteria,products[id$eq' + ontologyId + '],' +
            geneCriterion + ',' +
            refSpace;
    else
        var urlSectionId = 'data/query.json' + '?criteria=model::SectionDataSet,' +
            'rma::criteria,products[id$eq' + ontologyId + '],' +
            geneCriterion;

    return urlSectionId;
}

// structureUnionize() pairs each SectionDataSet with each brain structure to retrieve data.
function structureUnionize(data) {

    var structPath = [];
    var colorSet = -1;

    $('#debugDiv').empty();
        console.log('Generating StructureUnionize API URLs...');

    // For each gene, experiment, and brain structure -- create StructureUnionize URLs.
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var k = 0; k < window.structures.length; k++) {

                row.push(k);
                symbol.push(window.genes[i]);
                structPath.push('data/query.json' + '?criteria=model::StructureUnionize,' +
                    'rma::criteria,structure[ontology_id$eq' + ontologyId + '],' +
                    "structure[acronym$eq'" + window.structures[k] + "']," +
                    'section_data_set[id$eq' + data[i][j].id + '],' +
                    'rma::include,structure');
            }
        }
    }

    if (structPath.length == 0) {
        $('#debugDiv').empty();
        var msg = 'Data not found. ' +
            'Try a different query.';
        console.log(msg);
        return;
    }
    else {
        $('#debugDiv').empty();
        console.log('Retrieving StructureUnionize data for each SectionDataSetId...');
        apiQuery(structPath, processResults)
    }
}

// processResults() transforms the returned section IDs into a
// dictionary with expression energy data and other important information
// for indexing purposes, such as row, column, name of brain structure, and
// the ID number itself.

function processResults(data) {

    var currExpm = '',
        column = -1,
        colors = [],
        results = [],
        expmList = [];

    results.push({'symbol': 'Gene',
    'structure': 'Structure',
    'expression': 'Expression',
    'sectionid': 'SectionDataId',
    'column': 'Column',
    'row': 'Row'});

    $('#debugDiv').empty();
    console.log('Processing results for visualization...');

    for (var i = 0; i < data.length; i++) {

        if (data[i].length == 0) {
            continue;
        }
        else {
            var str = data[i][0].section_data_set_id.toString();
            var genestr = symbol[i] + '-' + str;
            expmList.push(genestr);

            if (currExpm != genestr) {
                column++;
                currExpm = genestr;
            }

            if (colors.length != structures.length)
                colors.push('#' + data[i][0].structure.color_hex_triplet);

            results.push({'symbol': genestr,
                'structure': data[i][0].structure.acronym,
                'expression': data[i][0].expression_energy,
                'sectionid': str,
                'column': column,
                'row': row[i]});
        }
    }

    if (results.length > 1) {
        visualizeData(results, colors, expmList);
    }
    else {
        $('#debugDiv').empty();
        console.log('Unable to process results. Try a different query.');
        return;
    }
}

// apiQuery() queries ABA API for data. However, there is a 2000-row limit, so
// this function also takes care of appending all the results together.
function apiQuery(pathList, onsuccess) {

    var apiPath = 'https://api.brain-map.org/api/v2/';
    var calls = pathList.length;
    var apiResponses = [];
    var hasError = false;

    for (var i = 0; i < pathList.length; i++) {
        apiPageQuery(i);
    }

    function apiPageQuery(index) {

       var url = apiPath + pathList[index];

        $.ajax(url, {
            success: function(response) {
                if (hasError) return;
                if (!response || !response.success || !Array.isArray(response.msg)) {
                    hasError = true;
                    $('#debugDiv').empty();
                    var msg = 'Unable to resolve query. ' +
                    'Please try again using ' +
                    'different search terms.';
                    console.log(msg);
                    return;
                }
                apiResponses[index] = response.msg;
                calls--;
                if (calls == 0) {
                    onsuccess(apiResponses);
                }
            },
            error: function(response) {
                    if (hasError) return;
                    hasError = true;
                    $('#debugDiv').empty();
                    var msg = 'Unable to resolve query. ' +
                    'Please try again using ' +
                    'different search terms.';
                    console.log(msg);
                    return;
                }
        });
    }
}

function clearInnerHtml() {

    document.getElementById('heatmap').innerHTML = '';
    document.getElementById('bar').innerHTML = '';
    document.getElementById('pie').innerHTML = '';
    document.getElementById('legend').innerHTML = '';
    document.getElementById('heatscale').innerHTML = '';
    document.getElementById('legendLabel').innerHTML='';
    document.getElementById('scaleLabel').innerHTML='';
    $('#debugDiv').empty();
}