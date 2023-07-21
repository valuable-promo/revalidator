# Creating multi-stage build
FROM node:lts-alpine as build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev > /dev/null 2>&1

WORKDIR /app/
COPY package.json package-lock.json ./
RUN npm ci
ENV PATH /opt/node_modules/.bin:$PATH
COPY . .
RUN npm run build

# Creating final production image
FROM node:lts-alpine
RUN apk add --no-cache vips-dev
WORKDIR /app/
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
ENV PATH /opt/node_modules/.bin:$PATH
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD [ "node", "dist/main.js" ]