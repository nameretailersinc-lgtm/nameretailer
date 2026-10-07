FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -S cms && adduser -S cms -G cms && mkdir /app/uploads && chown cms:cms /app/uploads
COPY --from=builder --chown=cms:cms /app/.next/standalone ./
COPY --from=builder --chown=cms:cms /app/.next/static ./.next/static
USER cms
EXPOSE 3000
CMD ["node", "server.js"]
