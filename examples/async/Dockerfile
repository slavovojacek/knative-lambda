FROM node:16-alpine as builder
WORKDIR /app
# Install deps
ENV NPM_CONFIG_LOGLEVEL=error
COPY package*.json tsconfig.json ./
RUN npm ci
# Build from source
COPY src ./src
RUN npm run build

FROM gcr.io/distroless/nodejs:16 as runner
WORKDIR /app
ENV NODE_ENV=production
# Pull down built js
COPY --from=builder /app/build/main.js /app/build/main.js.map ./
CMD ["--enable-source-maps", "main.js"]
