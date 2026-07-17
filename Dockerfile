# Nuxt (Nitro node-server) — multi-stage build for VPS / docker compose.
# Public Supabase vars are baked at build time; secrets stay runtime-only.

FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ curl ca-certificates unzip \
  && rm -rf /var/lib/apt/lists/*

# Bun for lockfile compatibility (website/bun.lock)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY website/package.json website/bun.lock ./website/

WORKDIR /app/website
RUN bun install --frozen-lockfile

COPY website/ ./

ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG PARISH_ID

ENV SUPABASE_URL=${SUPABASE_URL} \
    SUPABASE_KEY=${SUPABASE_KEY} \
    PARISH_ID=${PARISH_ID} \
    NITRO_PRESET=node-server \
    NODE_ENV=production

RUN bun run build

# --- runtime ---
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_PRESET=node-server

# Nitro output includes traced deps; better-sqlite3 (@nuxt/content) needs native bindings.
COPY --from=build /app/website/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
