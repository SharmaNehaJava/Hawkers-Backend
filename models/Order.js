// File: models/Order.js
import mongoose from 'mongoose';

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
        type: String,
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum:['placed', 'processing', 'shipped', 'delivered'],
        default: 'Placed',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
