import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

// Register User
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
  
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
  
    const user = await User.create({ name, email, password });
  
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  };
  
  // Login User
  export const loginUser = async (req, res) => {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  };

  export const googleAuth = async (req, res) => {
    const { tokenId } = req.body;
    const client = new OAuth2Client(85478123981-movailm7ao3v4gnli8rpg2jcvlcva2ru.apps.googleusercontent.com);
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture, sub } = ticket.getPayload();
        
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                name,
                email,
                password: sub, // you may want to hash this or use a specific field for OAuth users
                picture
            });
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: 'Google authentication failed', error });
    }
};
  
  // Register Vendor
  export const registerVendor = async (req, res) => {
    const { name, email, password, location, products } = req.body;
  
    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: 'Vendor already exists' });
    }
  
    const vendor = await Vendor.create({ name, email, password, location, products });
  
    if (vendor) {
      res.status(201).json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        location: vendor.location,
        products: vendor.products,
        token: generateToken(vendor._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid vendor data' });
    }
  };
  
  // Login Vendor
  export const loginVendor = async (req, res) => {
    const { email, password } = req.body;
  
    const vendor = await Vendor.findOne({ email });
  
    if (vendor && (await vendor.matchPassword(password))) {
      res.json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        location: vendor.location,
        products: vendor.products,
        token: generateToken(vendor._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  };