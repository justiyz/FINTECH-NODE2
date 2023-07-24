FROM node:16.17.1

RUN mkdir -p /usr/src/status-overdue

WORKDIR /usr/src/status-overdue

COPY package.json  /usr/src/status-overdue

RUN npm install

COPY ./ /usr/src/status-overdue

CMD npm run status-overdue
