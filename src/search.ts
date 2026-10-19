import type { Filters, Listing, ScoredListing } from "./types.ts";
import { scoreListings } from "./score.ts";

export function applyFilters(listings: Listing[], f: Filters): Listing[] {
  return listings.filter(
    (l) =>
      (f.maxPrice === undefined || l.price <= f.maxPrice) &&
      (f.minBeds === undefined || l.beds >= f.minBeds) &&
      (f.minBaths === undefined || l.baths >= f.minBaths) &&
      (f.minSqft === undefined || l.sqft >= f.minSqft) &&
      (f.city === undefined || l.city.toLowerCase() === f.city.toLowerCase()) &&
      (f.zip === undefined || l.zip === f.zip),
  );
}

/** Score against the whole market, then filter, so comps aren't shrunk by the filters. */
export function findDeals(all: Listing[], f: Filters, limit = 10): ScoredListing[] {
  const allowed = new Set(applyFilters(all, f).map((l) => l.id));
  return scoreListings(all)
    .filter((l) => allowed.has(l.id))
    .sort((a, b) => b.dealScore - a.dealScore)
    .slice(0, limit);
}
