import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelizeConfig;

if (process.env.DATABASE_URL) {
  sequelizeConfig = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelizeConfig = new Sequelize(
    process.env.POSTGRES_DB || 'railway',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD,
    {
      host: process.env.POSTGRES_HOST || process.env.RAILWAY_PRIVATE_DOMAIN,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  );
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
      port: process.env.POSTGRES_PORT
    });
    return false;
  }
};