import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isEmailVerified: {
       type: Boolean, default: false
    },
    mobile: {
      type: String,
      required: true,
    },
    isMobileVerified: {
      type: Boolean, default: false 
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    socketId:{
      type: String,
    },
    otp: String,
    otpExpiry: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
