# Shadow — Habit Tracker PWA

A production-ready habit tracker with streak protection via **grace days**.  
Built with **Next.js 14 · Express · PostgreSQL · Prisma · Tailwind CSS · JWT Auth**.

---

## ✨ Features

- **Authentication** — JWT-based signup / login / logout  
- **Habit Management** — Create, edit, delete habits with daily or custom schedules  
- **Grace Day System** — Missing one day doesn't break your streak if grace is enabled  
- **Daily Tracking** — Mark habits complete, use grace day, or undo completion  
- **Streak Engine** — Current streak, longest streak, per-habit history  
- **Calendar View** — Monthly view with ✅ / ❌ / 🟡 day indicators  
- **Analytics** — Weekly bar chart, monthly line chart, per-habit performance  
- **PWA** — Installable, offline-ready via service worker  
- **Responsive** — Desktop sidebar + top nav, mobile bottom navigation  

---

## 🗂️ Project Structure

```
grace-day/
├── backend/      Express + Prisma + PostgreSQL API
└── frontend/     Next.js 14 App Router + Tailwind CSS
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+  
- **PostgreSQL** 14+ running locally (or a hosted instance)  
- **npm** or **yarn**

---

### 1 · Clone & Navigate

```bash
git clone https://github.com/yourname/grace-day.git
cd grace-day
```

---

### 2 · Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Seed demo data
npm run db:seed

# Start dev server (port 4000)
npm run dev
```

The API will be available at `http://localhost:4000`.  
Health check: `http://localhost:4000/health`

---

### 3 · Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env
# NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Start dev server (port 3005)
npm run dev
```

Open `http://localhost:3005` in your browser.

---

### 4 · Demo Login

After seeding, use:
- **Email:** `demo@graceday.app`  
- **Password:** `password123`

Or register a new account via `/signup`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/graceday` |
| `JWT_SECRET` | Secret key for signing tokens | `a-long-random-secret-string` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | API server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3005` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api` |

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/me` | ✅ | Update profile |
| PATCH | `/api/auth/me/password` | ✅ | Change password |

### Habits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/habits` | ✅ | List all habits + streaks |
| POST | `/api/habits` | ✅ | Create habit |
| GET | `/api/habits/:id` | ✅ | Get habit + history |
| PATCH | `/api/habits/:id` | ✅ | Update habit |
| DELETE | `/api/habits/:id` | ✅ | Soft-delete habit |
| POST | `/api/habits/:id/log` | ✅ | Log completion / missed / grace |
| GET | `/api/habits/:id/streak` | ✅ | Get streak + 90-day history |
| GET | `/api/habits/calendar` | ✅ | Monthly calendar data |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | ✅ | Summary stats |
| GET | `/api/analytics/weekly` | ✅ | Last 4 weeks chart data |
| GET | `/api/analytics/monthly` | ✅ | Last 6 months chart data |
| GET | `/api/analytics/streaks` | ✅ | All habit streaks |

---

## 🏗️ Production Build

### Backend

```bash
cd backend
npm run build        # compiles TypeScript → dist/
npm start            # runs dist/app.js
```

### Frontend

```bash
cd frontend
npm run build        # Next.js production build
npm start            # starts on port 3005
```

---

## 🐳 Docker (optional)

Create a `docker-compose.yml` at the root:

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: graceday
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports: ['4000:4000']
    depends_on: [db]

  frontend:
    build: ./frontend
    env_file: ./frontend/.env
    ports: ['3005:3005']
    depends_on: [backend]

volumes:
  pgdata:
```

```bash
docker compose up --build
```

---

## 📱 PWA Installation

- **Mobile (iOS/Android):** Open in Safari/Chrome → browser menu → "Add to Home Screen"  
- **Desktop (Chrome/Edge):** Click the install icon (⊕) in the address bar  

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State management | Zustand |
| Charts | Recharts |
| Icons | React Icons (Feather) |
| Backend framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| PWA | next-pwa |

---

## 📂 Key File Locations

| File | Purpose |
|---|---|
| `backend/src/services/streak.service.ts` | Core streak + grace day logic |
| `backend/src/services/analytics.service.ts` | Weekly / monthly aggregation |
| `frontend/middleware.ts` | JWT-based route protection |
| `frontend/store/habitStore.ts` | Zustand habits state + API calls |
| `frontend/store/authStore.ts` | Zustand auth state + token management |
| `frontend/public/manifest.json` | PWA manifest |

---

## License

MIT
