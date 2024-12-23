// routes/cartRoutes.js
import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addToCart)
  .get(protect, getCart);

router.route('/:productId').delete(protect, removeFromCart);

export default router;
