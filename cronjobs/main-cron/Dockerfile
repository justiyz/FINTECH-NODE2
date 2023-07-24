FROM node:16.17.1

RUN mkdir -p /usr/src/cronjobs

WORKDIR /usr/src/cronjobs

COPY package.json  /usr/src/cronjobs

RUN npm install

COPY ./ /usr/src/cronjobs

CMD npm run cron 
