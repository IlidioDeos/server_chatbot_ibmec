import express from 'express';
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseReport,
  getCustomerPurchases,
  getSalesReport
} from '../controllers/purchase.controller.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Purchase:
 *       type: object
 *       required:
 *         - productId
 *         - customerId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da compra
 *         productId:
 *           type: string
 *           format: uuid
 *           description: ID do produto comprado
 *         customerId:
 *           type: string
 *           description: Email do cliente que fez a compra
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Quantidade comprada
 *         totalPrice:
 *           type: number
 *           format: float
 *           description: Preço total da compra
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: Lista todas as compras
 *     tags: [Compras]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filtrar por email do cliente
 *     responses:
 *       200:
 *         description: Lista de compras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Purchase'
 */
router.get('/', getAllPurchases);

/**
 * @swagger
 * /purchases/report:
 *   get:
 *     summary: Gera relatório de vendas
 *     tags: [Compras]
 *     responses:
 *       200:
 *         description: Relatório de vendas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_revenue:
 *                       type: number
 *                     total_purchases:
 *                       type: integer
 *                     average_purchase:
 *                       type: number
 *                 daily_stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                 product_stats:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/report', getPurchaseReport);

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     summary: Busca uma compra pelo ID
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da compra
 *     responses:
 *       200:
 *         description: Detalhes da compra
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       404:
 *         description: Compra não encontrada
 */
router.get('/:id', getPurchaseById);

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Cria uma nova compra
 *     tags: [Compras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - customerId
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               customerId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *     responses:
 *       201:
 *         description: Compra criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', createPurchase);

/**
 * @swagger
 * /purchases/{id}:
 *   put:
 *     summary: Atualiza uma compra
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Purchase'
 *     responses:
 *       200:
 *         description: Compra atualizada
 *       404:
 *         description: Compra não encontrada
 */
router.put('/:id', updatePurchase);

/**
 * @swagger
 * /purchases/{id}:
 *   delete:
 *     summary: Remove uma compra
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Compra removida
 *       404:
 *         description: Compra não encontrada
 */
router.delete('/:id', deletePurchase);

/**
 * @swagger
 * /purchases/customer/{customerId}:
 *   get:
 *     summary: Retorna todas as compras de um cliente
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email do cliente
 *     responses:
 *       200:
 *         description: Lista de compras do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Purchase'
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/customer/:customerId', getCustomerPurchases);

/**
 * @swagger
 * /purchases/report:
 *   get:
 *     summary: Retorna relatório de vendas para o dashboard administrativo
 *     tags: [Relatórios]
 *     responses:
 *       200:
 *         description: Relatório de vendas gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesByProduct:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProductId:
 *                         type: string
 *                       total_sales:
 *                         type: integer
 *                       total_revenue:
 *                         type: number
 *                       Product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           region:
 *                             type: string
 *                 averageTicket:
 *                   type: number
 *                 totalPurchases:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 */
router.get('/sales-report', getSalesReport);

export default router;