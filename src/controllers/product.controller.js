import { Product } from '../models/product.model.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'price', 'description', 'region', 'createdAt', 'updatedAt']
    });
    
    const formattedProducts = products.map(product => {
      const productJson = product.toJSON();
      return {
        ...productJson,
        price: String(productJson.price),
        description: productJson.description || '',
        region: productJson.region || ''
      };
    });
    
    res.json(Array.isArray(formattedProducts) ? formattedProducts : [formattedProducts]);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};