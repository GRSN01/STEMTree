# STEMTree

AI assistant that helps you find houses priced below their market.

Ask in plain English ("3 bed under 350k in Austin"); Claude turns it into filters, and a
deal score ranks results by how far price/sqft sits below comparable listings (plus
time-on-market and price-drop signals).

## Run

Requires Node 24+ (runs TypeScript directly, no build step).

    npm install
    npm test
    cp .env.example .env           # then fill in the keys; npm start loads .env
    npm start -- "3 bed under 350k in Austin, TX"

## Data

Live listings come from [RentCast](https://developers.rentcast.io): one request per
market (zip, or city plus state), cached 24h in `.cache/` because the free plan is
small. All active listings in the market are fetched so they can serve as comps, then
filtered locally. Without a key the app uses synthetic `data/sample-listings.json`.

## Status

MVP. Next: a web UI and a better valuation model (RentCast also offers value estimates).
