FROM node:16.17.1

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-xcb1

# Create app directory
RUN mkdir -p /usr/src/seedfi-backend
WORKDIR /usr/src/seedfi-backend

# Install app dependencies
COPY package.json /usr/src/seedfi-backend/
RUN npm install

# Bundle app source
COPY . /usr/src/seedfi-backend

EXPOSE 4500
CMD [ "npm", "start" ]

