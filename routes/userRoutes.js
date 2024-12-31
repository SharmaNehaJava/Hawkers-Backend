import express from 'express';
import {getUserProfile, updateUserProfile, getUserOrders, getUserAddresses, addUserAddress, deleteUserAccount, updateUserAddress } from '../controllers/userController.js';
import { registerUser, requestOTP, verifyOTP} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', registerUser);


// router.post('/google', googleAuth);
router.get('/getprofile', protect, getUserProfile);
router.put('/updateprofile', protect, updateUserProfile);
router.delete('/deleteAccount', protect, deleteUserAccount);
router.get('/orders', protect, getUserOrders);
router.get('/getaddresses', protect, getUserAddresses);
router.post('/addaddresses', protect, addUserAddress);
router.put('/updateaddress/:id', protect, updateUserAddress);

export default router;

