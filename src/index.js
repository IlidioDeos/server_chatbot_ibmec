import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { sequelize } from './config/database.js';
import productRoutes from './routes/product.routes.js';
import customerRoutes from './routes/customer.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import { specs } from './swagger.js';
import { seedInitialData } from './seeders/initial-data.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Modificar as linhas 16-18 para:
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://seu-frontend-url.railway.app']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.sync({ force: process.env.NODE_ENV !== 'production' });
    console.log('Database synced successfully');

    // Inserir dados iniciais
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();