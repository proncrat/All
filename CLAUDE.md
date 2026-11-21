# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"All" — a single-account social/media platform (videos, posts, photos, songs/playlists, messaging, calls). Full-stack TypeScript in one package: React 19 client (Vite) + Express 5 server, sharing one `package.json` at the repo root. Work in progress; `README.md` holds the running to-do list.

## Commands

```bash
npm run dev            # client (Vite, :5173) + server (tsx watch, :3000) in parallel
npm run dev:client     # Vite only
npm run dev:server     # server only
npm run build          # vite build + esbuild bundle of server/index.ts -> dist/server.js
npm start              # run built server (dist/server.js)
npm run lint           # eslint (@devacademy/eslint-config/react)
npm run format         # prettier (no semicolons, single quotes)
npm test               # vitest (no test files exist yet)
npx vitest run path/to/file.test.ts   # single test file

npm run knex migrate:latest           # run knex migrations (server/database/knexfile.js)
npm run knex migrate:make <name>
npm run knex seed:run
npx auth@latest migrate --config ./server/lib/auth.ts -y   # create/update better-auth tables
```

`npm install` may need `--legacy-peer-deps` (the Render build uses it).

## Architecture

### Server (`server/`)
- `index.ts` creates the HTTP server, attaches Socket.IO (`socket.ts`), listens on port 3000. `server.ts` is the Express app.
- REST routes live in `server/Routes/*` and are mounted under `/api/v1/<name>` in `server.ts` (`profile`, `video`, `post`, `photo`, `comments`, `util`, `coms`, `follow`, `test`, `imgupload`). Route handlers are thin; **all DB queries are functions in `server/database/index.ts`** (one large file) using knex via `connection.ts`.
- **Auth is better-auth** (`server/lib/auth.ts`), mounted at `/api/auth/*splat` *before* `express.json()` (order matters). It uses the username plugin and email/password. In development it writes to the same `server/database/dev.sqlite3` that knex uses; in production both use Postgres (`DB_*` env vars).
- **Two user identities:** better-auth's `user` table (string id) vs. the app's `profiledata` table (numeric `id`, with `link_id` = auth user id). A `databaseHooks.user.create.after` hook calls `generateProfile()` to create the `profiledata` row on signup. Content tables (`videos`, `posts`, `photos`, `songs`, ...) reference `profiledata.id` via `author_id`, so convert auth id → profile id (e.g. `getIdMatch`) when handling authenticated requests.
- Route protection: `server/middleware/enpointauth.ts` — `authMiddleware` (401 if no session) or `authMiddlewarenoerror` (optional session); session is put on `res.locals.session`. Most routes are currently unprotected.
- Real-time messaging: `socket.ts` authenticates each Socket.IO connection from the better-auth cookie, joins the socket to room `user:<authUserId>`, and handles `message:send` → emits `message:new`. `sendDataToClient` lets REST/DB code push to a user's room.
- Uploads: `Routes/imguploadtest.ts` uses multer to save into `public/images` and sharp to generate `<name>_thumb.webp` thumbnails. Static media (`public/images`, `public/video`, `public/audio`) is served by `express.static('public')`.
- CORS / trusted origins are hardcoded in three places (`server.ts`, `lib/auth.ts`, `socket.ts`) — update all of them when adding an origin.

### Database
- knex migrations in `server/database/migrations`, seeds in `server/database/seeds`. 
- Dev DB is SQLite (`dev.sqlite3`, committed to git, foreign keys ON); `test` env is in-memory SQLite; production is Postgres. Write queries that work on both SQLite and Postgres.

### Client (`client/`)
- Entry `index.tsx` → `router.tsx` (react-router v8 `createRoutesFromElements`). Everything is nested under `Pages/Util/App.tsx`, which provides React Query, cookies, theme/color filter, the music `PlayerProvider` (`Pages/Main/PlayerContext.tsx`), header, collapsible sidebar, and the call UI (`Pages/Util/Calls.tsx`).
- Pages are in `client/Pages/<Feature>/`; profile sub-tabs are nested routes under `/profile/:id` in `Pages/Profile/pages/*`.
- Data fetching: superagent API functions + TanStack Query hooks. Older ones are in `client/api.ts` / `client/hooks.ts`; newer ones are split into `client/apis/*` and `client/hooks/*`. Requests go to `/api/v1/...` (Vite proxies `/api` to `localhost:3000` in dev). Some newer API files hardcode `http://localhost:3000` — prefer relative URLs.
- Auth client: `lib/auth.ts` (root, not `client/lib`) exports better-auth React helpers (`useSession`, `signIn`, ...).
- Socket client: `client/lib/socket.ts` (`autoConnect: false`, `VITE_SOCKET_URL`), used by `hooks/useMessageSocket.ts`, `useChat.ts`, `useCall.ts`.
- UI: Tailwind v4 (`client/main.css`) + shadcn/ui (radix) components in root `components/ui`, `cn()` in root `lib/utils.ts`. Add components with the shadcn CLI (`components.json`).
- Path aliases: `@/` → repo root (so `@/components/ui/...`, `@/lib/...`); `@server/` → `server/`.

### Other
- `trashcan/` is gitignored scratch/old code — ignore it.
- Deployment target is Render (`render:build` / `render:start`), with `nginx.conf` for the beanvid.com host. Production serves `dist/` and SPA-falls back to `dist/index.html`.
- Env (`.env`): `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NODE_ENV`, `VITE_SOCKET_URL`; production also needs `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
