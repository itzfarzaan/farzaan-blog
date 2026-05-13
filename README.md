# Farzaan Blog

A separate blog platform for `blog.farzaanali.com` with:

- `server/`: Express 5 API with PostgreSQL and JWT-based admin auth
- `client/`: Next.js frontend for the public blog and admin CMS

## Structure

```text
.
|-- client
`-- server
```

## Local setup

1. Create a new PostgreSQL database named `blog` on the same instance as the comics app.
2. Copy `server/.env.example` to `server/.env` and fill in the values.
3. Install dependencies:

```bash
npm install
```

4. Run the SQL migration in `server/migrations/001-init-blog.sql`.
5. Start the backend and frontend in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Environment

The frontend expects these variables in `client/.env.local`:

```bash
API_BASE_URL=http://localhost:5001/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
```

The backend uses `server/.env`.

## Deployment notes

- Proxy `/api/*` to the Express server
- Proxy all other routes to the Next.js app
- Back up the `blog` database separately from the `comics` database
- Media lives in a public GitHub repo and is referenced by URL in post content/assets
