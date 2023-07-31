FROM node:16.17.1

RUN mkdir -p /usr/src/personal-loan

WORKDIR /usr/src/personal-loan

COPY package.json  /usr/src/personal-loan

RUN npm install

COPY ./ /usr/src/personal-loan

CMD npm run personal-loan 
