FROM node:16.17.1

# Create app directory
RUN mkdir -p /usr/src/seedfi-backend
WORKDIR /usr/src/seedfi-backend

# Install app dependencies
COPY package.json /usr/src/seedfi-backend/

# Bundle app source
COPY . /usr/src/seedfi-backend
RUN rm -rf node_modules
RUN npm install

# install chrome and playwright
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable

RUN npx playwright install 

# Install puppeteer dependencies
# RUN apt-get update && apt-get install -y \
#     wget \
#     gconf-service \
#     libasound2 \
#     libatk1.0-0 \
#     libcairo2 \
#     libcups2 \
#     libfontconfig1 \
#     libgdk-pixbuf2.0-0 \
#     libgtk-3-0 \
#     libnspr4 \
#     libpango-1.0-0 \
#     libxss1 \
#     fonts-liberation \
#     libappindicator1 \
#     libnss3 \
#     lsb-release \
#     xdg-utils

# ENV PUPPETEER_DOWNLOAD_PATH=/usr/local/chromium

EXPOSE 4500

CMD [ "npm", "start" ]