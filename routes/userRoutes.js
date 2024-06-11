import express from 'express';
import {protect } from '../middlewares/authMiddleware';
import {getUserProfile, updateUserProfile} from '../controllers/userController'

const router  = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router; 