// File: controllers/orderController.js
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';

// Place Order
export const placeOrder = async (req, res) => {
    const { vendorId, items, deliveryOption, timeSlot } = req.body;

    try {
        const vendor = await Vendor.findById(vendorId);

        if (vendor) {
            const order = await Order.create({
                user: req.user._id,
                vendor: vendorId,
                items,
                deliveryOption,
                timeSlot,
                status: 'Placed',
            });
            res.status(201).json(order);
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (order) {
            order.status = status;
            await order.save();
            res.json({ message: 'Order status updated successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
