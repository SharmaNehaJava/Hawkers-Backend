import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const venderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true,     unique: true }, 
    isMobileVerified: { type: Boolean, default: false }, 
    products: [{ type: String }],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
    },
    businessName: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: { type: Date, default: Date.now },

}, { timestamps: true });

const Vendor = mongoose.model('Vendor', venderSchema);

export default Vendor;