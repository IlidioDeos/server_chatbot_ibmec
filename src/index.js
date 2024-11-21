import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database.js';
import { seedInitialData } from './seeders/initial-data.js';
import { Product } from './models/product.model.js';
import { Customer } from './models/customer.model.js';
import swaggerUi from 'swagger-ui-express';
import { specs as swaggerSpec } from './swagger.js';
import path from 'path';

// Importar rotas
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://clientchatbotibmec-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Configurar rotas do Swagger primeiro
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API E-commerce Documentation"
}));

// Rota para acessar a documentação JSON do Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rota básica para healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);

// Middleware para tratar rotas não encontradas da API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Rota ${req.method} ${req.url} não encontrada`,
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos do frontend apenas se não for uma rota da API ou Swagger
app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/api-docs')) {
    next();
  } else {
    express.static('dist')(req, res, next);
  }
});

// Todas as outras rotas não encontradas retornam o index.html
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/api-docs')) {
    next();
  } else {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    console.log('Iniciando servidor...');
    console.log('Ambiente:', process.env.NODE_ENV);
    console.log('Frontend URL:', process.env.FRONTEND_URL);
    
    // Testar conexão com o banco
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Sincronizar modelos com o banco
    console.log('Sincronizando modelos...');
    await sequelize.sync({ force: process.env.RESET_DB === 'true' });
    console.log('Database synced');
    
    // Verificar se já existem dados
    console.log('Verificando dados existentes...');
    const productCount = await Product.count();
    const customerCount = await Customer.count();
    
    console.log(`Produtos encontrados: ${productCount}`);
    console.log(`Clientes encontrados: ${customerCount}`);
    
    // Se não houver dados, executa o seeder
    if (productCount === 0 && customerCount === 0) {
      console.log('Populando banco de dados com dados iniciais...');
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
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

startServer();