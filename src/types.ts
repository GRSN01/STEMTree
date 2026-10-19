export interface Listing {
  id: string;
  address: string;
  city: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  daysOnMarket: number;
  priceDrops: number;
}

export interface Filters {
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  minSqft?: number;
  city?: string;
  zip?: string;
  /** 2-letter state code; needed to fetch a market from RentCast */
  state?: string;
}

export interface ScoredListing extends Listing {
  pricePerSqft: number;
  compMedianPricePerSqft: number;
  compCount: number;
  /** 0-100; higher means more likely underpriced */
  dealScore: number;
}
