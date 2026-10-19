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
}

export interface ScoredListing extends Listing {
  pricePerSqft: number;
  compMedianPricePerSqft: number;
  compCount: number;
  /** 0-100; higher means more likely underpriced */
  dealScore: number;
}
