import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    requestVendorOTP,
    verifyVendorOTP,
    registerVendor,
    getVendorProfile,
    updateVendorProfile,
    addProduct,
    getVendorProducts,      // New: Get list of vendor's products
    updateProduct,          // New: Update product details
    deleteProduct,          // New: Delete a product
    getVendorOrders,
    updateOrderStatus,      // New: Update order status
    getVendorDashboard,     // New: Vendor dashboard with basic analytics
} from '../controllers/vendorController.js';

const router = express.Router();

// Authentication
router.post('/register', registerVendor);
router.post('/request-otp', requestVendorOTP);
router.post('/verify-otp', verifyVendorOTP);

// Profile
router.get('/profile', protect, getVendorProfile);
router.put('/profile', protect, updateVendorProfile);

// Product Management
router.post('/add-product', protect, addProduct);
router.get('/products', protect, getVendorProducts);       // Get all products
router.put('/product/:id', protect, updateProduct);        // Update product
router.delete('/product/:id', protect, deleteProduct);     // Delete product

// Order Management
router.get('/orders', protect, getVendorOrders);
router.put('/orders/:id/status', protect, updateOrderStatus);  // Update order status

// Dashboard/Analytics (Optional)
router.get('/dashboard', protect, getVendorDashboard);     // Basic stats and analytics

export default router;



// import express from 'express';
// import { protect } from '../middlewares/authMiddleware.js';
// import { getVendorProfile, updateVendorProfile } from '../controllers/vendorController.js';
// import Vendor from '../models/Vendor.js';

// const router = express.Router();

// router.route('/profile').get(protect, getVendorProfile).put(protect, updateVendorProfile);

// router.get('/nearby', async (req, res) => {
//   const { lat, lng } = req.query;
//   try {
//     const vendors = await Vendor.find({
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [lng, lat]
//           },
//           $maxDistance: 5000 // 5 km radius
//         }
//       }
//     });
//     res.json(vendors);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;


