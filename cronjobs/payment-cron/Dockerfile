FROM node:16.17.1

RUN mkdir -p /usr/src/payment-cron

WORKDIR /usr/src/payment-cron

COPY package.json  /usr/src/payment-cron

RUN npm install

COPY ./ /usr/src/payment-cron

CMD npm run payment-cron
