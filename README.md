# Job Tracker

A full-stack web app to track job applications: register, log in, then add, edit, move and delete your applications (company, position, status, notes, link).

## Stack
- **Backend:** Laravel (PHP), Sanctum token auth, MySQL/SQLite — `job-tracker-backend/`
- **Frontend:** React + Vite, Axios — `job-tracker-frontend/`

## API
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/register` | no | Create account |
| POST | `/api/login` | no | Returns Bearer token |
| POST | `/api/logout` | yes | Revoke tokens |
| GET | `/api/jobs` | yes | List your applications |
| POST | `/api/jobs` | yes | Create an application |
| PUT | `/api/jobs/{id}` | yes | Update (owner only) |
| DELETE | `/api/jobs/{id}` | yes | Delete (owner only) |

Users can only see and modify their own applications.

## Run locally

Backend:
```bash
cd job-tracker-backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve
```

Frontend:
```bash
cd job-tracker-frontend
npm install
# set VITE_API_URL=http://localhost:8000/api in .env
npm run dev
```

## Tests
```bash
cd job-tracker-backend
php artisan test
```
Feature tests cover registration, login/logout, authentication on all `/api/jobs` routes, validation, and per-user data isolation.

## Roadmap
Planned evolution into an AI career assistant (job analysis and application-document generation).
