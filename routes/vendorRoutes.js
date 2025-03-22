import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    requestVendorOTP,
    verifyVendorOTP,
    registerVendor,
    getVendorProfile,
    updateVendorProfile,
    addProduct,
    getSignedUrlForUpload,  // Get signed URL for uploading product images
    getVendorProducts,      // Get list of vendor's products
    updateProduct,          // Update product details
    deleteProduct,          // Delete a product
    getVendorOrders,
    updateOrderStatus,      // Update order status
    getVendorDashboard, 
    getOrderDashboard,      // Vendor dashboard with basic analytics
    deleteVendorAccount    
} from '../controllers/vendorController.js';

const router = express.Router();

// Authentication ✅
router.post('/register', registerVendor);  
router.post('/request-otp', requestVendorOTP);
router.post('/verify-otp', verifyVendorOTP);

// Profile ✅
router.get('/profile', protect, getVendorProfile);
router.put('/profile', protect, updateVendorProfile);

// Delete Account ✅
router.delete('/delete-account/:vendorId', protect, deleteVendorAccount);

// Product Management ✅
router.post('/add-product', protect, addProduct);
router.get('/products', protect, getVendorProducts);       // Get all products
router.post('/get-signed-url', protect, getSignedUrlForUpload);

// PENDING⌚
router.put('/update-product/:productId', protect, updateProduct);        // Update product
router.delete('/delete-product/:productId', protect, deleteProduct);     // Delete product

// Order Management ✅
router.get('/orders-dashboard', protect, getOrderDashboard);  // Get all orders
router.get('/orders', protect, getVendorOrders);
router.put('/update-order-status/:id', protect, updateOrderStatus);  // Update order status

// Dashboard✅
router.get('/dashboard', protect, getVendorDashboard);     // Basic stats and analytics

export default router;


