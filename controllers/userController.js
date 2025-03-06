import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Address from '../models/addressModel.js';

// Fetch nearby vendors
export const getNearbyVendors = asyncHandler(async (req, res) => {
  const { lat, lng, radius, category, businessType } = req.query;


  try {
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
      availability: true,
      status: 'active',
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (businessType && businessType !== 'All') {
      query.businessType = businessType;
    }

    const vendors = await Vendor.find(query).populate('products');
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching nearby vendors:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Fetch vendor details and products
export const getVendorDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const products = await Product.find({ vendor: req.params.id });
    res.json({ vendor, products });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      mobile: user.mobile,
      isMobileVerified: user.isMobileVerified,
      dob: user.dob,
      gender: user.gender,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.dob = req.body.dob || user.dob;
    user.gender = req.body.gender || user.gender;

    if (!user.isEmailVerified) {
      user.email = req.body.email || user.email;
    }

    if (!user.isMobileVerified) {
      user.mobile = req.body.mobile || user.mobile;
    }

    const updatedUser = await user.save();

    res.json({
       _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isEmailVerified: updatedUser.isEmailVerified,
      mobile: updatedUser.mobile,
      isMobileVerified: updatedUser.isMobileVerified,
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
    await Order.deleteMany({ user: req.user._id });
    await Address.deleteMany({ user: req.user._id });
    await user.deleteOne();

    res.json({ message: 'User account and related data deleted' });
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
  try {
    if (req.body.isDefault) {
      // Unset previous default addresses
      await Address.updateMany(
        { user: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// @desc Update user address
// @route PUT /api/users/updateaddress/:id
// @access Private
const updateUserAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address) {
    if (req.body.isDefault) {
      // Unset previous default addresses
      await Address.updateMany(
        { user: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    address.pincode = req.body.pincode || address.pincode;
    address.state = req.body.state || address.state;
    address.houseNumber = req.body.houseNumber || address.houseNumber;
    address.building = req.body.building || address.building;
    address.street = req.body.street || address.street;
    address.area = req.body.area || address.area;
    address.localityTown = req.body.localityTown || address.localityTown;
    address.cityDistrict = req.body.cityDistrict || address.cityDistrict;
    address.type = req.body.type || address.type;
    address.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : address.isDefault;

    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } else {
    res.status(404);
    throw new Error('Address not found');
  }
});

export { getUserProfile, updateUserProfile, getUserOrders, getUserAddresses, addUserAddress, deleteUserAccount, updateUserAddress };
