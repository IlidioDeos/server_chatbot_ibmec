FROM node:18-alpine

WORKDIR /app

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

EXPOSE 3000

# Comando para iniciar a aplicação em produção
CMD ["npm", "start"]