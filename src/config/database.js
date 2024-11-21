import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('Configurando conexão com o banco de dados...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
console.log('NODE_ENV:', process.env.NODE_ENV);

let sequelizeConfig;

if (process.env.DATABASE_URL) {
  console.log('Usando DATABASE_URL para conexão');
  
  // Garantir que a URL começa com postgresql://
  const databaseUrl = process.env.DATABASE_URL.startsWith('postgresql://') 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DATABASE_URL}`;
  
  console.log('URL formatada:', databaseUrl.replace(/\/\/.*@/, '//*****@')); // Log seguro da URL
  
  sequelizeConfig = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  console.log('Usando configuração manual para conexão');
  
  // Construir a URL do banco de dados manualmente
  const dbUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || process.env.RAILWAY_PRIVATE_DOMAIN}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'railway'}`;
  
  console.log('URL construída:', dbUrl.replace(/\/\/.*@/, '//*****@')); // Log seguro da URL
  
  sequelizeConfig = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

export const sequelize = sequelizeConfig;

// Função auxiliar para testar a conexão
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.error('Connection details:', {
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST || process.env.RAILWAY_PRIVATE_DOMAIN,
      port: process.env.POSTGRES_PORT,
      url: process.env.DATABASE_URL ? 'Definida' : 'Não definida'
    });
    return false;
  }
};