FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el código
COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
