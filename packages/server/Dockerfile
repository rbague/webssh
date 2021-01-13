FROM node:lts-alpine

WORKDIR /app
COPY packages/server/package.json yarn.lock ./
RUN yarn install

COPY packages/server/ ./
EXPOSE 2222

CMD ["yarn", "start"]
