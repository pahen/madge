FROM node:26.7.0-alpine@sha256:aadf416b2cdce311a8811ba3f0608a61b77dbf997500e2eafe781b51f6a0b019

RUN apk add --no-cache graphviz

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev \
	&& npm cache clean --force

COPY . .

WORKDIR /code

ENTRYPOINT ["node", "/app/bin/cli.js"]
