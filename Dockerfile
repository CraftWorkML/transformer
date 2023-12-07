# syntax=docker/dockerfile:1

FROM node:18-alpine AS build-stage
ENV REACT_APP_HOST=${backend_host:-"https://demoapp.com"}
ENV REACT_APP_PORT=${backend_port:-""}

WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./

RUN npm install 

# add app
COPY . ./
RUN npm run build

FROM nginx:latest
RUN rm -rf /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html
COPY --from=build-stage /app/build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 8088