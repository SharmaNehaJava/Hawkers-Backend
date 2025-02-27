import express from 'express';
import {getNearbyVendors, getVendorDetails, getUserProfile, updateUserProfile, getUserOrders, getUserAddresses, addUserAddress, deleteUserAccount, updateUserAddress } from '../controllers/userController.js';
import { registerUser, requestOTP, verifyOTP} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { createOrder, handlePaymentSuccess, handlePaymentFailure } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', registerUser);


// router.post('/google', googleAuth);
router.get('/getprofile', protect, getUserProfile);
router.put('/updateprofile', protect, updateUserProfile);
router.delete('/deleteaccount', protect, deleteUserAccount);
router.get('/orders', protect, getUserOrders);
router.get('/getaddresses', protect, getUserAddresses);
router.post('/addaddresses', protect, addUserAddress);
router.put('/updateaddress/:id', protect, updateUserAddress);

router.get('/nearbyvendors',protect, getNearbyVendors );
router.get('/vendorinfo/:id',protect, getVendorDetails );

router.get('/getKey', (req, res) => {
    res.send(process.env.RAZORPAY_KEY_ID);
});
router.post('/payment/order',protect, createOrder);
router.post('/payment/success',protect, handlePaymentSuccess);
router.post('/payment/failure', protect, handlePaymentFailure);

export default router;

