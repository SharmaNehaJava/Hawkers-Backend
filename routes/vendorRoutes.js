import express from 'express';
import {protect} from '../middlewares/authMiddleware'
import {getVendorProfile, updateVendorProfile} from '../controllers/vendorController'

const router = express.Router();

router.route('/profile').get(protect, getVendorProfile).put(protect, updateVendorProfile);

module.exports = router; 
