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

// Configurar CORS antes de outras middlewares
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

// Middleware para garantir que todas as respostas sejam JSON
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  
  // Interceptar o método send para garantir que sempre enviamos JSON válido
  const originalSend = res.send;
  res.send = function(body) {
    try {
      // Se o body já for uma string JSON, não precisa converter
      if (typeof body === 'string') {
        try {
          JSON.parse(body); // Verificar se é JSON válido
          return originalSend.call(this, body);
        } catch (e) {
          body = JSON.stringify(body);
        }
      } else {
        body = JSON.stringify(body);
      }
      return originalSend.call(this, body);
    } catch (error) {
      console.error('Erro ao converter resposta para JSON:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Erro ao processar resposta'
      });
    }
  };
  
  next();
});

// Middleware para logging mais detalhado
app.use('/api', (req, res, next) => {
  console.log('Request recebida:');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});

app.use(express.json());

// Rota básica para healthcheck
app.get('/', (req, res) => {
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

// Rota para servir o frontend em produção
app.use(express.static('dist'));

// Todas as outras rotas não encontradas retornam o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
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

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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