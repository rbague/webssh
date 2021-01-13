FROM node:lts-alpine AS builder

WORKDIR /app
COPY packages/client/package.json yarn.lock ./
RUN yarn install

COPY packages/client/ ./
RUN yarn build

FROM nginx:stable-alpine

WORKDIR /var/www/webssh
COPY --from=builder /app/dist /var/www/webssh
COPY nginx.conf /etc/nginx/conf.d/default.conf
