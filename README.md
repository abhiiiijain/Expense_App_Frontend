# SpendWise (frontend)

Vite + React personal finance UI for SpendWise.

## Environment

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

| File | Used by | Git |
|------|---------|-----|
| `.env.development` | `npm run dev` / `npm start` | ignored |
| `.env.production` | `npm run build` / `npm run preview` | ignored |
| `*.example` | templates to copy | tracked |

Set `VITE_API_BASE_URL` to the **backend origin only** (no `/api/v1`):

```env
VITE_API_BASE_URL=https://expense-app-backend-srz0.onrender.com
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development server (also `npm start`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest |
| `npm run lint` | ESLint |
