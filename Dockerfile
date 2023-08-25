FROM node:16 as development
WORKDIR /usr/src/app

# Install necessary system dependencies for whatsapp-web.js and canvas NPM modules
RUN apt-get update && \
    apt-get install -y \
    gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget chromium build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Tell canvas module to build from source
ENV CANVAS_PREBUILT 0

COPY package*.json ./
RUN npm install

# Force puppeteer to install chrome browser
RUN node node_modules/puppeteer/install.js

COPY ./public ./
COPY ./src ./
COPY ./prisma ./
RUN npm run prisma:generate
CMD ["npm", "run", "dev"]

FROM development as builder
WORKDIR /usr/src/app
RUN rm -rf node_modules
RUN npm ci --only=production

FROM alpine:latest as production
RUN apk --no-cache add nodejs ca-certificates
WORKDIR /root/
COPY --from=builder /usr/src/app ./
CMD ["npm", "start"]
