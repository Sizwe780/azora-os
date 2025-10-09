FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm i --only=production
COPY . .
EXPOSE 4021
CMD ["node", "index.js"]
