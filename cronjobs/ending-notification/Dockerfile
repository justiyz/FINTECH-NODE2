FROM node:16.17.1

RUN mkdir -p /usr/src/ending-notification

WORKDIR /usr/src/ending-notification

COPY package.json  /usr/src/ending-notification

RUN npm install

COPY ./ /usr/src/ending-notification

CMD npm run ending-notification
