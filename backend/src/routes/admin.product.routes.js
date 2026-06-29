import express from 'express';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/admin.product.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getAdminProducts);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
