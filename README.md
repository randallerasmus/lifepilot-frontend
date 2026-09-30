<div align="center">
  <h1>LifePilot Frontend</h1>
  <p><strong>A polished scenario simulator for testing the real cost of life decisions before you commit.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=0B0F19" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.8" />
    <img src="https://img.shields.io/badge/Vite-5.4-8B5CF6?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5.4" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3.4" />
    <img src="https://img.shields.io/badge/shadcn%2Fui-Radix-111827?style=for-the-badge&logo=radixui&logoColor=white" alt="shadcn ui and Radix" />
  </p>
</div>

---

## What This Is

LifePilot Frontend is the UI for the LifePilot scenario engine. It lets a user enter an Investec-backed account, monthly commitments, and a major life event, then see how that decision changes their monthly position.

This is not a generic demo shell. It is the working interface for two backend
endpoints:

```text
POST /api/lifepilot/scenarios                        (Simulator)
GET  /api/lifepilot/accounts/{accountId}/forecast    (Forecast)
```

The simulator asks what a decision would cost. The forecast asks where the
balance is heading without one: it draws the projected daily balance, shades the
cashflow risk windows, and lists the recurring payments driving them.

**The project brief lives in the backend repo**, at `LIFEPILOT_CONTEXT.md` in
`investec-life-pilot`. It covers both repositories, including which branches are
in flight and the order they merge in. Read it before changing response shapes:
this UI reads the backend DTOs by field name, and drift between the two renders
blanks rather than failing.

## What You Can Do

- simulate major life events such as:
  - buying a second car
  - private school fees
  - overseas holidays
  - home renovation
  - a new home
  - a new baby
  - a career change
  - caring for a parent
  - unpaid leave
  - a side business
  - custom events
- enter recurring commitments and savings goals
- submit real scenario payloads to the Spring Boot backend
- review projected safe-to-spend impact and recommendations
- project the daily balance forward and see the date it runs short
- review detected subscriptions and debit orders with their next due dates

## Product Snapshot

Two routes, sharing a header.

`/` — the simulator, a two-panel flow:

1. Scenario form on the left for account, costs, and duration
2. Results panel on the right for simulation output, risk, and guidance

`/forecast` — the balance projection: headline risk date, KPI tiles, the daily
balance chart with shaded risk windows, and tables of detected recurring
payments and income.

It is styled as a clean financial planning tool rather than a marketing page.

The chart takes a darker step of the brand teal than `--accent`, which does not
clear 3:1 against the card as a 2px line. Each theme gets its own step rather
than an automatic flip. Risk bands are shaded, but never carry meaning by colour
alone: every window is repeated as a labelled entry below the chart.

## Quick Start

### 1. Install dependencies

```powershell
npm install
```

### 2. Start the frontend

```powershell
npm run dev
```

Default dev URL:

```text
http://localhost:8081
```

The backend owns `8080`, and `8081` is the origin its CORS config allows. Both
defaulted to `8080` until September 2026, so whichever started first won and the
other failed to bind.

### 3. Start the backend

The frontend depends on the sibling backend project running on port `8080`.

Backend repo path:

```text
C:\Interfront2023\lifepilot
```

Start it with:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

## Runtime Configuration

The frontend uses this environment variable for the API base URL:

```text
VITE_LIFEPILOT_API_BASE
```

If it is not set, the app defaults to:

```text
http://localhost:8080
```

Example `.env.local`:

```text
VITE_LIFEPILOT_API_BASE=http://localhost:8080
```

## Important Note About Account IDs

Both screens open with `demo-account` filled in. The backend serves generated
transaction history for that id, so the app works without Investec credentials.
Override the default with `VITE_LIFEPILOT_DEMO_ACCOUNT_ID`.

For a real account, the form expects the backend-facing Investec `accountId`, not a friendly placeholder and not the visible account number.

Do not use:

```text
ACC-1029384
```

Get valid accounts from the backend:

```text
GET /api/investec/accounts
```

## Scripts

```powershell
npm run dev
npm run build
npm run build:dev
npm run lint
npm run test
npm run test:watch
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| App | React 18 |
| Language | TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS |
| UI primitives | Radix UI |
| UI composition | shadcn/ui |
| Forms | React Hook Form |
| Data fetching support | TanStack Query |
| Routing | React Router |
| Charts/utilities | Recharts, Lucide |
| Testing | Vitest, Testing Library |

## Current Behavior

- frontend and backend now communicate with local CORS support for:
  - `http://127.0.0.1:4173`
  - `http://localhost:4173`
- the UI will show an error if the backend is down or the account id is invalid
- simulation results depend on live backend access and valid Investec credentials on the backend side

## Project Structure

```text
src/
  components/
    lifepilot/
    ui/
  hooks/
  lib/
  pages/
  test/
```

## Recommended Next Improvements

- replace the raw account id input with an account picker from `/api/investec/accounts`
- show a clearer invalid-account message when the backend returns a 400
- add screenshots or a short demo gif to the README
- document the frontend-backend contract with example responses

## Testing

Run frontend tests:

```powershell
npm run test
```

Run the frontend production build:

```powershell
npm run build
```

## Status

This frontend is operational as a local development client for the LifePilot backend and is now documented for both product readers and developers.
