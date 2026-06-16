# 🎸 SoundNest

> Full-stack e-commerce for musical instruments — browse the catalog, register, log in, manage a persistent cart and place stock-validated orders.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

🔗 **Live demo:** https://soundnest-musicstore-git-main-alefalces-projects.vercel.app

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [API reference](#api-reference)
- [Getting started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [Project structure](#project-structure)
- [License](#license)

---

## Features

- 🔐 **JWT authentication** with bcrypt-hashed passwords
- 👤 User registration and login
- 🛒 Persistent cart (LocalStorage)
- 📦 Stock validation on checkout
- 🔒 Protected private routes
- 🧾 Basic order history
- 🔎 Filtering by name and category
- ✅ Friendly confirmations (SweetAlert2)
- 📱 Responsive design

---

## Tech stack

| Layer       | Technologies                                                                 |
| ----------- | ---------------------------------------------------------------------------- |
| **Frontend**| Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Axios · SweetAlert2 · React Toastify · Lucide |
| **Backend** | Node.js · Express · TypeScript · TypeORM · PostgreSQL · JWT · Bcrypt          |
| **Tooling** | Jest · Supertest · Swagger · GitHub Actions · Docker                          |
| **Deploy**  | Vercel (frontend) · Render (backend)                                          |

---

## Architecture

```mermaid
flowchart LR
    subgraph Client
        FE[Next.js 15 App Router<br/>React 19 + Tailwind]
    end
    subgraph Server
        API[Express REST API]
        API --> C[Controllers]
        C --> S[Services]
        S --> R[Repositories]
        R --> DB[(PostgreSQL)]
    end
    FE -- Axios / JWT --> API
```

### Data model

```mermaid
erDiagram
    USER ||--|| CREDENTIAL : has
    USER ||--o{ ORDER : places
    ORDER }o--o{ PRODUCT : contains
    PRODUCT }o--|| CATEGORY : belongs_to

    USER { int id string name string email string address string phone }
    CREDENTIAL { int id string password }
    PRODUCT { int id string name string description number price int stock string image }
    CATEGORY { int id string name }
    ORDER { int id date date }
```

---

## API reference

Interactive docs are served at **`/api-docs`** (Swagger UI) when the backend is running.

| Method | Endpoint          | Auth | Notes                              |
| ------ | ----------------- | :--: | ---------------------------------- |
| POST   | `/users/register` |  ❌  | Validated by DTO middleware        |
| POST   | `/users/login`    |  ❌  | Returns `{ login, user, token }`   |
| POST   | `/users/orders`   |  ✅  | List the current user's orders     |
| GET    | `/products`       |  ❌  | List products                      |
| GET    | `/products/:id`   |  ❌  | Single product                     |
| POST   | `/orders`         |  ✅  | Create order, validates stock      |

> Auth: send the JWT in the `Authorization` header (no `Bearer` prefix).

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 1. Clone

```bash
git clone https://github.com/AleFalces/E-comerce.git
cd SonNest-Music
```

### 2. Backend

```bash
cd back
cp .env.example .env   # then fill in the values
npm install
npm run dev            # http://localhost:8080
```

### 3. Frontend

```bash
cd Front/my-app
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:3000
```

On boot the backend auto-seeds the categories and products.

---

## Running with Docker

Spin up database, backend and frontend with a single command:

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend → http://localhost:8080
- Swagger → http://localhost:8080/api-docs

---

## Testing

```bash
cd back
npm test          # run the Jest + Supertest suite
npm run test:cov  # with coverage
```

---

## Project structure

```
SonNest-Music/
├── back/                 # Express + TypeORM REST API
│   └── src/
│       ├── config/       # envs, dataSource
│       ├── controllers/  # HTTP layer
│       ├── services/     # business logic
│       ├── repositories/ # TypeORM data access
│       ├── entities/     # User, Credential, Product, Category, Order
│       ├── dtos/         # data transfer objects
│       ├── middlewares/  # validation + auth
│       ├── docs/         # Swagger spec
│       └── routes/       # users / products / orders routers
└── Front/my-app/
    └── src/
        ├── app/          # App Router pages
        ├── components/   # UI components
        ├── services/     # Axios API clients
        ├── interfaces/   # shared TS types
        ├── hooks/        # custom hooks
        └── helpers/      # validations + utils
```

---

## License

Released under the [MIT License](./LICENSE).

---

<p align="center">Built with ❤️ by <a href="https://github.com/AleFalces">Ale Falces</a></p>
