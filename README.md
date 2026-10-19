# STEMTree

AI assistant that helps you find houses priced below their market.

Ask in plain English ("3 bed under 350k in Austin"); Claude turns it into filters, and a
deal score ranks results by how far price/sqft sits below comparable listings (plus
time-on-market and price-drop signals).

## Run

Requires Node 24+ (runs TypeScript directly, no build step).

    npm install
    npm test
    ANTHROPIC_API_KEY=... npm start -- "3 bed under 350k in Austin"

## Status

MVP. Uses `data/sample-listings.json` (synthetic). Next: a real listings provider
(licensed API or MLS/IDX feed), a web UI, and a better valuation model.
