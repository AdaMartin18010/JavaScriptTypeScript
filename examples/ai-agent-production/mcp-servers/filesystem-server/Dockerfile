FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV MCP_ROOT=/data

CMD ["node", "index.js"]
