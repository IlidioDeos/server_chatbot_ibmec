import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API para sistema de e-commerce com suporte a chatbot',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://serverchatbotibmec-production.up.railway.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production'
          ? 'Servidor de Produção'
          : 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const specs = swaggerJsdoc(options);