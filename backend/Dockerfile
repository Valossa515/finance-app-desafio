FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json prisma/schema.prisma ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]