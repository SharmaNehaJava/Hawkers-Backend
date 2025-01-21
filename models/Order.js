// File: models/Order.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    houseNumber: { type: String, required: true },
    building: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    localityTown: { type: String, required: true },
    cityDistrict: { type: String, required: true },
    type: { type: String, required: true, enum: ['Home', 'Work', 'Other'], },
  });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor',
    },
    items: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    address: {
        type: addressSchema,
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['placed', 'processing', 'shipped', 'delivered', 'failed'],
        default: 'placed',
      },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
