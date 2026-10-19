import { findDeals } from "./search.ts";
import { parseQuery } from "./nl.ts";
import { RentCastProvider } from "./providers/rentcast.ts";
import { SampleProvider } from "./providers/sample.ts";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('Usage: npm start -- "3 bed under 350k in Austin, TX"');
  process.exit(1);
}

const apiKey = process.env.RENTCAST_API_KEY;
const provider = apiKey ? new RentCastProvider(apiKey) : new SampleProvider();
console.log(apiKey ? "Data: RentCast (live)" : "Data: sample (set RENTCAST_API_KEY for live listings)");

const filters = await parseQuery(query);
console.log("Filters:", JSON.stringify(filters));
const listings = await provider.fetchListings(filters);
for (const d of findDeals(listings, filters)) {
  console.log(
    `${String(d.dealScore).padStart(3)}  $${d.price.toLocaleString()}  ${d.beds}bd/${d.baths}ba ${d.sqft}sqft  ` +
      `$${d.pricePerSqft}/sqft (comps $${d.compMedianPricePerSqft})  ${d.address}, ${d.city} ${d.zip}`,
  );
}
