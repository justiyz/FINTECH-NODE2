FROM node:16.17.1

RUN mkdir -p /usr/src/alert-notification

WORKDIR /usr/src/alert-notification

COPY package.json  /usr/src/alert-notification

RUN npm install

COPY ./ /usr/src/alert-notification

CMD npm run alert-notification
