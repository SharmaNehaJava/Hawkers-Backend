import User from '../models/User'
import Vendor from '../models/Vender'
import jwt from '../utils/generateToker'

// Register User
exports.registerUser = async (req, res) => {
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
  exports.loginUser = async (req, res) => {
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
  
  // Register Vendor
  exports.registerVendor = async (req, res) => {
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
  exports.loginVendor = async (req, res) => {
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