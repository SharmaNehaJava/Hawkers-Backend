// File: routes/productRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { addProduct, updateProduct, removeProduct } from '../controllers/productController.js';

const router = express.Router();

router.route('/add').post(protect, addProduct);
router.route('/update').put(protect, updateProduct);
router.route('/remove').delete(protect, removeProduct);

export default router;
