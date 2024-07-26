import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getVendorProfile, updateVendorProfile } from '../controllers/vendorController.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();

router.route('/profile').get(protect, getVendorProfile).put(protect, updateVendorProfile);

router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const vendors = await Vendor.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 5000 // 5 km radius
        }
      }
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
