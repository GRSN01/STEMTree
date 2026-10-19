import type { Filters, Listing } from "../types.ts";

export interface ListingProvider {
  /** Return all active listings for the market area named by the filters (used as comps). */
  fetchListings(filters: Filters): Promise<Listing[]>;
}
