FROM node:13.5.0-alpine3.10
WORKDIR /app
ADD package.json .
RUN npm install
ADD src src
ADD public public
ADD tsconfig.json .
RUN npm run build
