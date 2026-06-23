# CONTEXT.md — SoundNest upgrade playbook

This document contains (1) the project analysis and (2) a step-by-step,
copy-pasteable playbook to upgrade the repo so it looks strong for recruiters.
Each step = one commit. Run them in order. Verify after each.

> How to use with local Claude Code: open the repo, then prompt e.g.
> *"Read CONTEXT.md and implement Step 4 (Swagger), then run the verification
> for that step."* Do them one at a time and review each diff.

---

## 1. Analysis

**Strengths (keep highlighting these):**
- Clean layered backend (controllers → services → repositories → entities/DTOs).
- TypeScript across the whole stack; JWT + bcrypt auth; deployed and working.

**Issues to fix (by priority):**

| Pri | Problem | Fix in step |
| --- | ------- | ----------- |
| 🔴 | README is **UTF-16, looks corrupted** on GitHub | 1 |
| 🔴 | `back/dist/` (compiled output) committed to the repo | 2 |
| 🔴 | **No tests** | 5 |
| 🟡 | `swagger` installed but **unused** (no API docs) | 4 |
| 🟡 | **No CI/CD** | 6 |
| 🟡 | Typos in file/dir names (`Componets`, `FeasturesStection`, `category.respository`) | 8 |
| 🟢 | No LICENSE, no Docker, name inconsistency (SonNest vs SoundNest) | 1, 7 |
| 🟢 | Bug: dev `dataSource` reads `DB_USERNAME` but env defines `DB_USER` | 3 |

**Verified outcome of this playbook:** backend `tsc` + 10 Jest tests pass;
frontend `next build` passes after renames.

---

## 2. Playbook

Work on a feature branch:
```bash
git checkout -b upgrade-soundnest
```

### Step 1 — docs: README (UTF-8) + LICENSE

The current README is UTF-16. Recreate it as UTF-8. If editing in place keeps
UTF-16, delete and recreate:
```bash
rm README.md   # then create a fresh UTF-8 file
```

Create **`README.md`** (UTF-8). Use the version below (badges + Mermaid diagrams
render natively on GitHub):

> The full README content is in the file `README.md` produced by this upgrade.
> Key sections to include: title with emoji, shields.io badges (TypeScript,
> Next.js, React, Node, Express, PostgreSQL, TypeORM, Tailwind, JWT, MIT),
> live demo link, Table of contents, Features, Tech stack table, Architecture
> (mermaid `flowchart` + `erDiagram`), API reference table, Getting started
> (clone / backend / frontend), Running with Docker, Testing, Project structure,
> Roadmap, License, footer credit.

Create **`LICENSE`** (MIT):
```
MIT License

Copyright (c) 2026 Ale Falces

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Verify: `file README.md` should say *UTF-8*. Commit:
```bash
git add README.md LICENSE
git commit -m "docs: rewrite README in English and add MIT license"
```

### Step 2 — chore: stop tracking dist + env examples

Root **`.gitignore`**:
```
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
build/
.next/
out/

# Logs
*.log
npm-debug.log*

# Coverage
coverage/

# OS / editor
.DS_Store
.vscode/
.idea/
```

Untrack the committed build output:
```bash
git rm -r --cached back/dist
```

**`back/.env.example`**:
```
# Server
PORT=8080

# Local development database (used when NODE_ENV is not "production")
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=soundnest

# Production database (used when NODE_ENV=production)
DATABASE_URL=postgres://user:password@host:5432/dbname
# Set to "true" to auto-create tables on a fresh production/Docker database
DB_SYNCHRONIZE=false

