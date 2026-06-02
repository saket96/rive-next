# Deploying Rive

Rive is a Next.js app that can be deployed to any Node.js host that supports
Node 18.17 or newer. The repository uses pnpm and includes a lockfile for
reproducible installs.

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
```

> `NEXT_PUBLIC_TMBD_IMAGE_URL` intentionally keeps the existing project
> spelling. Use that exact variable name unless the code is updated.

Firebase Auth also requires your production domain to be listed under
Firebase Console > Authentication > Settings > Authorized domains.

## Vercel

1. Import the repository into Vercel.
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

The production server listens on port `3000` by default. Set `PORT` if your
host injects a different port.

## Docker

Build and run the included standalone container:

```bash
docker build -t rive-next .
docker run --env-file .env -p 3000:3000 rive-next
```

Use `.env.example` as a template for the `.env` file. Do not commit real
credentials or provider URLs.
