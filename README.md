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

This is not a generic demo shell. It is the working interface for the backend scenario endpoint:

```text
POST /api/lifepilot/scenarios
```

The current experience is focused on one job:

- capture a realistic scenario quickly
- send it to the backend
- show affordability, risk, and projected monthly impact clearly

## What You Can Do

- simulate major life events such as:
  - buying a second car
  - private school fees
  - overseas holidays
  - home renovation
  - unpaid leave
  - a side business
  - custom events
- enter recurring commitments and savings goals
- submit real scenario payloads to the Spring Boot backend
- review projected safe-to-spend impact and recommendations

## Product Snapshot

The frontend is built around a simple two-panel flow:

1. Scenario form on the left for account, costs, and duration
2. Results panel on the right for simulation output, risk, and guidance

It is styled as a clean financial planning tool rather than a marketing page.

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
http://127.0.0.1:4173
```

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

The form expects the backend-facing Investec `accountId`, not a friendly placeholder and not the visible account number.

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