# Auth
JWT_SECRET=replace-with-a-strong-secret
```

**`Front/my-app/.env.example`**:
```
# Base URL of the SoundNest backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
```

`Front/my-app/.gitignore` ignores `.env*`, so add an exception line after it:
```
.env*
!.env.example
```

Commit:
```bash
git add .gitignore back/.env.example Front/my-app/.gitignore
git add -f Front/my-app/.env.example
git commit -m "chore: stop tracking compiled dist and add env examples"
```

### Step 3 — fix: dev DB env var + opt-in prod sync

In **`back/src/config/dataSource.ts`**: in the development branch change
`username: process.env.DB_USERNAME` to `username: process.env.DB_USER`, and make
the production `synchronize` configurable. Final file:

```ts
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "../entities/User";
import { Credential } from "../entities/Credential";
import { Order } from "../entities/Order";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Allow turning schema synchronization on in production (e.g. for a fresh
// Docker/demo database) without changing code. Defaults to false in prod.
const synchronizeInProd = process.env.DB_SYNCHRONIZE === "true";

export const AppDataSource = new DataSource(
  isProduction
    ? {
        type: "postgres",
        url: process.env.DATABASE_URL,
        synchronize: synchronizeInProd,
        logging: false,
        entities: ["dist/entities/**/*.js"],
        migrations: ["dist/migrations/**/*.js"],
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        logging: true,
        entities: ["src/entities/**/*.ts"],
        migrations: ["src/migrations/**/*.ts"],
      }
);
```

Commit:
```bash
git add back/src/config/dataSource.ts
git commit -m "fix: align dev DB env var and allow opt-in prod schema sync"
```

### Step 4 — feat: Swagger API docs

`swagger-jsdoc` and `swagger-ui-express` are already in `back/package.json`.

Create **`back/src/docs/swagger.ts`**:
```ts
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SoundNest API",
      version: "1.0.0",
      description:
        "REST API for SoundNest, a full-stack musical instruments e-commerce. " +
        "Provides authentication, product browsing and order management.",
      contact: { name: "Ale Falces", url: "https://github.com/AleFalces" },
      license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
    },
    servers: [{ url: "http://localhost:8080", description: "Local development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "JWT received from the /users/login endpoint",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Fender Stratocaster" },
            description: { type: "string", example: "Classic electric guitar" },
            price: { type: "number", example: 1200 },
            stock: { type: "integer", example: 10 },
            image: { type: "string", example: "https://..." },
            categoryId: { type: "integer", example: 2 },
          },
        },
        RegisterUser: {
          type: "object",
          required: ["email", "password", "name", "address", "phone"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane@example.com" },
            password: { type: "string", example: "Str0ngPass!" },
            address: { type: "string", example: "123 Music St" },
            phone: { type: "string", example: "+1 555 0100" },
          },
        },
        LoginUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "jane@example.com" },
            password: { type: "string", example: "Str0ngPass!" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            login: { type: "boolean", example: true },
            user: { type: "object" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          },
        },
        CreateOrder: {
          type: "object",
          required: ["products"],
          properties: {
            products: { type: "array", items: { type: "integer" }, example: [1, 2] },
          },
        },
        Error: {
          type: "object",
          properties: {
            statusCode: { type: "integer", example: 400 },
            message: { type: "string", example: "Bad request" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
```

In **`back/src/server.ts`** add the imports and mount the UI before `app.use(router)`:
```ts
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
// ...
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

Add JSDoc `@openapi` annotations above each route in
`back/src/routes/products.router.ts`, `users.router.ts`, `orders.router.ts`
(documenting params, request bodies referencing the schemas above, and
responses). See the produced router files for the exact blocks.

Verify: `cd back && npx tsc --noEmit` and check `http://localhost:8080/api-docs`.
Commit:
```bash
git add back/src/docs/swagger.ts back/src/server.ts back/src/routes/*.ts
git commit -m "feat: add interactive Swagger API documentation"
```

### Step 5 — test: Jest + Supertest

Add dev deps to **`back/package.json`** and scripts:
```jsonc
"scripts": {
  "test": "jest --runInBand",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
// devDependencies: @types/jest ^29.5.12, @types/supertest ^6.0.2,
// jest ^29.7.0, supertest ^7.0.0, ts-jest ^29.2.5
```
```bash
cd back
npm i -D jest@^29.7.0 ts-jest@^29.2.5 @types/jest@^29.5.12 supertest@^7.0.0 @types/supertest@^6.0.2
```

In **`back/tsconfig.json`**: add `"jest"` to `compilerOptions.types`
(so it becomes `["node", "jest"]`) and exclude tests from the build:
```jsonc
"exclude": ["node_modules", "**/*.test.ts", "**/*.spec.ts"]
```

Create **`back/jest.config.js`**:
```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/docs/**",
    "!src/config/**",
  ],
};
```

Create the test files:

**`back/src/utils/errors.test.ts`**
```ts
import { ClientError } from "./errors";

describe("ClientError", () => {
  it("is an instance of Error", () => {
    expect(new ClientError("oops")).toBeInstanceOf(Error);
  });
  it("defaults to status code 400", () => {
    const err = new ClientError("bad request");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("bad request");
  });
  it("accepts a custom status code", () => {
    expect(new ClientError("unauthorized", 401).statusCode).toBe(401);
  });
});
```

**`back/src/utils/catchedController.test.ts`**
```ts
import { catchedController } from "./catchedController";

describe("catchedController", () => {
  it("calls the wrapped controller with req and res", async () => {
    const controller = jest.fn().mockResolvedValue(undefined);
    const handler = catchedController(controller);
    const req = {} as any, res = {} as any, next = jest.fn();
    await handler(req, res, next);
    expect(controller).toHaveBeenCalledWith(req, res);
    expect(next).not.toHaveBeenCalled();
  });
  it("forwards thrown errors to next()", async () => {
    const error = new Error("boom");
    const handler = catchedController(jest.fn().mockRejectedValue(error));
    const next = jest.fn();
    await handler({} as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
```

**`back/src/middlewares/userRegister.middleware.test.ts`**
```ts
import validateUserRegister from "./userRegister.middleware";
import { ClientError } from "../utils/errors";

const [validateRequiredFields] = validateUserRegister;

describe("validateUserRegister (required fields)", () => {
  const validBody = {
    email: "jane@example.com", password: "secret", name: "Jane",
    address: "123 Music St", phone: "+1 555 0100",
  };
  it("calls next() with no error when all fields are present", () => {
    const next = jest.fn();
    validateRequiredFields({ body: validBody } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });
  it("calls next() with a ClientError when a field is missing", () => {
    const next = jest.fn();
    const { email, ...incomplete } = validBody;
    validateRequiredFields({ body: incomplete } as any, {} as any, next);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ClientError);
    expect(error.message).toBe("Missing fields");
  });
});
```

**`back/src/routes/routes.integration.test.ts`**
```ts
import request from "supertest";
import app from "../server";

describe("API integration", () => {
  it("POST /users/register returns 400 when fields are missing", async () => {
    const res = await request(app).post("/users/register").send({ email: "a@b.c" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing fields");
  });
  it("POST /orders returns 400 without a token", async () => {
    const res = await request(app).post("/orders").send({ products: [1] });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("serves Swagger UI at /api-docs", async () => {
    const res = await request(app).get("/api-docs/").redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });
});
```

Verify: `npm test` → 10 passing. Then `npm run build` and confirm no
`*.test.js` in `dist/`. Commit:
```bash
git add back/package.json back/package-lock.json back/tsconfig.json \
        back/jest.config.js back/src/**/*.test.ts
git commit -m "test: add Jest and Supertest test suite"
```

### Step 6 — ci: GitHub Actions

Create **`.github/workflows/ci.yml`**:
```yaml
name: CI

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  backend:
    name: Backend · build & test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: back
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: back/package-lock.json
      - run: npm ci
      - run: npm run build
      - run: npm test

  frontend:
    name: Frontend · build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Front/my-app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: Front/my-app/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8080
```

Commit:
```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
```

### Step 7 — chore: Docker

**`back/Dockerfile`**:
```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

**`back/.dockerignore`**: `node_modules`, `dist`, `.env`, `coverage`, `npm-debug.log`

**`Front/my-app/Dockerfile`**:
```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

**`Front/my-app/.dockerignore`**: `node_modules`, `.next`, `.env*`, `npm-debug.log`

**`docker-compose.yml`** (root):
```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: soundnest
    ports: ["5432:5432"]
    volumes: ["db_data:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./back
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 8080
      DATABASE_URL: postgres://postgres:postgres@db:5432/soundnest
      DB_SYNCHRONIZE: "true"
      JWT_SECRET: change-me-in-production
    ports: ["8080:8080"]

  frontend:
    build:
      context: ./Front/my-app
      args:
        NEXT_PUBLIC_API_URL: http://localhost:8080
    restart: unless-stopped
    depends_on: ["backend"]
    ports: ["3000:3000"]

volumes:
  db_data:
```

Commit:
```bash
git add back/Dockerfile back/.dockerignore \
        Front/my-app/Dockerfile Front/my-app/.dockerignore docker-compose.yml
git commit -m "chore: add Docker and Docker Compose setup"
```

### Step 8 — refactor: fix misspelled names

Use `git mv` so history is preserved, then update imports.

**Backend:**
```bash
git mv back/src/repositories/category.respository.ts \
       back/src/repositories/category.repository.ts
```
Update the import in `back/src/helpers/preLoadCategories.ts`:
`../repositories/category.respository` → `../repositories/category.repository`.

**Frontend:**
```bash
cd Front/my-app
git mv src/Componets/landingHomeComponets/FeasturesStection.tsx \
       src/Componets/landingHomeComponets/FeaturesSection.tsx
git mv src/Componets/landingHomeComponets src/Componets/landingHome
git mv src/Componets src/components
git mv src/Hook src/hooks
```
Then update every import across `src` (9 files: `app/page.tsx`, `app/layout.tsx`,
`app/cart/Cart.tsx`, `app/products/Products.tsx`, `app/products/[id]/IdProducts.tsx`,
`app/loginUser/LoginUserForm.tsx`, `hooks/useLogin.ts`):
```bash
grep -rl '@/Componets\|@/Hook/\|landingHomeComponets\|FeasturesStection' src | while read f; do
  sed -i \
    -e 's#@/Componets/landingHomeComponets#@/components/landingHome#g' \
    -e 's#@/Componets#@/components#g' \
    -e 's#@/Hook/#@/hooks/#g' \
    -e 's#FeasturesStection#FeaturesSection#g' \
    "$f"
done
grep -rn '@/Componets\|@/Hook/\|landingHomeComponets\|FeasturesStection' src   # expect no output
```

Verify: `cd Front/my-app && npm run build` (must pass). Commit:
```bash
git add -A
git commit -m "refactor: fix misspelled file and directory names"
```

---

## 3. Final verification

```bash
# Backend
cd back && npm install && npm test && npm run build && cd ..
# Frontend
cd Front/my-app && npm install && npm run lint && npm run build && cd ../..
```

Then push your branch and open a PR:
```bash
git push -u origin upgrade-soundnest
```

## 4. Suggested commit order (recap)

1. `docs:` README (UTF-8) + LICENSE
2. `chore:` untrack dist + env examples + .gitignore
3. `fix:` DB env var + DB_SYNCHRONIZE
4. `feat:` Swagger at /api-docs
5. `test:` Jest + Supertest (10 tests)
6. `ci:` GitHub Actions
7. `chore:` Docker + docker-compose
8. `refactor:` fix typo'd file/dir names

## 5. Optional next steps (for the roadmap / extra polish)

- Stripe / Mercado Pago checkout.
- Admin dashboard for products & orders.
- Move cart persistence from `localStorage` to the backend.
- Playwright E2E tests; expand backend coverage to services.
- Cloudinary image uploads.

---

## 6. Prioritised roadmap (post-UI overhaul)

> Status (updated 2026-06-18): the quality playbook (§2), the full frontend UI
> overhaul, **P2–P4** (admin stock panel + CRUD, order detail, pagination/search,
> Zod validation), **Feature 2 — Mercado Pago Checkout Pro**, **Feature 2.5
> (payments docs)** and **Feature 4 (persistent cart, backend + frontend)** are
> all done and **merged to `main`**. The cart frontend (PR #15) was smoke-tested
> end-to-end on Node 20 and merged. **Feature 5 (MP webhooks) is also done and
> merged** (PRs #16/#17/#18). Backend suite is at **82 tests** on `main`. The front
> is on Vercel (`soundnest-musicstore`).
>
> **Backend deploy is DONE and LIVE (2026-06-19):** Render (backend) + Neon
> (Postgres, over SSL) + Vercel (frontend). The full flow works end-to-end,
> including Mercado Pago payments returning to the site via `auto_return`. See P0.
>
> **Feature 5: Mercado Pago payment webhooks ✅ DONE** (PRs #16, #17, #18 merged to
> `main`). See §8 below.
>
> **Feature 6: Cloudinary image uploads + admin panel polish ✅ DONE** (open **PR
> #20**). Backend upload endpoint (multer → Cloudinary, API secret server-side),
> admin file-picker upload + per-row image/category edit (with confirm modals),
> logout-redirects-home fix. Backend suite at **86 tests**.
>
> **NEXT SESSION:** admin order management / metrics. After that
> [[migrate-to-node-22]]. Deploy stays last.
>
> Work top-down. Run everything on **Node 20 via fnm** + **Postgres in Docker**
> (`docker compose up -d db`); Windows-native, no WSL.

### P0 — Production must actually work ✅ DONE (2026-06-19, LIVE end-to-end)
- [x] **Backend on Render** (`https://e-comerce-l5gu.onrender.com`), Node 20 via
      `back/.nvmrc`. Envs set: `DATABASE_URL`, `JWT_SECRET`, `MP_ACCESS_TOKEN`,
      `FRONTEND_URL` (Vercel https → `auto_return` works), `CLOUDINARY_*`.
- [x] **Database on Neon** (managed Postgres) — the old Render free Postgres had
      expired/been deleted (`ENOTFOUND dpg-...`; free Render PG deletes after ~90 days).
      Prod datasource needs **SSL** (`ssl:{rejectUnauthorized:false}`). Used
      `DB_SYNCHRONIZE=true` on the first boot to create the schema + seed, then off.
- [x] **Vercel** `NEXT_PUBLIC_API_URL` → the Render URL (inlined at build → redeploy
      after changing it).
- [x] **Prod smoke test**: catalog loads, login/register work, **Mercado Pago payment
      completes and returns to the site** via `auto_return`.
- Known follow-up: catalog images load slowly (hotlinked from slow external hosts,
  not the DB) → host the seed images on Cloudinary + `loading="lazy"`.

### P1 — Cheap cleanup (closes loops)
- [ ] Decide whether to version `CONTEXT.md` / `CLAUDE.md` or keep them local-only.
- [ ] Delete the merged `upgrade-soundnest` branch (local + remote).

### P2 — Admin panel for stock ✅ DONE (branch `admin-stock-panel`)
Key insight: **`User` already has a `role` enum (`admin` / `user`, default `user`)**
in `back/src/entities/User.ts`, so the auth groundwork existed.
- [x] **Backend**: `isAdmin` middleware (DB lookup by `userId`) · `PATCH /products/:id`
      (stock/price) guarded by `checkLogin` + `isAdmin` · admin seed on boot
      (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, default `admin@soundnest.com` / `Admin123!`) · +7 tests.
- [x] **Frontend**: `/admin` route gated by `user.role === "admin"` · editable
      stock/price table saving via `PATCH` · "Admin" nav link for admins.
- Defer (balloons it): product create/delete, image upload, order management, metrics.

### P3 — Small high-value features
- [x] **Order detail**: `userOrders` now shows each order's products + total. (The
      backend already returned `products` via the `["products"]` relation — frontend only.)
- [x] **Backend pagination + search**: `GET /products` now takes `?page&limit&search&category`
      and returns `{ data, page, limit, total, totalPages }`. Added `GET /categories` for the
      filter pills. Frontend products page uses server pagination + debounced search + page
      controls; cart/admin use `getAllProducts` (high limit) for the full list. +4 tests.

### P4 — Hardening
- [x] **DTO validation with Zod**: `validate(schema)` middleware + `schemas/` (register,
      login, order). Manual field checks removed; DB-invariant middlewares (unique email,
      items exist) kept. Fixed a latent crash in the old order validation. Friendlier 400
      messages (all failing fields joined).
- [x] **Expand tests**: now 36 (was 24) — the whole **service layer** is covered
      (added user/login, order create, credential hash/compare, category). Earlier:
      validate middleware, `getProductsService` pagination, `updateProductService`,
      `isAdmin`. Remaining gap: per-controller unit tests (controllers are thin and
      already exercised via `routes.integration.test.ts`) and several auth middlewares.

### P5 — Bigger / flashier
- [x] **Checkout (test mode)** — done with **Mercado Pago Checkout Pro** instead of
      Stripe (LATAM job market). See Feature 2 below.
- [x] **Payment webhooks** (`notification_url`) + a tunnel (ngrok) so order creation
      doesn't depend on the browser returning. Also fixes the localhost "no return
      button / no auto_return" issue. Done (Feature 5, §8; PRs #16/#17/#18).
- [~] **Cart persistence to the backend** (Feature 4): backend DONE & merged
      (entities/service/routes, PRs #12 & #14, 60 tests). Frontend (4.4) in progress.
- [x] **Cloudinary** image uploads. Done (Feature 6, PR #20): backend upload
      endpoint + admin file-picker / per-row image & category edit.

---

## 7. Detailed feature plan (next 4 features, in order)

> Agreed scope & order: **(1) Product CRUD in admin → (2) Stripe checkout (test) →
> (3) Expand tests → (4) Cart to backend.** Each numbered step = one reviewable
> commit. Verify after each (`npm test` + `npm run build` back, `npm run build`
> front). Anchored to the real code as of branch `admin-stock-panel`. Keep all new
> code in the existing layered structure and on the design-system tokens.

> **TDD (since 2026-06-16).** Work test-first: red (write the failing spec) → green
> (minimum code to pass) → refactor. Apply strict TDD to the **service / middleware
> / business-logic** layers (mock repositories like `products.service.test.ts`).
> **React UI and external-redirect flows** (Stripe Checkout redirect) are
> test-after / manual smoke. In the steps below the test sub-step comes **first**
> for every backend-logic change.

Notes that shape every step below:
- `Product` entity has `name, description, price, stock, image, categoryId`
  (`back/src/entities/Product.ts`). There is no `createdAt`.
- Validation pattern: Zod schema in `back/src/schemas/` + `validate(schema)`
  middleware; admin guard = `checkLogin` then `isAdmin` (reads `req.body.userId`).
- Frontend admin reads the user straight from `localStorage` and gates on
  `user.role === "admin"` (`app/admin/AdminProducts.tsx`).
- Product services are plain exported functions in
  `back/src/services/products.service.ts` using `ProductRepository`.

---

### Feature 1 — Product CRUD in the admin panel

Today admin can only edit `stock`/`price` (`PATCH /products/:id`). Add **create**,
**delete**, and full **edit** (name/description/price/stock/image/category).

> **✅ DONE on `admin-stock-panel` (TDD backend + frontend).** Backend (1.1–1.3):
> `createProductService` / `deleteProductService` / extended `updateProductService`
> (404 guards), Zod `createProductSchema` + `updateProductSchema`, admin-guarded
> `POST /products` & `DELETE /products/:id` (+ `validate()` on POST/PATCH), and the
> `updateProduct` controller cleaned of hand-rolled checks — 46 tests green. Frontend
> (1.4–1.5): `createProduct`/`deleteProduct` + generalised `updateProduct` API client;
> admin UI with an add-product form (category select from `/categories`) and a
> per-row delete (window.confirm). Lint+build clean; end-to-end smoke verified
> (create 201, invalid body 400, delete 204, missing 404). **Remaining: `@openapi`
> blocks for the new routes (optional, cosmetic for Swagger).**

**1.1 — RED: service specs first**
- In `products.service.test.ts` add failing cases (mock `ProductRepository` +
  `CategoryRepository` like the existing tests):
  - `createProductService` — happy path (saves, returns with category) and bad
    `categoryId` (throws 400/404).
  - `deleteProductService` — happy path (calls `remove`) and missing id (404).
  - extended `updateProductService` — updates the full optional field set.
- Run `npm test` → these fail (functions don't exist yet). _Commit (optional):_
  `test(products): failing specs for create/update/delete services`.

**1.2 — GREEN: schemas + service functions**
- `back/src/schemas/product.schema.ts` (new): `createProductSchema` (name,
  description, price≥0, stock int≥0, image url, categoryId int) and
  `updateProductSchema` (all optional via `.partial()`). Mirror the message style
  in `user.schema.ts`.
- In `products.service.ts` implement until 1.1 is green:
  - `createProductService(data)` → validate `categoryId` exists via
    `CategoryRepository.findOneBy`; `ProductRepository.create/save`; return with
    `category` relation.
  - `deleteProductService(id)` → 404 if missing; `ProductRepository.remove`.
  - Extend `updateProductService` to accept the full optional field set (keep the
    existing stock/price behaviour as a subset) so the edit form can reuse it.
- _Commit:_ `feat(products): create/update/delete services + zod product schemas`

**1.3 — Controller + routes (admin-guarded), guard specs first**
- RED: in `routes.integration.test.ts` add cases — `POST /products` and
  `DELETE /products/:id` return 400 without a token (mirror existing cases).
- GREEN: `product.controller.ts` add `createProduct`, `deleteProduct`; broaden
  `updateProduct` to pass through the validated body instead of only stock/price.
  Drop the hand-rolled checks in favour of `validate()` (keep the `Invalid product
  id` NaN guard). `products.router.ts`:
  - `POST /` → `checkLogin, isAdmin, validate(createProductSchema), createProduct`
  - `PATCH /:id` → add `validate(updateProductSchema)` before `updateProduct`
  - `DELETE /:id` → `checkLogin, isAdmin, deleteProduct`
  - Add `@openapi` blocks matching the existing style.
- _Commit:_ `feat(products): admin POST/PATCH/DELETE routes for full CRUD`

**1.4 — Frontend services**
- `services/productsServices.ts`: add `createProduct(data)` (POST `/products/`),
  `deleteProduct(id)` (DELETE `/products/:id`); generalise `updateProduct` to take
  the full optional payload. Reuse `apiServices` + `handleAxiosError`.
- Fetch categories for the form via existing `categoriesServices.ts`.
- _Commit:_ `feat(admin): product create/delete/update API client`

**1.5 — Frontend admin UI** (test-after / manual smoke)
- In `app/admin/AdminProducts.tsx` (or split into `AdminProductForm.tsx` +
  `AdminProductRow.tsx` to keep the file readable):
  - "Add product" button → modal/inline form (name, description, price, stock,
    image URL, category select). On success prepend to `products`.
  - Per-row delete button with a confirm (toast or simple `window.confirm`); on
    success remove from state.
  - Keep the existing inline stock/price editing; optionally a full "edit" row.
  - Use only design tokens / `.btn` / `.input` / `.card`; `react-hot-toast` for
    feedback (already used).
- Manual smoke: log in as admin, create → edit → delete a product.
- _Commit:_ `feat(admin): create, edit and delete products from the stock panel`

Verify: `cd back && npm test && npm run build`; `cd Front/my-app && npm run build`.

---

### Feature 2 — Checkout (test mode) ✅ DONE with Mercado Pago

> **✅ DONE & merged to `main` (2026-06-16).** Implemented with **Mercado Pago
> Checkout Pro** (not Stripe — chosen for the LATAM job market). Backend TDD,
> 57 tests. Steps shipped:
> - **2.1** `mercadopago` SDK + `config/mercadopago.ts` client; `MP_ACCESS_TOKEN`
>   + `FRONTEND_URL` in `envs.ts`.
> - **2.2** `createPreferenceService` → `POST /payments/create-preference`
>   (`checkLogin` + `validate(orderSchema)`); items + `metadata` (user_id,
>   product_ids) + three `back_urls`.
> - **2.3** `confirmPaymentService` → `GET /payments/confirm`; verifies status vs
>   MP, creates the order from metadata, idempotent via nullable `Order.paymentId`.
>   `auto_return` only when `FRONTEND_URL` is https (MP rejects it on localhost).
> - **2.4** Frontend: `paymentServices.ts`, cart redirects to MP,
>   `/checkout/success|pending|failure` pages. Smoke-tested end-to-end in sandbox.
>
> **Still pending:** **2.5** docs (README + Swagger `@openapi` for the two routes);
> guard the double `confirm` call (React StrictMode); webhooks (see P5).
>
> Local test gotchas (sandbox): buyer must be a **test user** (else "una de las
> partes es de prueba"); on localhost MP shows no return button and no
> `auto_return`, so confirm by opening
> `/checkout/success?payment_id=<id>` manually (a tunnel/ngrok fixes this).

The original Stripe-based plan is kept below for reference only.

### Feature 2 (original Stripe plan — superseded, kept for reference)

Goal: from the cart, start a **Stripe Checkout Session**; on success create the
order (reusing `createOrderService`) and clear the cart. Test mode only.

Prereqs (user provides): Stripe **test** keys. Backend `STRIPE_SECRET_KEY`
(+ add to `.env.example` and docker-compose `backend.environment`); frontend
`NEXT_PUBLIC_BASE_URL` for redirect URLs (defaults to `http://localhost:3005`).

**2.1 — Backend: Stripe dependency + config**
- `cd back && npm i stripe`.
- `back/src/config/stripe.ts` (new): instantiate `new Stripe(envs.STRIPE_SECRET_KEY)`.
- Add `STRIPE_SECRET_KEY` to `config/envs.ts` and `.env.example`.
- _Commit:_ `chore(payments): add stripe sdk and config`

**2.2 — Backend: create-checkout-session endpoint (TDD)**
- RED: `payment.service.test.ts` with the Stripe client mocked
  (`jest.mock("../config/stripe")`) — assert `createCheckoutSessionService` builds
  the right `line_items` (name + `unit_amount` in cents from product price),
  `mode: "payment"`, metadata carries `userId` + product ids, and returns
  `session.url`. Run → fails.
- GREEN: `payment.service.ts`: `createCheckoutSessionService(productIds, userId)`
  → resolve products (reuse logic like `order.service`), build the session as the
  test expects, `success_url`/`cancel_url` pointing at the front. Controller +
  route `POST /payments/create-checkout-session` guarded by `checkLogin` +
  `validate` (reuse/extend the order Zod schema: `products: number[]`). Register
  `payments.router.ts` in `routes/index.ts`. Add the 400-without-token integration
  case.
- _Commit:_ `feat(payments): stripe checkout session endpoint`

**2.3 — Order creation on success (TDD)**
- RED: extend `payment.service.test.ts` — `confirmCheckoutService(sessionId)`
  creates an order via `createOrderService` only when the retrieved session is
  `paid`, and is idempotent (no duplicate order for the same session). Mock
  `stripe.checkout.sessions.retrieve`.
- GREEN: `GET /payments/confirm?session_id=...` the success page calls — verify
  `paid`, then call `createOrderService` with the metadata, idempotently (skip if
  an order for that session exists — add a nullable `stripeSessionId` column to
  `Order`, or guard for the demo).
  - (Webhooks `checkout.session.completed` are the "correct" approach; note it in
    the roadmap as a follow-up since local webhooks need the Stripe CLI.)
- _Commit:_ `feat(payments): create order after a paid checkout session`

**2.4 — Frontend integration**
- `services/paymentServices.ts`: `startCheckout(productIds)` → POST, then
  `window.location.href = session.url`.
- `app/cart/Cart.tsx`: replace the current checkout action with `startCheckout`
  using `cartIds`.
- Success page `app/checkout/success/page.tsx`: call `/payments/confirm`, then
  `clearCart()` and show confirmation; `app/checkout/cancel/page.tsx` for cancel.
- _Commit:_ `feat(checkout): stripe-powered cart checkout with success/cancel pages`

**2.5 — Docs** (service + confirm specs already written in 2.2/2.3)
- README + Swagger: document test-mode checkout and the test card `4242 4242 4242 4242`.
- _Commit:_ `docs(payments): document test-mode stripe checkout`

Verify: backend build/test green with Stripe mocked (no real network in tests).

---

### Feature 3 — Expand backend tests (close P4 `[~]`) ✅ DONE — 36 tests

> Done first (before Feature 1) to leave the existing base tested. Added
> `category.service.test.ts`, `order.service.test.ts`, `credential.service.test.ts`,
> `user.service.test.ts`; removed the stray `console.log` in `order.service.ts`.
> All four service files mock their repositories. Suite: 24 → 36, build clean.

Target the untested service layer. Use the existing `ts-jest` setup; mock
repositories the way `products.service.test.ts` already does.

**3.1 — `category.service.test.ts`**: `getCategoriesService` returns repo results
ordered by id (mock `CategoryRepository.find`).

**3.2 — `order.service.test.ts`**: `createOrderService` — happy path (sets
`status="approved"`, attaches user + de-duped products, saves) and the two error
branches (product not found, user not found). Mock the three repositories.
- (While here: the stray `console.log(userF)` in `order.service.ts` can be removed
  in this commit.)

**3.3 — `user.service.test.ts`** + **`credential.service.test.ts`**: register
(hashes password, rejects duplicate email) and login (valid → token/user,
invalid → error). Mock bcrypt + jwt + repositories. Read the actual services first
to match their signatures.

- _Commits:_ one per service file, e.g. `test(orders): cover createOrderService`.

Verify: `cd back && npm test` — count climbs from 24; `npm run build` stays green.

---

### Feature 4 — Move the cart from localStorage to the backend

Persist the cart per authenticated user; keep a localStorage fallback for guests
and merge on login. Bigger change — do it last.

> **Status (2026-06-17): backend DONE & merged, frontend IN PROGRESS.**
> - **4.1 entities + repository** — `Cart` (one per user, `@OneToOne User`, eager
>   `items`) + `CartItem` (`@ManyToOne` Cart/Product, `quantity`, `@Unique(["cart",
>   "product"])`); `CartRepository` / `CartItemRepository`. Merged (**PR #12**).
> - **4.2 service (TDD, 11 tests)** — `getCartService` (lazy-create),
>   `addItemService` (stock-checked: 400 over stock, 404 missing product),
>   `removeItemService` (decrement, drop at 0), `removeProductService`,
>   `clearCartService`. Merged (**PR #12**).
> - **4.3 HTTP layer** — `addItemSchema` (Zod), `cart.controller` (5 thin handlers),
>   `cart.router` behind `checkLogin` mounted at `/cart` (`GET /cart`,
>   `POST /cart/items`, `DELETE /cart/items/:productId`, `.../:productId/all`,
>   `DELETE /cart`) + `@openapi` + `Cart`/`CartItem` Swagger schemas + 3 integration
>   "400 without token" cases. Backend suite now **60 tests**. Merged (**PR #14**).
> - **4.4 frontend** — NEXT, see the refined plan below.
>
> Aside: Vercel deployed the front (`soundnest-musicstore`) and auto-opened+merged
> **PR #13** bumping React/Next.js to patch a critical RSC RCE (CVE-2025-55182 /
> CVE-2025-66478). Branch frontend work off the updated `main` so the patched
> Next.js is kept.
>
> **Refined 4.4 plan (anchored to the real code):** the backend models the cart as
> `CartItem { product, quantity }`, but the frontend `CartContext` public API speaks
> in `cartIds: number[]` (ids repeated N times) and **5 consumers** depend on it
> (`Card`, `Navbar`, `Cart`, `IdProducts`, checkout `success`). **Keep that public
> API unchanged**; internally translate the server cart → `cartIds` by repeating
> each `product.id` `quantity` times (`flattenCart`), so `getCartCount` /
> `getRemainingStock` keep working with zero consumer changes. Pieces:
> 1. `services/cartServices.ts` — Axios client over `apiServices` (token auto-injected
>    by its interceptor): `getCart`, `addCartItem`, `removeCartItem`,
>    `removeCartProduct`, `clearCartApi`; each returns the server cart.
> 2. `flattenCart(serverCart) → number[]` helper.
> 3. Rewrite `CartContext` to source from `useAuth()`: **guest** = current
>    localStorage behaviour untouched; **logged in** = load via `getCart` on
>    mount/login and mutate via the API, refreshing `cartIds` from each response.
> 4. **Merge on login** (delicate): when `isAuthenticated` flips false→true and a
>    guest localStorage cart exists, push each unit to the server, clear local, then
>    load the server cart. Server rejects over-stock with 400 — ignore silently in
>    the merge.
> Providers already nest correctly (`CartProvider` inside `AuthProvider` in
> `layout.tsx`), so `useCart` can call `useAuth`.

**4.1 — Backend: Cart entity + repository**
- `entities/Cart.ts`: `id`, `@OneToOne` User, and either a `@ManyToMany Product`
  list or a `CartItem` child entity with `quantity` (quantity is cleaner given the
  current "ids repeated N times" model — prefer `CartItem { product, quantity }`).
- `repositories/cart.repository.ts` singleton like the others.
- _Commit:_ `feat(cart): cart + cart item entities`

**4.2 — Backend: cart service + routes (auth-guarded), TDD**
- RED: `cart.service.test.ts` (mock cart/product repositories) — `addItem` respects
  stock, `removeItem`, `clearCart`, and lazy-create on first `getCart`. Run → fails.
- GREEN: `cart.service.ts`: `getCart(userId)`, `addItem(userId, productId)`
  (respects stock), `removeItem`, `clearCart`. Create the cart lazily on first
  access. `GET/POST/DELETE /cart` routes behind `checkLogin`; Zod-validate bodies;
  add the 400-without-token integration case. Swagger blocks.
- _Commit:_ `feat(cart): persistent cart endpoints`

**4.3 — Frontend: cart service + context swap**
- `services/cartServices.ts` for the new endpoints.
- Rework `components/CartContext.tsx`: when logged in, source state from the API
  (load on mount/login, mutate via API with optimistic update); when logged out,
  keep the current localStorage behaviour. Preserve the existing public API
  (`addToCart`, `removeOneFromCart`, `getCartCount`, …) so callers don't change.
- On login, merge the guest localStorage cart into the server cart, then clear it.
- _Commit:_ `feat(cart): back the cart with the API for logged-in users`

**4.4 — UI smoke** (service specs already written in 4.2)
- Manual smoke: add as guest → login → cart merges → checkout. Optionally a small
  test for the merge helper if it's pure.

Verify: full run — `cd back && npm test && npm run build`; front build.

---

### After all four
- Update README features/roadmap and the API table; tick P4/P5 items above.
- Open PR(s) into `main`. Consider landing Feature 1 and 3 first (low-risk) and
  Stripe/cart behind their own PRs.

---

## 8. Feature 5 — Mercado Pago payment webhooks ✅ DONE

Goal: create the order from a **server-to-server** Mercado Pago notification, not
only from the browser returning to `/checkout/success` (which fails if the buyer
closes the tab, or on localhost where MP shows no return button). Shipped across
**PRs #16, #17** (W1–W4) and **#18** (integration test + `notification_url`), all
merged to `main`. TDD on the service/controller logic. Backend suite at **82 tests**.

Anchored to the real code: `confirmPaymentService` already verified payment status
against MP and created the order idempotently (guard: nullable `Order.paymentId`),
so the webhook **reuses** that logic. Backend suite: **80 tests** on the branch.

### Done (committed + pushed on PR #16)
- **W1 `chore`** — envs `BACKEND_URL` (public base for the webhook URL) and
  `MP_WEBHOOK_SECRET` (signature secret) in `config/envs.ts` + `.env.example`.
- **W2 `refactor`** — extracted `processPaymentService(paymentId): Order | null`
  (idempotent verify-and-create; returns `null` when not yet approved).
  `confirmPaymentService` delegates to it and keeps its 402 contract. +3 tests.
- **W3 `feat`** — `utils/mpWebhookSignature.ts` `verifyMpWebhookSignature` (pure
  HMAC-SHA256 of MP's manifest `id:<dataId>;request-id:<reqId>;ts:<ts>;`, constant-
  time compare). +3 tests.
- **W4 `feat`** — `paymentWebhook` controller + public `POST /payments/webhook`
  route (no `checkLogin`): extracts `type` + `data.id` (query, body fallback),
  validates signature when `MP_WEBHOOK_SECRET` is set (→ 401), calls
  `processPaymentService`, always acks **200** (a thrown error → 500 so MP retries).
  +3 controller tests + Swagger `@openapi`.

### Done (PR #18, merged)
- **W5a integration test**: `POST /payments/webhook` is public — asserts it does NOT
  return the 400 "Token is required" the other payment routes do (a non-`payment`
  event short-circuits to 200 without touching MP).
- **W5b `notification_url`** on the preference in `createPreferenceService`: set to
  `${BACKEND_URL}/payments/webhook` **only when `BACKEND_URL` is a public https URL**
  (same guard as `auto_return`), so local-without-tunnel still works via the browser
  confirm flow. Tests cover present-when-public and omitted-when-empty.
- **W5c docs**: README webhooks section + ngrok note; CLAUDE.md API table + envs.

### For the live end-to-end test (user-side, optional, when ready)
- ngrok (or similar) to expose the backend publicly; a webhook secret from the MP
  panel. All unit tests pass without either (MP is mocked).

**Done since:** Feature 6 (Cloudinary uploads), the **production deploy** (Render +
Neon + Vercel, live end-to-end — see §6 P0), and the **keep-alive** (health probe +
scheduled ping, §9.1). **Next:** performance §9, then admin order management / metrics.

---

## 9. Performance optimization plan

> Triggered by "the app feels slow". Diagnosed (2026-06-19) with real measurements,
> ordered by impact. The frontend was already fine (cards use `loading="lazy"` +
> `decoding="async"`); the API is fast warm (~0.8s, ~3KB payloads).

### 9.1 — Cold start ✅ DONE
The free Render instance slept after ~15 min → first request **~32s**. Fixed with a
lightweight `GET /health` (no DB) + a scheduled ping (GitHub Action every 10 min,
PR #23) **and** an external UptimeRobot monitor (every 5 min) as a reliable backup.
Render now stays warm. Neon is intentionally **left to auto-suspend** (resumes in
~1–4s on the first query) so we don't burn its free compute budget — pinging
`/health` avoids touching the DB on purpose.

### 9.2 — Catalog images → Cloudinary (the main remaining win)
Catalog images are hotlinked from uncontrolled external hosts: inconsistent
(amazon ~0.4s, mlstatic ~7s) and some **broken** (stringsbymail returns 25 bytes),
and oversized (a 1500px/126KB image for a ~400px card). The DB only stores the URL,
so this is purely an image-hosting problem.
- **Migrate**: a one-time script (`back/src/scripts/`) iterating products, uploading
  each current image URL to Cloudinary (the uploader accepts remote URLs), and
  storing the `secure_url`. Add a `--dry-run` mode; run it against prod (Neon
  `DATABASE_URL` + `NODE_ENV=production` + Cloudinary creds locally). Broken URLs
  fail to upload → log and skip, fix those by hand via the admin panel.
- **Optimize delivery**: serve with `f_auto,q_auto` + a sensible width so a 126KB
  image drops to ~15KB WebP. This is where most of the speed comes from.
- The prod DB is already seeded, so changing the seed won't update existing rows —
  the script (or admin re-upload) is required. Also update the seed for fresh DBs.

### 9.3 — Cheap backend wins
- **gzip compression** (`compression` middleware) — smaller JSON responses.
- **Cache-Control** on `/categories` (rarely changes) and a short cache on
  `/products` — fewer/cheaper repeat fetches.

### 9.4 — Out of scope (low ROI)
- `next/image` — redundant once images are optimized on Cloudinary.

### Other follow-ups (not performance)
- Admin order management / metrics (Feature 7).
- [[migrate-to-node-22]] — low priority now (prod already runs fine on its Node).
- Change the default admin password (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) now that the
  site is public.

---

## 10. Feature 8 — Bulk product import (import API + admin upload + n8n)

> Planned, not started (documented 2026-06-22). Motivation: a real bulk-load /
> stock-update feature **and** a vehicle to study **n8n** (workflow automation) +
> document-extraction AI. The pitch: turn supplier **invoices** into structured
> rows and load them into the store automatically.

### Core idea — one endpoint, several clients
The heart is a single backend **bulk endpoint**; it neither knows nor cares where
the JSON comes from. Then we attach clients:
- **Admin upload button** — uploads an Excel/CSV, turns it into the JSON, calls the
  endpoint. Manual, human-in-the-loop.
- **n8n flow** — invoice photo/PDF → an AI/LLM node extracts the line items into the
  **same JSON** → HTTP node calls the **same** endpoint. Automated.

Both speak the **same JSON contract**, so we define it once and build the clients
incrementally. The admin button doubles as the test harness for the endpoint that
n8n will later drive.

```
  [Admin: Excel/CSV] ─┐
                      ├─► POST /products/bulk (one JSON contract) ─► upsert + stock
  [n8n: invoice→AI] ──┘                                              (idempotent)
```

### Open design decisions (settle before coding)
1. **JSON contract** — fields per line (draft: `sku`, `name`, `description?`,
   `price?`, `stock`, `categoryId|categoryName`, `image?`). Pin exact required vs
   optional.
2. **Stock semantics** — `sum` (`stock += qty`, the invoice case) vs `set`
   (overwrite). Likely a per-request `mode` flag; default `sum`.
3. **Product identity** — `Product` has only `id` + `name` today. Add a **unique
   `sku`** (or barcode) so "update the existing one" is deterministic; matching by
   name is fragile. This is the gating schema change.
4. **Idempotency** — reprocessing the same invoice must not double-add stock. Track a
   processed import/invoice id (same idea as the nullable `Order.paymentId` guard).
5. **Auth for machines** — n8n shouldn't use the admin JWT (expires). Add a dedicated
   **API key / service token** for machine-to-machine access.
6. **Excel parsing location** — keep the backend **JSON-only**; parse the spreadsheet
   in the admin frontend (e.g. SheetJS) or in n8n. Backend stays format-agnostic.
7. **Images** — invoices rarely carry product images. MVP: bulk-created products get a
   **placeholder**, fill real images later via the admin (Cloudinary upload already
   exists). A later n8n step could fetch/upload images; keep it out of the MVP.

### Phased plan (each = reviewable, useful on its own)
- **Phase 0 — schema:** add unique `sku` to `Product` (+ migration/seed). Enables the
  rest.
- **Phase 1 — backend (TDD):** `bulkUpsertProductsService` (upsert + stock sum/set +
  idempotency) and `POST /products/bulk` guarded by the API key. A complete,
  demonstrable feature on its own, testable without n8n.
- **Phase 2 — admin upload UI:** an "Import" screen that parses an Excel/CSV and posts
  to the endpoint, with a preview/confirm before applying.
- **Phase 3 — n8n flow:** invoice → AI extraction (Claude as the LLM node) → JSON →
  the endpoint, against a backend that already works.
- **Images:** handled later (placeholder first, optional n8n image step).

### Notes
- Build on **this repo** (SoundNest as the target store): reuses auth, admin,
  Cloudinary and the catalog.
- Run n8n self-hosted in **Docker** (Windows-native — see [[windows-only-no-wsl]]).
- Sequencing vs Feature 7 is open; both are candidate "next big features".
