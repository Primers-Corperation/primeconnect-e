# PrimeConnect frontend

Vite + React (plain JS, no TypeScript/Tailwind) implementation of the PrimeConnect Dashboard,
built from the `PrimeConnect Design System` Claude Design export. Components in `src/components/`
are ported near-verbatim from that export (inline styles + `--pc-*` CSS custom properties from
`src/styles.css`).

## Setup

```
cd frontend
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

Requires the `primeconnect-e` backend (repo root) running with a working `MONGO_URI`, or any
server implementing the same `/api/auth` and `/api/wallet` contract.

## What's real vs. sample data

Only these backend endpoints exist, so only these are wired to real data:

- `POST /api/auth/register`, `POST /api/auth/login` — real signup/sign-in, JWT stored client-side.
- `GET /api/wallet/balance/:userId` — the Dashboard's wallet card balance.

The stat row, "buy a number" browser, active activations, and recent-activity ledger have **no
backing endpoints** in the current backend (no list-activations, list-transactions, or stats
routes exist), so they render static sample data matching the design's own defaults. Wiring them
up requires adding those endpoints to the backend first.

## Routes

- `/login`, `/register` — auth forms.
- `/dashboard` — the implemented design, protected by a JWT check.
- `/rent-number`, `/marketplace`, `/wallet`, `/history` — placeholder pages (nav targets only;
  no other screens were included in the design export).
