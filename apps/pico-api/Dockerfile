FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD npx prisma db push --skip-generate && npx ts-node --transpile-only prisma/seed.ts && npx ts-node --transpile-only src/main.ts
