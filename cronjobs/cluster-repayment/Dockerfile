FROM node:16.17.1

RUN mkdir -p /usr/src/cluster-repayment

WORKDIR /usr/src/cluster-repayment

COPY package.json  /usr/src/cluster-repayment

RUN npm install

COPY ./ /usr/src/cluster-repayment

CMD npm run cluster-repayment
