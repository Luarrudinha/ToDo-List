FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3003

CMD ["sh", "-c", "npm install && node server.js || tail -f /dev/null"]