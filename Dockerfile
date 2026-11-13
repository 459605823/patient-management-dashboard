FROM node:22-bookworm-slim AS manifests
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/frontend/package.json packages/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

FROM manifests AS build
RUN npm ci
COPY tsconfig.base.json ./
COPY packages ./packages
RUN npm run build

FROM manifests AS production-dependencies
RUN npm ci --omit=dev --workspace @pmd/backend --workspace @pmd/shared

FROM node:22-bookworm-slim AS backend
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
WORKDIR /app
COPY --from=production-dependencies /app/ ./
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
USER node
EXPOSE 3001
CMD ["node", "packages/backend/dist/server.js"]

FROM nginx:stable-alpine AS frontend
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 80

FROM mysql:8.4 AS database
COPY packages/backend/sql/schema.sql /docker-entrypoint-initdb.d/001-schema.sql
