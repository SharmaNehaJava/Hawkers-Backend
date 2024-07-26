import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Address from '../models/addressModel.js';

// @desc Get user profile
// @route GET /api/user/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dob: user.dob,
      gender: user.gender,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc Update user profile
// @route PUT /api/user/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.dob = req.body.dob || user.dob;
    user.gender = req.body.gender || user.gender;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      dob: updatedUser.dob,
      gender: updatedUser.gender,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await user.remove();
    res.json({ message: 'User account deleted' });
    console.log("User Deleted")
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc Get user orders
// @route GET /api/user/orders
// @access Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc Get user addresses
// @route GET /api/user/addresses
// @access Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.json(addresses);
});

// @desc Add user address
// @route POST /api/user/addresses
// @access Private
const addUserAddress = asyncHandler(async (req, res) => {
  const newAddress = new Address({
    user: req.user._id,
    pincode: req.body.pincode,
    state: req.body.state,
    houseNumber: req.body.houseNumber,
    building: req.body.building,
    street: req.body.street,
    area: req.body.area,
    localityTown: req.body.localityTown,
    cityDistrict: req.body.cityDistrict,
    type: req.body.type,
    isDefault: req.body.isDefault || false,
  });

  const savedAddress = await newAddress.save();
  res.status(201).json(savedAddress);
});

export { getUserProfile, updateUserProfile, getUserOrders, getUserAddresses, addUserAddress, deleteUserAccount};
