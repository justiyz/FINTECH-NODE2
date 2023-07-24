FROM node:16.17.1

RUN mkdir -p /usr/src/active-status

WORKDIR /usr/src/active-status

COPY package.json  /usr/src/active-status

RUN npm install

COPY ./ /usr/src/active-status

CMD npm run active-status

