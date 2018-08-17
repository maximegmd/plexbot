FROM mhart/alpine-node:8

WORKDIR /app

RUN apk add --no-cache git

COPY package.json .

RUN npm install --production

COPY . .

CMD ["node", "app.js"]