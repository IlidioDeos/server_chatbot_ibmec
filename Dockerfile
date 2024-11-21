FROM node:18-alpine

WORKDIR /app

# Instalar dependências primeiro
COPY package*.json ./
RUN npm ci

# Copiar o resto dos arquivos
COPY . .

EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]