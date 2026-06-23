import express from 'express';
import { getAllProducts, seedProducts } from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/seed', seedProducts);

export default router;
