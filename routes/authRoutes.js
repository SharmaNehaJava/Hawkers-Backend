import express from 'express'
import {registerUser, loginUser, registerVendor, loginVendor} from '../controllers/authController'
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/vendor/register', registerVendor);
router.post('/vendor/login', loginVendor);

module.exports = router; 