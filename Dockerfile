FROM node:14.11.0-alpine3.12

COPY . /app

WORKDIR /app

RUN yarn
RUN yarn build

RUN rm -rf src

EXPOSE 19132/udp

CMD ["yarn", "start:prod"]
