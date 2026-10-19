import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RentCastProvider, toListing } from "../src/providers/rentcast.ts";
import { FileCache } from "../src/cache.ts";

const raw = {
  id: "a",
  addressLine1: "1 Main St",
  city: "Austin",
  zipCode: "78723",
  price: 400000,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 2000,
  daysOnMarket: 30,
  history: {
    "2024-01-01": { price: 450000 },
    "2024-02-01": { price: 420000 },
    "2024-03-01": { price: 400000 },
  },
};

const tmpCache = () => new FileCache(mkdtempSync(join(tmpdir(), "house-looker-")));

test("toListing maps fields and counts price drops", () => {
  const l = toListing(raw)!;
  assert.equal(l.zip, "78723");
  assert.equal(l.sqft, 2000);
  assert.equal(l.priceDrops, 2);
});

test("toListing skips listings without sqft", () => {
  assert.equal(toListing({ ...raw, squareFootage: undefined }), undefined);
});

test("provider sends key, drops unusable rows, and caches", async () => {
  let calls = 0;
  let seen: { url: string; key: string } | undefined;
  const fakeFetch = (async (url: string, init: RequestInit) => {
    calls++;
    seen = { url, key: (init.headers as Record<string, string>)["X-Api-Key"] };
    return new Response(JSON.stringify([raw, { ...raw, id: "b", squareFootage: undefined }]));
  }) as unknown as typeof fetch;
  const p = new RentCastProvider("k", tmpCache(), fakeFetch);
  const f = { city: "Austin", state: "tx" };
  assert.equal((await p.fetchListings(f)).length, 1);
  await p.fetchListings(f);
  assert.equal(calls, 1);
  assert.equal(seen!.key, "k");
  assert.match(seen!.url, /city=Austin/);
  assert.match(seen!.url, /state=TX/);
});

test("provider refuses an unspecified market and surfaces HTTP errors", async () => {
  const bad = (async () => new Response("nope", { status: 401 })) as unknown as typeof fetch;
  const p = new RentCastProvider("k", tmpCache(), bad);
  await assert.rejects(p.fetchListings({}), /zip code, or a city and state/);
  await assert.rejects(p.fetchListings({ zip: "78723" }), /HTTP 401/);
});
