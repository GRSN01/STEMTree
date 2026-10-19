import type { Listing, ScoredListing } from "./types.ts";

const MIN_COMPS = 3;

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Heuristic deal score: how far a listing's price/sqft sits below the median of
 * comparable listings (same zip, else same city, else all), plus small bumps
 * for long time on market and price drops (motivated sellers).
 */
export function scoreListings(listings: Listing[]): ScoredListing[] {
  const ppsf = (l: Listing) => l.price / l.sqft;
  return listings.map((l) => {
    let comps = listings.filter((o) => o.id !== l.id && o.zip === l.zip);
    if (comps.length < MIN_COMPS) comps = listings.filter((o) => o.id !== l.id && o.city === l.city);
    if (comps.length < MIN_COMPS) comps = listings.filter((o) => o.id !== l.id);
    const compMedian = comps.length ? median(comps.map(ppsf)) : ppsf(l);
    const discount = 1 - ppsf(l) / compMedian;
    const motivation = (Math.min(l.daysOnMarket, 90) / 90) * 10 + Math.min(l.priceDrops, 3) * 5;
    return {
      ...l,
      pricePerSqft: Math.round(ppsf(l)),
      compMedianPricePerSqft: Math.round(compMedian),
      compCount: comps.length,
      dealScore: Math.round(clamp(50 + discount * 150 + motivation, 0, 100)),
    };
  });
}
