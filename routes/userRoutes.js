import express from 'express';
import { deleteUserAccount, getUserProfile, updateUserProfile, getUserOrders, getUserAddresses, addUserAddress } from '../controllers/userController.js';
import { registerUser, loginUser, googleAuth } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser)
router.post('/google', googleAuth);;
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/deleteAccount', protect, deleteUserAccount);
router.get('/orders', protect, getUserOrders);
router.get('/addresses', protect, getUserAddresses);
router.post('/addresses', protect, addUserAddress);

export default router;

