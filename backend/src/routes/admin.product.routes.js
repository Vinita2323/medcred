import express from 'express';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/admin.product.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);
router.use(restrictTo('admin'));

// No multer needed — images are sent as base64 strings in the JSON body
router.get('/', getAdminProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
