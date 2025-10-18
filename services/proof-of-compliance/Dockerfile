FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Install all dependencies, including the new 'pg' driver
RUN npm install

COPY . .

# The port exposed internally
EXPOSE 4210

CMD [ "node", "index.js" ]