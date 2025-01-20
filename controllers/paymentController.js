import Razorpay from 'razorpay';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req, res) => {
  const { amount, address, cartItems } = req.body;

  const options = {
    amount: Number(amount) * 100, // Amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);
    console.log('Cart Items:', cartItems);
    
    // Group items by vendor
    const ordersByVendor = cartItems.reduce((acc, item) => {
      if (!acc[item.vendor_id]) {
        acc[item.vendor_id] = [];
      }
      acc[item.vendor_id].push(item);
      return acc;
    }, {});

    // Create separate orders for each vendor
    const orderPromises = Object.keys(ordersByVendor).map(async (vendorId) => {
      const order = new Order({
        user: req.user._id,
        vendor: vendorId,
        items: ordersByVendor[vendorId],
        address,
        paymentId: razorpayOrder.id,
        status: 'placed'
      });
      return order.save();
    });

    const createdOrders = await Promise.all(orderPromises);
    res.status(201).json({ orders: createdOrders, razorpayOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export const handlePaymentSuccess = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, address, cart } = req.body;

  try {
    const ordersByVendor = cart.reduce((acc, item) => {
      if (!acc[item.vendor_id]) {
        acc[item.vendor_id] = [];
      }
      acc[item.vendor_id].push(item);
      return acc;
    }, {});

    const orderPromises = Object.keys(ordersByVendor).map(async (vendorId) => {
      const order = new Order({
        user: req.user._id,
        vendor: vendorId,
        items: ordersByVendor[vendorId].map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        address,
        paymentId: razorpayPaymentId,
        status: 'processing',
      });
      return order.save();
    });

    const orders = await Promise.all(orderPromises);
    res.status(201).json({ orders});
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});