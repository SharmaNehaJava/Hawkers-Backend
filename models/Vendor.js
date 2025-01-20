import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const venderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true,     unique: true }, 
    isMobileVerified: { type: Boolean, default: false }, 
    profileImage: {type: String},
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    availability: { type: Boolean, default: false },
    businessName: { type: String, required: true },
    businessType:{type:String,enum:['moving', 'stationary'], required:true},
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    socketId: { type: String },
    status: { type: String,enum:['active', 'inactive'], default: 'inactive' },
    hawkingTimes: {
        morning: { start: String, end: String }, // e.g., { start: "06:00", end: "16:00" }
        evening: { start: String, end: String }  // e.g., { start: "16:00", end: "22:00" }
    },
    createdAt: { type: Date, default: Date.now },

}, { timestamps: true });

const Vendor = mongoose.model('Vendor', venderSchema);

export default Vendor;