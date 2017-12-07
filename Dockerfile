FROM node:8.9.1-alpine AS base

WORKDIR /app

COPY assets /app/assets
COPY components /app/components
COPY layouts /app/layouts
COPY middleware /app/middleware
COPY mixins /app/mixins
COPY pages /app/pages
COPY plugins /app/plugins
COPY static /app/static
COPY store /app/store
COPY util /app/util
COPY www /app/www
COPY package.json nuxt.config.js /app/

RUN apk add --update git bash openssh && \
  npm install --production && \
  apk del bash openssh

FROM base AS build

RUN apk add --update git bash openssh && \
  npm install && \
  npm run build && \
  apk del bash openssh

FROM base AS run

COPY --from=build /app/.nuxt /app/.nuxt

RUN npm install --production

# Expose port 10000 and map to port
EXPOSE 10000
ENV PORT 10000

CMD npm run start
