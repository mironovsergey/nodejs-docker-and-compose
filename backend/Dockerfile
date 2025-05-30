FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml  ./
RUN pnpm install
COPY . ./
RUN pnpm run build

FROM node:22-alpine AS production
WORKDIR /app
RUN npm install -g pnpm pm2
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
COPY ./ecosystem.config.js ./
EXPOSE 4000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
