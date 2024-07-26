// File: controllers/vendorController.js
import Vendor from '../models/Vendor.js';

// Get Vendor Profile
export const getVendorProfile = async (req, res) => {
    const vendor = await Vendor.findById(req.vendor._id);

    if (vendor) {
        res.json({
            _id: vendor._id,
            name: vendor.name,
            email: vendor.email,
            location: vendor.location,
            products: vendor.products,
        });
    } else {
        res.status(404).json({ message: 'Vendor not found' });
    }
};

// Update Vendor Profile
export const updateVendorProfile = async (req, res) => {
    const vendor = await Vendor.findById(req.vendor._id);

    if (vendor) {
        vendor.name = req.body.name || vendor.name;
        vendor.email = req.body.email || vendor.email;
        if (req.body.password) {
            vendor.password = req.body.password;
        }
        vendor.location = req.body.location || vendor.location;
        vendor.products = req.body.products || vendor.products;

        const updatedVendor = await vendor.save();

        res.json({
            _id: updatedVendor._id,
            name: updatedVendor.name,
            email: updatedVendor.email,
            location: updatedVendor.location,
            products: updatedVendor.products,
            token: generateToken(updatedVendor._id),
        });
    } else {
        res.status(404).json({ message: 'Vendor not found' });
    }
};
