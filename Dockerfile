FROM node:18-alpine

WORKDIR /app

# Instalar nodemon globalmente
RUN npm install -g nodemon

COPY package*.json ./

# Instalar todas as dependências, incluindo as de desenvolvimento
RUN npm install

COPY . .

EXPOSE 3000

# Adicionar script de espera para o PostgreSQL
ADD https://raw.githubusercontent.com/eficode/wait-for/master/wait-for /wait-for
RUN chmod +x /wait-for

# Comando para iniciar a aplicação
CMD ["/bin/sh", "-c", "/wait-for ${POSTGRES_HOST}:${POSTGRES_PORT} -- npm run dev"]