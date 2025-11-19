# Yary Nails - Backend (Express + SQLite)

This is a ready-to-run **Node.js + Express** backend for the *Yary Nails* project.
It includes:
- Auth (register / login) with JWT
- Services (CRUD, admin-only for create/update/delete)
- Bookings (create for authenticated users; admin can view all)
- WhatsApp redirect endpoint
- SQLite database (better-sqlite3) stored in `/data/yary.sqlite`
- Seeded admin user (`admin@yary.local` / `admin123`) if none exists

## Quick start

1. Copy `.env.example` to `.env` and update values:
```
PORT=4000
JWT_SECRET=change_this_to_a_long_random_string
WHATSAPP_NUMBER=57300...
DATABASE_FILE=./data/yary.sqlite
```

2. Install dependencies:
```
npm install
```

3. Run:
```
npm run dev
```
or
```
npm start
```

## API Endpoints (summary)

- `POST /api/auth/register` — body: `{ name, email, password }`
- `POST /api/auth/login` — body: `{ email, password }` → returns `{ user, token }`
- `GET /api/auth/me` — Authorization: `Bearer <token>`
- `GET /api/services`
- `POST /api/services` — admin only
- `PUT /api/services/:id` — admin only
- `DELETE /api/services/:id` — admin only
- `POST /api/bookings` — authenticated users
- `GET /api/bookings` — admin sees all; user sees their bookings
- `PUT /api/bookings/:id` — update booking (status change admin-only)
- `GET /api/contact-whatsapp?text=Hola` — redirects to WhatsApp chat

## Integrating with your frontend
- Use the `/api/auth/login` to obtain a JWT and include it as `Authorization: Bearer <token>` in protected requests.
- Use `/api/contact-whatsapp` to redirect users to WhatsApp.

## Notes
- The project uses **better-sqlite3** for a simple file DB—no DB server required.
- Change the seeded admin password after first login or create users via the register endpoint.

