// File: routes/orderRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {getUserOrders, getVendorOrders } from '../controllers/orderController.js';

const router = express.Router();

router.route('/user').get(protect, getUserOrders);
router.route('/vendor').get(protect, getVendorOrders);

export default router;
