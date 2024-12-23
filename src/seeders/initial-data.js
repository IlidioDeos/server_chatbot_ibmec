import { Product } from '../models/product.model.js';
import { Customer } from '../models/customer.model.js';

export const seedInitialData = async () => {
  try {
    // Criar produtos iniciais
    const products = await Product.bulkCreate([
      {
        name: 'Fone de Ouvido Premium',
        price: '199.99',
        region: 'Norte',
        description: 'Fone de ouvido sem fio com cancelamento de ruído',
      },
      {
        name: 'Relógio Inteligente Pro',
        price: '299.99',
        region: 'Sul',
        description: 'Smartwatch avançado com monitoramento de saúde',
      },
      {
        name: 'Notebook Elite',
        price: '1299.99',
        region: 'Leste',
        description: 'Notebook potente para profissionais',
      },
    ]);

    // Criar clientes iniciais
    await Customer.bulkCreate([
      {
        email: 'admin@example.com',
        name: 'Administrador',
        region: 'Brasil',
        balance: '0.00',
      },
      {
        email: 'cliente@example.com',
        name: 'Cliente Teste',
        region: 'Brasil',
        balance: '10000.00',
      },
    ]);

    console.log('Dados iniciais inseridos com sucesso!');
    return products;
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
    throw error;
  }
};