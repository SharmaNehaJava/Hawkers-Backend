import User from '../models/User.js';
import { sendSMS } from '../utils/sendSMS.js';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';
import generateToken from '../utils/generateToken.js';
import OTP from '../models/OTP.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// const saveOtp = async ({ identifier, otp, actionType }) => {
//     const otpDocument = new OTP({ identifier, otp, actionType, createdAt: new Date() });
//     await otpDocument.save();
//   };
  

// Request OTP (for both login and registration)
export const requestOTP = async (req, res) => {
    const { identifier, method, actionType } = req.body;
    console.log('Request Body:', req.body);

    if (!identifier || !method || !actionType) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      let user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
  
      if (actionType === 'signin' && !user) {
        return res.status(404).json({ message: 'User not found. Please register first.', userExists: false });
      }
  
      if (actionType === 'signup' && user) {
        return res.status(400).json({ message: 'User already exists. Please log in.', userExists: true });
      }
  
      // Sending OTP using Twilio for SMS
      if (method === 'sms') {
        await sendSMS(identifier);
        return res.status(200).json({ message: 'OTP sent via SMS.', userExists: !!user });
      } 
      // Sending OTP via Email (backend-managed)
      
    
  
      return res.status(400).json({ message: 'Invalid method provided.' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
    }
  };
  

// Verify OTP
export const verifyOTP = async (req, res) => {
    const { identifier, otp, actionType, method } = req.body;
  
    try {
      const phoneNumberObj = parsePhoneNumberFromString(identifier, 'IN');
      const formattedIdentifier = phoneNumberObj ? phoneNumberObj.format('E.164') : identifier;

      const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: formattedIdentifier, code: otp });
  
      if (verificationCheck.status === 'approved') {
        const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

        if (!user && actionType === 'signin') {
          return res.status(404).json({ message: 'User not found.' });
        }
        console.log( user._id);
        const token = generateToken(user._id);

        if (actionType === 'signin') {
          return res.status(200).json({ verified: true, token, user});
        }

        if (method === 'sms') {
          user.isMobileVerified = true;
        } else if (method === 'email') {
          user.isEmailVerified = true;
        }
        await user.save();
  
        return res.status(200).json({ verified: true, token, user });
      } else {
        return res.status(400).json({ message: 'Invalid or expired OTP.', verified: false });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ message: 'Failed to verify OTP. Please try again later.', verified: false });
    }
  };
  

export const registerUser = async (req, res) => {
    const { name, email, mobile, dob, gender } = req.body;

    try {
      let existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists. Please log in.' });
      }

        const newUser = new User({ name, email, mobile, dob, gender, isVerified: true });
        await newUser.save();
        const token = generateToken(newUser._id);
        res.status(201).json({ token, user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
};