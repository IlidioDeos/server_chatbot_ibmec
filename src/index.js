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

app.use(cors());
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
    await sequelize.sync({ force: true }); // Em produção, usar force: false
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