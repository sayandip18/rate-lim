FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build api-gateway

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/src/rate-limit/scripts ./dist/apps/api-gateway/scripts
EXPOSE 3000
CMD ["node", "dist/apps/api-gateway/main"]