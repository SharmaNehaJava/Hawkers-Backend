import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: String, // Can be email or mobile
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 300 } // Automatically delete after 5 minutes
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
