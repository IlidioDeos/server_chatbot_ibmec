import { Customer } from '../models/customer.model.js';

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await customer.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerBalance = async (req, res) => {
  const { email } = req.params;
  console.log('Requisição de saldo recebida para email:', email);
  console.log('Headers da requisição:', req.headers);
  
  try {
    // Garantir que estamos enviando JSON
    res.setHeader('Content-Type', 'application/json');
    
    const customer = await Customer.findOne({
      where: { email },
      attributes: ['balance', 'name']
    });

    if (!customer) {
      console.log('Cliente não encontrado:', email);
      return res.status(404).json({ 
        message: 'Cliente não encontrado',
        requestedEmail: email 
      });
    }

    console.log('Saldo encontrado para', email, ':', customer.balance);
    const response = {
      balance: customer.balance,
      name: customer.name
    };
    console.log('Enviando resposta:', response);
    return res.json(response);
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    return res.status(500).json({ 
      message: error.message,
      requestedEmail: email 
    });
  }
};