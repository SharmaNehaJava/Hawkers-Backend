// File: routes/orderRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { placeOrder, updateOrderStatus, getUserOrders, getVendorOrders } from '../controllers/orderController.js';

const router = express.Router();

router.route('/place').post(protect, placeOrder);
router.route('/status').put(protect, updateOrderStatus);
router.route('/user').get(protect, getUserOrders);
router.route('/vendor').get(protect, getVendorOrders);

export default router;
