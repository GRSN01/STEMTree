import { readFileSync } from "node:fs";
import type { Listing } from "../types.ts";
import type { ListingProvider } from "./types.ts";

export class SampleProvider implements ListingProvider {
  async fetchListings(): Promise<Listing[]> {
    return JSON.parse(readFileSync(new URL("../../data/sample-listings.json", import.meta.url), "utf8"));
  }
}
