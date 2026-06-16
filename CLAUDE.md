# CLAUDE.md

> Operational guide for Claude Code working on **SoundNest / SonNest-Music**.
> Read this first. For the full improvement playbook see **CONTEXT.md**.

## What this project is

Full-stack e-commerce for musical instruments.

- **Frontend** (`Front/my-app/`): Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Axios
- **Backend** (`back/`): Node.js · Express · TypeScript · TypeORM · PostgreSQL · JWT · Bcrypt
- **Deploy**: Vercel (frontend) · Render (backend)

## Repo layout

```
SonNest-Music/
├── back/                 # Express + TypeORM REST API
│   └── src/
│       ├── config/       # envs.ts, dataSource.ts
│       ├── controllers/  # HTTP layer
│       ├── services/     # business logic
│       ├── repositories/ # TypeORM data access
│       ├── entities/     # User, Credential, Product, Category, Order
│       ├── dtos/         # data transfer objects
│       ├── schemas/      # Zod request schemas (register/login/order)
│       ├── middlewares/  # validate(schema), checkLogin, isAdmin, DB-invariant checks
│       ├── helpers/      # preLoad seed data (categories, products, admin)
│       ├── routes/       # users / products / orders / categories routers
│       └── utils/        # ClientError, catchedController
└── Front/my-app/
    └── src/
        ├── app/          # App Router pages
        ├── components/   # UI components (was "Componets" — typo, see CONTEXT.md)
        ├── services/     # Axios API clients
        ├── interfaces/   # shared TS types
        ├── hooks/        # custom hooks (was "Hook")
        └── helpers/      # validations + utils
```

## Commands

> **Use Node 20.** The repo pins it (`back/.nvmrc` + `engines: "20.x"`). On Node 24+
> the backend fails to import `jsonwebtoken` (removed `SlowBuffer`) and the frontend's
> `lightningcss` native binary is ABI-incompatible. Docker images already use Node 20.

### Backend (`cd back`)
```bash
npm install
npm run dev        # nodemon + ts-node on PORT (default 8080)
npm run build      # tsc -> dist/
npm start          # node dist/index.js (production)
npm test           # jest (24 tests: utils, middlewares, services, integration)
```

### Frontend (`cd Front/my-app`)
```bash
npm install
npm run dev        # next dev --turbopack on :3000
npm run build      # next build
npm run lint       # eslint
```

### Docker (root, after the docker upgrade)
```bash
docker compose up --build   # db + backend + frontend
```

## Environment variables

**Backend** (`back/.env`): `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME`, `JWT_SECRET`, and for production `DATABASE_URL` (+ optional `DB_SYNCHRONIZE`).
Payments: `MP_ACCESS_TOKEN` (Mercado Pago **test** access token, `APP_USR-…`/`TEST-…`,
from "Credenciales de prueba") and `FRONTEND_URL` (base for MP return URLs; defaults
to `http://localhost:3000`, must be the https Vercel URL in prod for `auto_return`).
**Frontend** (`Front/my-app/.env.local`): `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`).

`dataSource.ts` picks the production config when `NODE_ENV=production` (uses `DATABASE_URL`),
otherwise the local config (host/port/user/...). On boot the server auto-seeds
categories and products (`helpers/preLoadCategories.ts`, `preLoadProducts.ts`).

## API surface

| Method | Endpoint          |   Auth   | Notes                                            |
| ------ | ----------------- | :------: | ------------------------------------------------ |
| POST   | `/users/register` |    ❌    | Zod-validated body                               |
| POST   | `/users/login`    |    ❌    | returns `{ user, token }`                        |
| POST   | `/users/orders`   |    ✅    | list current user's orders (with products)       |
| GET    | `/products`       |    ❌    | paginated: `?page&limit&search&category` → `{ data, page, limit, total, totalPages }` |
| GET    | `/products/:id`   |    ❌    | single product                                   |
| PATCH  | `/products/:id`   | ✅ admin | update stock/price (`checkLogin` + `isAdmin`)    |
| GET    | `/categories`     |    ❌    | list categories                                  |
| POST   | `/orders`         |    ✅    | create order, validates stock                    |
| POST   | `/products`       | ✅ admin | create product (Zod-validated)                   |
| DELETE | `/products/:id`   | ✅ admin | delete product                                   |
| POST   | `/payments/create-preference` | ✅ | Mercado Pago: build a Checkout Pro preference, returns `{ id, init_point }` |
| GET    | `/payments/confirm?payment_id=` | ✅ | verify payment vs MP; if approved, create the order (idempotent) |

