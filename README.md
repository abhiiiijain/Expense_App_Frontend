# SpendWise (frontend)

Vite + React UI for SpendWise — track expenses, income, and account balance.

**Live:** [https://spendwise.abhiiiijain.com](https://spendwise.abhiiiijain.com) · also [Vercel](https://spendwise-seven-alpha.vercel.app)

**API:** [https://expense-app-backend-srz0.onrender.com](https://expense-app-backend-srz0.onrender.com)

Requires **Node.js 18+**.

## Stack

- React 18 + Vite 6
- React Router
- Tailwind CSS
- Chart.js / react-chartjs-2
- Axios + JWT (Bearer token in `localStorage`)
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
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint` | ESLint |

## Local development

1. Start the backend (`npm run dev` in the API repo, default port `4044`).
2. Start the frontend: `npm run dev` (port from `VITE_PORT`, default `4043`).
3. Open `http://localhost:4043`.

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
  main.jsx       Entry + Chart.js setup
  app/           Router shell + dashboard
  auth/          Login, register, context, auth API helpers
  api/           Axios client + transaction API
  components/    UI (charts, modals, lists)
  config/        API base URL helpers
  constants/     App name + categories
  hooks/         Analytics helpers
  utils/         Dates, currency, amount sanitize
```
