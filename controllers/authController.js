import User from '../models/User.js';
import { sendSMS } from '../utils/sendSMS.js';
import generateToken from '../utils/generateToken.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

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
      return res.status(200).json({ message: 'User not found. Please register first.', userExists: false });
    }

    if (actionType === 'signup' && user) {
      return res.status(400).json({ message: 'User already exists. Please log in.', userExists: true });
    }

    if (method === 'sms') {
      await sendSMS(identifier);
      return res.status(200).json({ message: 'OTP sent via SMS.', userExists: !!user });
    }

    return res.status(400).json({ message: 'Invalid method provided.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
  }
};

export const verifyOTP = async (req, res) => {
  const { identifier, otp, actionType, method } = req.body;

  try {
    const phoneNumberObj = parsePhoneNumberFromString(identifier, 'IN');
    const formattedIdentifier = phoneNumberObj ? phoneNumberObj.format('E.164') : identifier;

    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: formattedIdentifier, code: otp });

    if (verificationCheck.status === 'approved') {
      if (actionType === 'signin') {
        const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        const token = generateToken(user._id);

        if (method === 'sms') {
          user.isMobileVerified = true;
        } else if (method === 'email') {
          user.isEmailVerified = true;
        }
        await user.save();

        return res.status(200).json({ verified: true, token, user });
      } else if (actionType === 'signup') {
        return res.status(200).json({ verified: true });
      }
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