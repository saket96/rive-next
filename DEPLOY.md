# Deploying a private personal Rive instance

This fork is configured for a private, personal-use deployment. The public entry
point is the password screen. The old homepage is not used as the landing page:
unauthenticated visits to `/` are redirected to `/login`, and authenticated visits
to `/` are redirected to `NEXT_PUBLIC_PRIVATE_HOME_PATH` (default `/search`).

## Required environment variables

Create these variables in your hosting provider before building the app:

```env
NEXT_PUBLIC_TMDB_API=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMBD_IMAGE_URL=https://image.tmdb.org/t/p/original/
NEXT_PUBLIC_RANDOM_URL=

NEXT_PUBLIC_STREAM_URL_AGG=
NEXT_PUBLIC_STREAM_URL_VID=
NEXT_PUBLIC_STREAM_URL_PRO=
NEXT_PUBLIC_STREAM_URL_EMB=
NEXT_PUBLIC_STREAM_URL_MULTI=
NEXT_PUBLIC_STREAM_URL_SUP=

NEXT_PUBLIC_FB_API_KEY=
NEXT_PUBLIC_FB_AUTH_DOMAIN=
NEXT_PUBLIC_FB_PROJECT_ID=
NEXT_PUBLIC_FB_STORAGE_BUCKET=
NEXT_PUBLIC_FB_SENDER_ID=
NEXT_PUBLIC_FB_APP_ID=
NEXT_PUBLIC_FB_MEASUREMENT_ID=

NEXT_PUBLIC_REQUIRE_AUTH=true
NEXT_PUBLIC_ALLOW_SIGNUP=false
NEXT_PUBLIC_ALLOW_GOOGLE_SIGNIN=false
NEXT_PUBLIC_PRIVATE_HOME_PATH=/search

NEXT_PUBLIC_SITE_NAME=My Private Rive
NEXT_PUBLIC_SITE_TAGLINE=Personal use only
NEXT_PUBLIC_PERSONAL_USE_NOTICE=Private personal-use streaming portal
```

`NEXT_PUBLIC_TMBD_IMAGE_URL` intentionally keeps the existing project spelling.
Use that exact variable name unless the code is updated.

## Firebase private access

1. Create or select a Firebase project.
2. Add a Web App and copy its config values into the `NEXT_PUBLIC_FB_*` variables.
3. Open Firebase Console > Authentication > Sign-in method.
4. Enable **Email/Password**.
5. Keep public signup disabled in this app with `NEXT_PUBLIC_ALLOW_SIGNUP=false`.
6. Create allowed users manually in Firebase Console > Authentication > Users.
7. Add your deployed domain under Authentication > Settings > Authorized domains.

Google sign-in is disabled by default. Leave `NEXT_PUBLIC_ALLOW_GOOGLE_SIGNIN=false`
for username/password-only access.

## No ads / personal use

This app does not add ad-network scripts. The deployment is intended for private,
personal use only. Video providers may still show their own ads inside embedded
players; use provider URLs that match your ad-free/private-use requirements.

## Vercel

1. Import the fork into Vercel.
2. Set the package manager to pnpm if Vercel does not detect it automatically.
3. Add all environment variables listed above.
4. Use the default commands:
   - Install: `pnpm install --frozen-lockfile`
   - Build: `pnpm build`
   - Output: Next.js default
5. Deploy, then add the generated Vercel domain to Firebase authorized domains.

## Generic Node host

```bash
corepack enable
corepack prepare pnpm@8.15.9 --activate
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The production server listens on port `3000` by default. Set `PORT` if your host
injects a different port.

## Docker

```bash
docker build -t private-rive .
docker run --env-file .env -p 3000:3000 private-rive
```

Use `.env.example` as a template for the `.env` file. Do not commit real
credentials or provider URLs.

## Pulling updates from the original repo

This fork includes a helper script for syncing from the upstream repository it
was forked from.

```bash
pnpm sync:upstream
```

By default it uses:

- upstream remote name: `upstream`
- upstream repo: `https://github.com/Developabile/rive-next.git`
- upstream branch: `main`
- sync mode: merge

Override those values when needed:

```bash
UPSTREAM_REPO=https://github.com/Developabile/rive-next.git UPSTREAM_BRANCH=dev SYNC_MODE=rebase pnpm sync:upstream
```

After syncing, resolve conflicts, run `pnpm install --frozen-lockfile`,
`pnpm lint`, and `pnpm build`, then push your fork.
