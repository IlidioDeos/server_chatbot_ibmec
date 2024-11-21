import swaggerJsdoc from 'swagger-jsdoc';

// Modificar para usar variável de ambiente
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
          ? process.env.FRONTEND_URL + '/api'
          : 'http://localhost:3000/api',
        description: process.env.NODE_ENV === 'production'
          ? 'Servidor de Produção'
          : 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const specs = swaggerJsdoc(options);