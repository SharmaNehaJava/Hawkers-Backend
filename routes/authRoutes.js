import express from 'express'
import {registerUser, loginUser,googleAuth, registerVendor, loginVendor} from '../controllers/authController.js'
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/vendor/register', registerVendor);
router.post('/vendor/login', loginVendor);

export default router;