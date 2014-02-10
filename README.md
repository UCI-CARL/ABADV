Allen Brain Atlas-Driven Visualizations
=====

Allen Brain Atlas-Driven Visualizations (ABADV) is a web-based application created for visualizing expression energy data from the <a href="http://brain-map.org">Allen Brain Atlas</a>. ABADV combines the <a href="http://api.brain-map.org">ABA Application Programming Interface (API</a>), a resource enabling programmatic access to their dataset, with <a href="http://d3js.org/">Data-Driven Documents (D3)</a>, a library that uses digital data to drive the creation and control of dynamic and interactive visualizations. This allows users to quickly and intutiively survey expression energy data across multiple brain regions.

If you download all the files or fork this project, and you want to run ABADV, then open index.html in Google Chrome. You will see a page that looks nearly identical to this thumbnail below:

![example.png](https://raw2.github.com/UCI-CARL/ABADV/master/images/example.png)

Of course, on the visualization page, the main column will not be filled with any charts yet. You will have to first provide some genes and brain structures.

Currently, ABADV accepts only gene symbols and brain structure acronyms. Symbols used to query genes in the Allen Mouse Brain Atlas follow the same guidelines established by the International Committee on Standardized Genetic Nomenclature for Mice, which you can find at <a href="http://www.informatics.jax.org/genes.shtml">Mouse Genome Informatics</a>. Acronyms used to query brain structures in the Allen Mouse Brain Atlas are based on the <a href="http://atlas.brain-map.org">Allen Reference Atlas</a>.

After you type in a few genes and brain structures, pick any color scheme you want try and click the "Visualize!" button. You should now see a chart in the main column. From there, you can enter a new query and select a different color scheme, or you can return to the main page and try out another visualization.
