Allen Brain Atlas-Driven Visualizations
=====

Allen Brain Atlas-Driven Visualizations (ABADV) is a web-based application created for visualizing expression energy data from the <a href="http://brain-map.org">Allen Brain Atlas</a>. ABADV combines the ABA Application Programming Interface (<a href="http://api.brain-map.org">API</a>), a resource enabling programmatic access to their dataset, with Data-Driven Documents (<a href="http://d3js.org/">D3</a>), a library that uses digital data to drive the creation and control of dynamic and interactive visualizations. This allows users to quickly and intutiively survey expression energy data across multiple brain regions.

If you download all the files (via **Code** -> **Download ZIP**) or clone/fork this project, you can run ABADV locally either by opening `index.html` (or `abadv.html`) directly in Google Chrome, or by serving the directory with a local HTTP server:

```bash
# Clone the repository (or unzip the downloaded archive)
git clone https://github.com/UCI-CARL/ABADV.git
cd ABADV

# Start a local web server with Python 3
python3 -m http.server 8080
```

Then open **`http://localhost:8080/abadv.html`** (or `http://localhost:8080/index.html`) in your browser. You will see a page that looks nearly identical to the thumbnail below:

![example.png](images/example.png)

ABADV accepts only gene symbols and brain structure acronyms as its input. Symbols used to query genes in the Allen Mouse Brain Atlas follow the same guidelines established by the International Committee on Standardized Genetic Nomenclature for Mice, which you can find at <a href="http://www.informatics.jax.org/genes.shtml">Mouse Genome Informatics</a> (both current symbols such as `Drd1` and legacy symbols from the 2014 paper such as `Drd1a` are supported). Acronyms used to query brain structures in the Allen Mouse Brain Atlas are based on the <a href="http://atlas.brain-map.org">Allen Reference Atlas</a>.

ABADV was developed for and tested in Google Chrome.
