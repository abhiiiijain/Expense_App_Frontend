# SpendWise (frontend)

Vite + React UI for SpendWise — track expenses, income, transfers, and account balances (including credit-card cycles).

**Live:** [https://spendwise.abhiiiijain.com](https://spendwise.abhiiiijain.com) · also [Vercel](https://spendwise-seven-alpha.vercel.app)

**API:** [https://expense-app-backend-srz0.onrender.com](https://expense-app-backend-srz0.onrender.com)

Requires **Node.js 18+**.

## Stack

- React 18 + Vite 6
- React Router
- Tailwind CSS
- Chart.js / react-chartjs-2
- Axios + JWT (Bearer token in `localStorage`)
- PIN lock + WebAuthn device unlock (not login)
- PWA (vite-plugin-pwa)
- react-toastify

## Setup

```bash
npm install
cp .env.development.example .env.development
cp .env.production.example .env.production
```

## Environment

| File | Used by | Git |
|------|---------|-----|
| `.env.development` | `npm run dev` / `npm start` | ignored |
| `.env.production` | `npm run build` / `npm run preview` | ignored |
| `*.example` | templates | tracked |

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_API_BASE_URL` | yes | Backend **origin only** (no `/api/v1`) |
| `VITE_PORT` | local serve / preview only | Not needed for Vercel build |

Examples:

```env
# development
VITE_PORT=4043
VITE_API_BASE_URL=http://localhost:4044

# production
VITE_API_BASE_URL=https://expense-app-backend-srz0.onrender.com
```

`/api/v1/` is appended in `src/config/api.js`, so API calls go to  
`{VITE_API_BASE_URL}/api/v1/...`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Vite server (also `npm start`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Local development

1. Start the backend (`npm run dev` in the API folder, default port `4044`).
2. Start the frontend: `npm run dev` (port from `VITE_PORT`, default `4043`).
3. Open `http://localhost:4043`.

In Vite **development**, hiding the tab does not lock the PIN. Production always locks on hide. Production also requires a PIN after login.

## App behavior

- **Accounts:** bank, cash, credit, other. New credit cards ask for statement day and due day (1–28). Unused credit limit is not available cash.
- **Spent:** consumption only. Credit-card bill payments are not spent; they settle the card and show on Transfers.
- **Income:** salary, family transfers (e.g. Mummy), refunds. Account-to-account transfers are not income.
- **Month vs credit cycle:** a credit account’s dashboard month follows that card’s statement/due days.
- **Activity:** Statement (oldest first, running balance), Expenses, Income, Transfers. Search mixes all types and groups by **calendar date**, newest first.
- **Edits:** add/edit/delete only within 24 hours of `createdAt` (window comes from `/config`).
- **Unlock:** PIN or platform authenticator. WebAuthn does not replace email/password login.

## Deploy (Vercel)

1. Import this frontend repo as a Vite project.
2. Build / output are set in `vercel.json` (`npm run build` → `dist`, SPA rewrites).
3. Set **Production** environment variable:

   ```env
   VITE_API_BASE_URL=https://expense-app-backend-srz0.onrender.com
   ```

   Do **not** include `/api/v1` in this value.

4. Redeploy whenever you change `VITE_API_BASE_URL` (Vite bakes it in at build time).
5. Add custom domain `spendwise.abhiiiijain.com` in Vercel + DNS.

Ensure the Render API `CORS_ORIGIN` includes both frontends:

```text
https://spendwise-seven-alpha.vercel.app,https://spendwise.abhiiiijain.com
```

## Project layout

```text
src/
  main.jsx              Entry + PWA
  app/                  Router shell + dashboard
  auth/                 Login, register, PIN lock, WebAuthn helpers
  api/                  Axios client, transactions, accounts, transfers, budgets
  components/           Activity list, accounts, budgets, charts, modals
  config/               API URL, taxonomy context, theme, Chart.js
  constants/            Branding + chart colors
  hooks/                Month analytics, PWA install, escape / scroll lock
  utils/                Dates, credit cycles, card payments, currency
```
