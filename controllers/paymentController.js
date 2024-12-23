// import Razorpay from 'razorpay';
// import asyncHandler from 'express-async-handler';

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID, // Add this to your `.env` file
//   key_secret: process.env.RAZORPAY_KEY_SECRET, // Add this to your `.env` file
// });

// const createOrder = asyncHandler(async (req, res) => {
//   const { amount, currency = 'INR', receipt = 'receipt#1', notes = {} } = req.body;

//   const options = {
//     amount: amount * 100, // Amount in paise (₹1 = 100 paise)
//     currency,
//     receipt,
//     notes,
//   };

//   try {
//     const order = await razorpayInstance.orders.create(options);
//     res.status(201).json(order);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating Razorpay order', error });
//   }
// });

// export { createOrder };
