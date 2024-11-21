import express from 'express';
import cors from 'cors';
import { sequelize } from './database/database.js';
import { seedInitialData } from './seeders/initial-data.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const startServer = async () => {
  try {
    await sequelize.sync();
    
    // Verifica se já existem dados
    const productCount = await Product.count();
    const customerCount = await Customer.count();
    
    // Se não houver dados, executa o seeder
    if (productCount === 0 && customerCount === 0) {
      await seedInitialData();
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Swagger disponível em: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();