Auth: send the JWT in the `Authorization` header (no `Bearer` prefix — see
`middlewares/checkLogin.middleware.ts`). Admin-only routes additionally use
`isAdmin` (looks up the user's `role`). The boot seed creates an admin from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@soundnest.com` / `Admin123!`).

## Conventions

- TypeScript everywhere; backend uses a strict layered architecture
  (controller → service → repository). Keep new code in the matching layer.
- Controllers are wrapped with `catchedController` so thrown errors reach the
  central error handler in `server.ts`. Throw `new ClientError(msg, status)`
  for expected 4xx errors.
- Repositories are `AppDataSource.getRepository(Entity)` singletons.
- Request validation: define a **Zod** schema in `back/src/schemas/` and guard the
  route with `validate(schema)` (`middlewares/validate.middleware.ts`). Keep
  database-invariant checks (unique email, items exist) as separate middlewares —
  Zod only validates shape. `validate` forwards a 400 `ClientError` with the
  combined issue messages and preserves earlier body fields (e.g. `userId`).

### Frontend design system ("warm wood, refined")

- Colors/fonts/shadows are tokens in `Front/my-app/src/app/globals.css` via
  Tailwind v4 `@theme` → use the generated utilities (`bg-cream`, `text-ink`,
  `text-bordo`, `bg-gold`, `bg-surface`, `text-ink-soft`, `shadow-card`). **Don't
  add raw Tailwind colors** (`red-800`, `amber-100`, …) — keep everything on tokens.
- Reuse the primitives (also in `globals.css`): `.btn` + `.btn-primary` /
  `.btn-accent` / `.btn-outline` / `.btn-ghost`, `.card`, `.input` / `.label`,
  `.badge` (`-gold` / `-bordo`), `.section` (centered container).
- Fonts: **Fraunces** (display, headings) + **Inter** (body), wired in `layout.tsx`.
- **Dark mode** is class-based: `.dark` on `<html>` overrides the token CSS
  variables, so utilities flip automatically — no `dark:` variants needed.
  - `cream` / `cream-100` / `cream-200` are **light constants** (used as text on
    dark sections); they are NOT overridden in `.dark`.
  - `night` = always-dark surfaces (navbar, footer, overlays), dark in both themes.
  - `muted` = subtle surfaces/borders that DO flip dark. `surface` = cards.

## Known gotchas

1. **README was UTF-16** (looked corrupted on GitHub). Keep it UTF-8.
2. **`DB_USER` vs `DB_USERNAME`**: `dataSource.ts` dev branch must read
   `process.env.DB_USER` to match `envs.ts` and `.env.example`.
3. **Misspelled paths**: `Componets`→`components`, `Hook`→`hooks`,
   `landingHomeComponets`→`landingHome`, `FeasturesStection`→`FeaturesSection`,
   `category.respository`→`category.repository`. (Fixed in the upgrade.)
4. **Don't commit `back/dist/`** — it's build output; keep it gitignored.

## Working agreement

- **TDD (since 2026-06-16):** write the failing test first, implement the minimum
  to pass, then refactor — the goal is the whole app tested. Apply strict
  red-green-refactor to the service / middleware / business-logic layers (mock
  repositories like `products.service.test.ts`). For React UI and external-redirect
  flows (e.g. Stripe Checkout) test-after or manual smoke is acceptable.
- Make small, reviewable commits grouped by concern.
- Verify before claiming done: `npm test` + `npm run build` (back) and
  `npm run build` (front).
- Don't push to `main`; use a feature branch and open a PR only when asked.
