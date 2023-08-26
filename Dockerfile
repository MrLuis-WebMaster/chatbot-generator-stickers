FROM node:18 as development

# Install necessary system dependencies for whatsapp-web.js and canvas NPM modules
RUN apt-get update && \
    apt-get install -y \
    gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget chromium build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev 
    # \ && groupadd -r fl0user && useradd -rm -g fl0user -G audio,video fl0user

USER node
WORKDIR /home/node/app

# Tell canvas module to build from source
ENV CANVAS_PREBUILT 0
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_CACHE_DIR=/home/node/.cache

# Set the puppeteer cache dir as per https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
# ENV PUPPETEER_CACHE_DIR=/usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node ./public ./public
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./prisma ./prisma

RUN npm install
RUN npm run prisma:generate
CMD ["npm", "run", "dev"]

FROM development as production
WORKDIR /home/node/app
CMD ["npm", "start"]

