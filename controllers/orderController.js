// File: controllers/orderController.js
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';

// Get User Orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('vendor', 'name location');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Vendor Orders
export const getVendorOrders = async (req, res) => {
    try {
        const orders = await Order.find({ vendor: req.vendor._id }).populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
