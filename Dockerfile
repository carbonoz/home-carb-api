FROM node:16.17.0-bullseye-slim AS base
WORKDIR /usr/src/app

FROM base AS build
COPY ./package.json ./
RUN npm install
COPY . .
FROM base AS production
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

CMD [ "npm","start"]