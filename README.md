# SpendWise (frontend)

Vite + React UI for SpendWise — track expenses, income, and account balance.

**Live:** [https://spendwise.abhiiiijain.com](https://spendwise.abhiiiijain.com) · also [Vercel](https://spendwise-seven-alpha.vercel.app)

**API:** [https://expense-app-backend-srz0.onrender.com](https://expense-app-backend-srz0.onrender.com)

## Stack

- React 18 + Vite 6
- React Router
- Tailwind CSS
- Chart.js
- Axios + JWT (Bearer token in `localStorage`)

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
| `VITE_PORT` | yes for local serve | Dev / preview port |

Examples:

```env
# development
VITE_PORT=4043
VITE_API_BASE_URL=http://localhost:4044

# production (Vercel + local build)
VITE_API_BASE_URL=https://expense-app-backend-srz0.onrender.com
```

`/api/v1/` is appended in `src/config/api.js`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Vite server (also `npm start`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Local development

1. Start the backend (`npm run dev` in the API repo, port `4044`).
2. Start the frontend: `npm run dev` (port `4043`).
3. Open `http://localhost:4043`.

## Deploy (Vercel)

1. Import this frontend repo as a Vite project.
2. Build / output are set in `vercel.json` (`npm run build` → `dist`, SPA rewrites).
3. Set **Production** env:

   ```env
   VITE_API_BASE_URL=https://expense-app-backend-srz0.onrender.com
   ```

4. Redeploy whenever you change `VITE_API_BASE_URL` (it is baked in at build time).
5. Add custom domain `spendwise.abhiiiijain.com` in Vercel + DNS.

Ensure the Render API `CORS_ORIGIN` includes:

```text
https://spendwise-seven-alpha.vercel.app,https://spendwise.abhiiiijain.com
```

## Project layout

```text
src/
  app/           Router shell + dashboard
  auth/          Login, register, context, auth API helpers
  api/           Axios client + transaction API
  components/    UI (charts, modals, lists)
  config/        API base URL + Chart.js setup
  constants/     App name + categories
  hooks/         Analytics helpers
  utils/         Dates, currency, amount sanitize
```
