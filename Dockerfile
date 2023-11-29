FROM node:16.17.1

# # Specify Puppeteer version
# ENV PUPPETEER_VERSION=19.8.0
# ENV CHROME_VERSION=117.0.5938.149-1

# # Install dependencies
# RUN apt-get update && apt-get install -y \
#     wget \
#     gnupg \
#     && rm -rf /var/lib/apt/lists/*

# # Install Chromium
# RUN wget -q https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_${CHROME_VERSION}_amd64.deb
# RUN apt-get -y update
# RUN apt-get install -y ./google-chrome-stable_${CHROME_VERSION}_amd64.deb

#   # Check chrome version
# RUN echo "Chrome: " && google-chrome --version

  
# RUN groupadd -r app && useradd -rm -g app -G audio,video app

# Create app directory
RUN mkdir -p /usr/src/seedfi-backend
WORKDIR /usr/src/seedfi-backend

# Install app dependencies
COPY package.json /usr/src/seedfi-backend/
RUN npm install

# Bundle app source
COPY . /usr/src/seedfi-backend

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
# USER app
CMD [ "npm", "start" ]

