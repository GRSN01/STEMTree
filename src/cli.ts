import { readFileSync } from "node:fs";
import type { Listing } from "./types.ts";
import { findDeals } from "./search.ts";
import { parseQuery } from "./nl.ts";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('Usage: npm start -- "3 bed under 350k in Austin"');
  process.exit(1);
}

const listings: Listing[] = JSON.parse(
  readFileSync(new URL("../data/sample-listings.json", import.meta.url), "utf8"),
);

const filters = await parseQuery(query);
console.log("Filters:", JSON.stringify(filters));
for (const d of findDeals(listings, filters)) {
  console.log(
    `${String(d.dealScore).padStart(3)}  $${d.price.toLocaleString()}  ${d.beds}bd/${d.baths}ba ${d.sqft}sqft  ` +
      `$${d.pricePerSqft}/sqft (comps $${d.compMedianPricePerSqft})  ${d.address}, ${d.city} ${d.zip}`,
  );
}
