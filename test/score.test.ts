import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Listing } from "../src/types.ts";
import { scoreListings } from "../src/score.ts";
import { findDeals } from "../src/search.ts";

const listings: Listing[] = JSON.parse(readFileSync("data/sample-listings.json", "utf8"));

test("underpriced listing outscores its comps", () => {
  const scored = scoreListings(listings);
  const cheap = scored.find((l) => l.id === "L5")!; // 0.72x price/sqft in 78701
  const others = scored.filter((l) => l.zip === "78701" && l.id !== "L5");
  assert.ok(others.every((o) => cheap.dealScore > o.dealScore));
});

test("findDeals respects filters and sorts by score", () => {
  const out = findDeals(listings, { city: "Austin", maxPrice: 400000 });
  assert.ok(out.length > 0);
  assert.ok(out.every((l) => l.city === "Austin" && l.price <= 400000));
  for (let i = 1; i < out.length; i++) assert.ok(out[i - 1].dealScore >= out[i].dealScore);
});
