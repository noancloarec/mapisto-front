FROM node:14.5.0-alpine3.10 AS build_stage
WORKDIR /app
COPY package.json /app
RUN npm install --silent
COPY . /app
RUN npm run build

FROM nginx:1.17.6-alpine
COPY --from=build_stage /app/build /usr/share/nginx/html
ADD default.conf etc/nginx/conf.d

