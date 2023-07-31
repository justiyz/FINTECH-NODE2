FROM node:16.17.1

RUN mkdir -p /usr/src/promo-status

WORKDIR /usr/src/promo-status

COPY package.json  /usr/src/promo-status

RUN npm install

COPY ./ /usr/src/promo-status

CMD npm run promo-status
