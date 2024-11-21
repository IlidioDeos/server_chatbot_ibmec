import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Product } from './product.model.js';
import { Customer } from './customer.model.js';

export const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

// Relacionamentos
Product.hasMany(Purchase);
Purchase.belongsTo(Product);

Customer.hasMany(Purchase);
Purchase.belongsTo(Customer);