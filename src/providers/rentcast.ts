import type { Filters, Listing } from "../types.ts";
import type { ListingProvider } from "./types.ts";
import { FileCache } from "../cache.ts";

const BASE = "https://api.rentcast.io/v1/listings/sale";

interface RentCastListing {
  id: string;
  addressLine1?: string;
  formattedAddress?: string;
  city: string;
  zipCode: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  daysOnMarket?: number;
  history?: Record<string, { price?: number }>;
}

/** Count price reductions in the listing history (ordered by date key). */
function countPriceDrops(history: RentCastListing["history"]): number {
  const prices = Object.entries(history ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, h]) => h.price)
    .filter((p): p is number => typeof p === "number");
  return prices.filter((p, i) => i > 0 && p < prices[i - 1]).length;
}

export function toListing(r: RentCastListing): Listing | undefined {
  if (!r.price || !r.squareFootage) return undefined; // can't compute price/sqft
  return {
    id: r.id,
    address: r.addressLine1 ?? r.formattedAddress ?? r.id,
    city: r.city,
    zip: r.zipCode,
    price: r.price,
    beds: r.bedrooms ?? 0,
    baths: r.bathrooms ?? 0,
    sqft: r.squareFootage,
    daysOnMarket: r.daysOnMarket ?? 0,
    priceDrops: countPriceDrops(r.history),
  };
}

export class RentCastProvider implements ListingProvider {
  private apiKey: string;
  private cache: FileCache;
  private fetchImpl: typeof fetch;

  constructor(apiKey: string, cache = new FileCache(), fetchImpl: typeof fetch = fetch) {
    this.apiKey = apiKey;
    this.cache = cache;
    this.fetchImpl = fetchImpl;
  }

  async fetchListings(f: Filters): Promise<Listing[]> {
    const params = new URLSearchParams({ status: "Active", limit: "500" });
    if (f.zip) params.set("zipCode", f.zip);
    else if (f.city && f.state) {
      params.set("city", f.city);
      params.set("state", f.state.toUpperCase());
    } else {
      // RentCast defaults to Austin, TX when unspecified; never silently search the wrong market.
      throw new Error('RentCast needs a zip code, or a city and state (e.g. "Austin, TX").');
    }

    const key = `rentcast-${params.toString()}`;
    const cached = this.cache.get<Listing[]>(key);
    if (cached) return cached;

    const res = await this.fetchImpl(`${BASE}?${params}`, { headers: { "X-Api-Key": this.apiKey } });
    if (!res.ok) throw new Error(`RentCast request failed: HTTP ${res.status} ${await res.text()}`);
    const raw = (await res.json()) as RentCastListing[];
    const listings = raw.map(toListing).filter((l): l is Listing => l !== undefined);
    this.cache.set(key, listings);
    return listings;
  }
}
