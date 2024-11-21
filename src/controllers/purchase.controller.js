import { Purchase } from '../models/purchase.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/customer.model.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(purchases);
  } catch (error) {
    console.error('Erro ao listar compras:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description']
      }]
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Compra não encontrada' });
    }
    
    res.json(purchase);
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createPurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { productId, customerId, quantity = 1 } = req.body;

    // Primeiro, verificar se o produto existe
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Buscar o cliente pelo email
    const customer = await Customer.findOne({ 
      where: { email: customerId },
      transaction: t
    });

    if (!customer) {
      await t.rollback();
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Calcular o preço total da compra
    const totalPrice = product.price * quantity;

    // Verificar se o cliente tem saldo suficiente
    if (customer.balance < totalPrice) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'Saldo insuficiente',
        required: totalPrice,
        available: customer.balance
      });
    }

    // Criar a compra
    const purchase = await Purchase.create({
      ProductId: productId,
      CustomerId: customer.id,
      quantity,
      totalPrice,
    }, { transaction: t });

    // Atualizar o saldo do cliente
    await customer.update({
      balance: sequelize.literal(`balance - ${totalPrice}`)
    }, { transaction: t });

    // Buscar a compra completa com as relações
    const fullPurchase = await Purchase.findByPk(purchase.id, {
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description']
      }],
      transaction: t
    });

    await t.commit();
    res.status(201).json({
      ...fullPurchase.toJSON(),
      newBalance: customer.balance - totalPrice
    });
  } catch (error) {
    await t.rollback();
    console.error('Erro ao criar compra:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { quantity } = req.body;
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{
        model: Product,
        attributes: ['price']
      }],
      transaction: t
    });

    if (!purchase) {
      await t.rollback();
      return res.status(404).json({ message: 'Compra não encontrada' });
    }

    // Atualizar a quantidade e recalcular o preço total
    const updatedPurchase = await purchase.update({
      quantity,
      totalPrice: purchase.Product.price * quantity
    }, { transaction: t });

    // Buscar a compra atualizada com todas as relações
    const fullPurchase = await Purchase.findByPk(updatedPurchase.id, {
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description']
      }],
      transaction: t
    });

    await t.commit();
    res.json(fullPurchase);
  } catch (error) {
    await t.rollback();
    console.error('Erro ao atualizar compra:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const purchase = await Purchase.findByPk(req.params.id, { transaction: t });
    
    if (!purchase) {
      await t.rollback();
      return res.status(404).json({ message: 'Compra não encontrada' });
    }

    await purchase.destroy({ transaction: t });
    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    console.error('Erro ao deletar compra:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerPurchases = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Buscar o cliente pelo email
    const customer = await Customer.findOne({ 
      where: { email: customerId }
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Buscar as compras usando o ID do cliente
    const purchases = await Purchase.findAll({
      where: { CustomerId: customer.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(purchases);
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    // Obter vendas por produto com informações do produto
    const salesByProduct = await Purchase.findAll({
      attributes: [
        'ProductId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'total_revenue'],
      ],
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'region'],
      }],
      group: ['ProductId', 'Product.id', 'Product.name', 'Product.price', 'Product.region'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
    });

    // Calcular ticket médio
    const averageTicket = await Purchase.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('totalPrice')), 'average_ticket'],
      ],
    });

    // Calcular total de vendas e receita
    const totals = await Purchase.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_purchases'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'total_revenue'],
      ],
    });

    res.json({
      salesByProduct,
      averageTicket: Number(averageTicket.getDataValue('average_ticket')),
      totalPurchases: Number(totals.getDataValue('total_purchases')),
      totalRevenue: Number(totals.getDataValue('total_revenue')),
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPurchaseReport = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price']
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Purchase.id')), 'total_purchases'],
        [sequelize.fn('SUM', sequelize.col('Purchase.totalPrice')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('Purchase.totalPrice')), 'average_purchase'],
        [sequelize.fn('date_trunc', 'day', sequelize.col('Purchase.createdAt')), 'date'],
      ],
      group: [
        sequelize.fn('date_trunc', 'day', sequelize.col('Purchase.createdAt')),
        'Product.id', 'Product.name', 'Product.price'
      ],
      order: [[sequelize.fn('date_trunc', 'day', sequelize.col('Purchase.createdAt')), 'DESC']],
      raw: true,
      nest: true
    });

    // Calcular totais gerais
    const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.total_revenue), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total_purchases), 0);
    const averagePurchase = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

    // Agrupar por produto
    const productStats = purchases.reduce((acc, p) => {
      const productId = p.Product.id;
      if (!acc[productId]) {
        acc[productId] = {
          product: p.Product,
          total_revenue: 0,
          total_purchases: 0
        };
      }
      acc[productId].total_revenue += Number(p.total_revenue);
      acc[productId].total_purchases += Number(p.total_purchases);
      return acc;
    }, {});

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_purchases: totalPurchases,
        average_purchase: averagePurchase
      },
      daily_stats: purchases,
      product_stats: Object.values(productStats)
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ message: error.message });
  }
};