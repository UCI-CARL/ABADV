Allen Brain Atlas-Driven Visualizations
=====

Allen Brain Atlas-Driven Visualizations (ABADV) is a web-based application created for visualizing expression energy data from the <a href="http://brain-map.org">Allen Brain Atlas</a>. ABADV combines the ABA Application Programming Interface (<a href="http://api.brain-map.org">API</a>), a resource enabling programmatic access to their dataset, with Data-Driven Documents (<a href="http://d3js.org/">D3</a>), a library that uses digital data to drive the creation and control of dynamic and interactive visualizations. This allows users to quickly and intutiively survey expression energy data across multiple brain regions.

If you download all the files (there is a Download ZIP button on the right column of this page) or fork this project, and you want to run ABADV, then open index.html in Google Chrome. You will see a page that looks nearly identical to this thumbnail below:

![example.png](https://raw2.github.com/UCI-CARL/ABADV/master/images/example.png)

ABADV accepts only gene symbols and brain structure acronyms as its input. Symbols used to query genes in the Allen Mouse Brain Atlas follow the same guidelines established by the International Committee on Standardized Genetic Nomenclature for Mice, which you can find at <a href="http://www.informatics.jax.org/genes.shtml">Mouse Genome Informatics</a>. Acronyms used to query brain structures in the Allen Mouse Brain Atlas are based on the <a href="http://atlas.brain-map.org">Allen Reference Atlas</a>.

ABADV was developed for and testing in Google Chrome.
