import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database.js';
import { seedInitialData } from './seeders/initial-data.js';
import { Product } from './models/product.model.js';
import { Customer } from './models/customer.model.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

// Importar rotas
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Rota básica para healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const startServer = async () => {
  try {
    // Testar conexão com o banco
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Sincronizar modelos com o banco
    await sequelize.sync({ force: process.env.RESET_DB === 'true' });
    console.log('Database synced');
    
    // Verificar se já existem dados
    const productCount = await Product.count();
    const customerCount = await Customer.count();
    
    // Se não houver dados, executa o seeder
    if (productCount === 0 && customerCount === 0) {
      await seedInitialData();
      console.log('Initial data seeded successfully');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

startServer();