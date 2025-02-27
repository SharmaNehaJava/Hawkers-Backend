import Razorpay from 'razorpay';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import crypto from 'crypto';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req, res) => {
  const { amount, address, cartItems } = req.body;
  // console.log(req.body);

  const options = {
    amount: Math.round(amount*100), // Amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);
    // console.log('Razorpay Order:', razorpayOrder);
    // console.log('Cart Items:', cartItems);
    
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
      // console.log(order);
      return order.save();
    });

    const createdOrders = await Promise.all(orderPromises);
    res.status(201).json({ orders: createdOrders, razorpayOrder, cartItems });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export const handlePaymentSuccess = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, address, cart } = req.body;
  // console.log("handlePaymentSuccess : "+req.
  // console.log("Address: " + address);

  try {
     // Verify payment signature
     const isValidSignature = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
     if (!isValidSignature) {
      console.log("Invalid payment signature");
       return res.status(400).json({ message: 'Invalid payment signature' });
     }

     // Ensure address object contains all required fields
    if (!address || !address.pincode || !address.state || !address.houseNumber || !address.building || !address.street || !address.area || !address.localityTown || !address.cityDistrict || !address.type) {
      console.log("Invalid address");
      return res.status(400).json({ message: 'Invalid address' });
    }
    // console.log("passed 1");

      // Group items by vendor
    const ordersByVendor = cart.reduce((acc, item) => {
      if (!acc[item.vendor_id]) {
        acc[item.vendor_id] = [];
      }
      acc[item.vendor_id].push(item);
      return acc;
    }, {});

    // console.log("passed 2");

    const orderPromises = Object.keys(ordersByVendor).map(async (vendorId) => {
      const order = await Order.findOneAndUpdate(
        { user: req.user._id, vendor: vendorId, status: 'placed' },
        {
          $set: {
            items: ordersByVendor[vendorId].map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            address: {
              pincode: address.pincode,
              state: address.state,
              houseNumber: address.houseNumber,
              building: address.building,
              street: address.street,
              area: address.area,
              localityTown: address.localityTown,
              cityDistrict: address.cityDistrict,
              type: address.type, // Ensure type is correctly passed
            },
            paymentId: razorpayPaymentId,
            status: 'processing',
          },
        },
        { new: true }
      );
      return order;
    });

    const orders = await Promise.all(orderPromises);
    // console.log("passed 3");

    // Calculate total amount paid
    const totalAmount = orders.reduce((acc, order) => {
      const total = acc + order.items.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0)
      const gst = total * 0.18; // Assuming 18% GST
      const platformFee = 9; // Example platform fee
      const grandTotal = total + gst + platformFee;
      return grandTotal;
    }, 0);

    // Save payment details
    const payment = new Payment({
      paymentId: razorpayPaymentId,
      orderIds: orders.map(order => order._id), // Store all order IDs related to this payment
      amount: totalAmount,
      status: 'success',
    });
    await payment.save();
    // console.log("passed 4");

    res.status(201).json({ orders});
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

const verifySignature = (orderId, paymentId, signature) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

export const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findOneAndUpdate(
      { paymentId: orderId },
      { status: 'failed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated to failed' });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

