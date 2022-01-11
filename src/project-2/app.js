import Alpine from "alpinejs";

import loSortBy from "lodash/sortBy";
import loRemove from "lodash/remove";
import loLast from "lodash/last";
import loSample from "lodash/sample";
import loKebabCase from "lodash/kebabCase";

// Helps debug
window.Alpine = Alpine;

function setup() {
  return {
    // init() is fired automatically when this script is executed
    init() {
      // Immediately retrieve remove data
      this.fetchCrypto();
    },
    isLoading: true,
    cryptos: [],
    selectDropdown: "",
    /**
     * Filter getter/setters
     */
    filterVal: "",
    set filter(text) {
      this.filterVal = text.toLowerCase();
    },
    // A "getter" is a function that acts like a value. A computed value.
    get filter() {
      return this.filterVal;
    },
    /**
     * The *actual* list, after applying the filter and some transformations
     */
    get filteredCryptos() {
      this.cryptos = loSortBy(this.cryptos, (crypto) => crypto.category);
      // If no filter, just show all
      if (this.filter.length < 1) {
        return this.cryptos;
      }

      return this.cryptos.filter((crypto) =>
        Object.values(crypto)
          // Only search against strings that have a length
          .filter(
            (cValue) => (typeof cValue === "string") & (cValue.length > 0)
          )
          // Lowercase everything
          .map((cValue) => cValue.toLowerCase())
          // .some returns boolean for a check against all values in array
          .some((cValue) => cValue.includes(this.filter))
      );
    },
    /**
     * A contrived example to fill the select dropdown with values derived from data
     */
    get dividendDecimals() {
      const decSet = this.filteredCryptos.reduce(
        (prev, curr) => curr.DividendDecimal && prev.add(curr.DividendDecimal),
        new Set()
      );

      return Array.from(decSet || []);
    },
    /**
     * Quickly determine the headers of the table, derived from data
     */
    get columnHeaders() {
      return Object.keys(this.cryptos[0] || {});
    },
    /**
     * Determine unique categories from the data
     */
    get categories() {
      const catSet = new Set(this.cryptos.map((crypto) => crypto.category));
      return Array.from(catSet).sort();
    },
    /**
     * Go out and get our sample data
     */
    fetchCrypto() {
      this.isLoading = true;
      fetch("https://nova.bitcambio.com.br/api/v3/public/getmarkets")
        .then((response) => response.json())
        .then(({ result }) => {
          // Add fake categories to the data
          this.cryptos = result.map((crypto) => ({
            ...crypto,
            category: loSample(["Cat 1", "Cat 2", "Cat 3"]),
          }));
          this.isLoading = false;
        });
    },
    /**
     * Just showing that we can load other data and columns change
     */
    crapData() {
      this.isLoading = true;
      this.cryptos = [
        {
          MarketName: "1",
          col1: "herp",
          col2: "derp",
          category: "Cat 1",
        },
        {
          MarketName: "2",
          col1: "flerp",
          col2: "merp",
          category: "Cat 1",
        },
      ];
      this.isLoading = false;
    },
    /**
     * Remove an object from the array of data
     */
    removeCrypto(id) {
      loRemove(this.cryptos, (crypto) => crypto.MarketName === id);
    },
    /**
     * Add an object to the array of data, with default values
     * based on data type
     */
    addCrypto() {
      const last = Object.entries(loLast(this.cryptos)).reduce(
        (prev, [key, val], idx) => {
          switch (typeof val) {
            case "string":
              prev[key] = "REPLACE";
              break;
            case "number":
              prev[key] = 1;
              break;
            case "boolean":
              prev[key] = false;
              break;
          }

          return prev;
        },
        {}
      );
      this.cryptos.push(last);
    },
    /**
     * kebab-case any string within the html
     */
    kebab(string) {
      return loKebabCase(string);
    },
  };
}

// Ensure our alpine setup function is on the global scope
window.setup = setup;

// Must be last for alpine to register our work
Alpine.start();
