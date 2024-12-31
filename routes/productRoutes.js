// File: routes/productRoutes.js
import express from 'express';
import { getAllProducts, getProductsByCategory } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);

router.get('/category/:name', getProductsByCategory);

export default router;
