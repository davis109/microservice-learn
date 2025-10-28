FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p temp generated


EXPOSE 5000
CMD ["npm", "run", "dev"]
