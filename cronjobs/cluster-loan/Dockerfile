FROM node:16.17.1

RUN mkdir -p /usr/src/cluster-loan

WORKDIR /usr/src/cluster-loan

COPY package.json  /usr/src/cluster-loan

RUN npm install

COPY ./ /usr/src/cluster-loan

CMD npm run cluster-loan
