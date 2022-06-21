FROM node:12.22.10 as build

WORKDIR /app

COPY *.json ./
RUN yarn install --link-duplicates --ignore-optional

COPY ./ ./
RUN yarn build
RUN yarn build:docs

RUN yarn install --production --link-duplicates --ignore-optional

FROM node:12.22.10-alpine as prod
EXPOSE 3000

WORKDIR /app
USER node
ENV NODE_ENV production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/documentation /app/documentation
COPY ./*.json /app/

CMD ["node", "--expose-gc", "dist/main.js" ]
