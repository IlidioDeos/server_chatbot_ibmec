import express from 'express';
import {
  createPurchase,
  getCustomerPurchases,
  getSalesReport,
  getPurchaseReport
} from '../controllers/purchase.controller.js';

const router = express.Router();

router.post('/', createPurchase);
router.get('/customer/:customerId', getCustomerPurchases);
router.get('/report', getPurchaseReport);

export default router;