import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

import { sendSMS } from '../utils/sendSMS.js';
import generateToken from '../utils/generateToken.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});


// const S3Client = new S3Client({
//      region: process.env.AWS_REGION,
//         credentials: {
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//         },
//  });

//  async function putObject(filename, contentType) {
//     const command = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         key:`product-image/${filename}`,
//         ContentType: contentType,
//     });
//     const url = await getSignedUrl(S3Client, command, { expiresIn: 3600 });
//     return url;
//  }

//  async function getObjectURL(Key){
//     const command = new GetObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: Key,
//     });
//     const url = await getSignedUrl(S3Client, command, { expiresIn: 3600 });
//     return url;
//  }


// Function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Request OTP for Vendor (login/registration)
export const requestVendorOTP = async (req, res) => {
    const { identifier, method, actionType } = req.body;
    console.log('Request Body:', req.body);

    if (!identifier || !method || !actionType) {
        console.error('Missing required fields:', req.body);
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let vendor = await Vendor.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

        if (actionType === 'signin' && !vendor) {
            return res.status(404).json({ message: 'Vendor not found. Please register first.', vendorExists: false });
        }

        if (actionType === 'signup' && vendor) {
            return res.status(400).json({ message: 'Vendor already exists. Please log in.', vendorExists: true });
        }

        // Sending OTP using Twilio for SMS
        if (method === 'sms') {
            await sendSMS(identifier);
            return res.status(200).json({ message: 'OTP sent via SMS.', vendorExists: !!vendor });
        }

        return res.status(400).json({ message: 'Invalid method provided.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
    }
};

// Verify OTP for Vendor
export const verifyVendorOTP = async (req, res) => {
    const { identifier, otp, actionType, method } = req.body;

    try {
        const phoneNumberObj = parsePhoneNumberFromString(identifier, 'IN');
        const formattedIdentifier = phoneNumberObj ? phoneNumberObj.format('E.164') : identifier;

        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: formattedIdentifier, code: otp });

        if (verificationCheck.status === 'approved') {
            if (actionType === 'signin') {
                const vendor = await Vendor.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

                if (!vendor) {
                    return res.status(404).json({ message: 'Vendor not found.' });
                }

                const token = generateToken(vendor._id);

                if (method === 'sms') {
                    vendor.isMobileVerified = true;
                } else if (method === 'email') {
                    vendor.isEmailVerified = true;
                }
                await vendor.save();

                return res.status(200).json({ verified: true, token, vendor });
            } else if (actionType === 'signup') {
                return res.status(200).json({ verified: true });
            }
        } else {
            return res.status(400).json({ message: 'Invalid or expired OTP.', verified: false });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Failed to verify OTP. Please try again later.', verified: false });
    }
};

// Vendor Registration
export const registerVendor = async (req, res) => {
    const { name, email, mobile, businessName,businessType, address } = req.body;

    try {
        let existingVendor = await Vendor.findOne({ $or: [{ email }, { mobile }] });

        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists. Please log in.' });
        }

        const newVendor = new Vendor({
            name,
            email,
            mobile,
            businessName,
            businessType,
            address,
            isVerified: true
        });

        await newVendor.save();

        const token = generateToken(newVendor._id);
        console.log('Generated Token:', token);
        res.status(201).json({ token, vendor: newVendor });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register vendor.' });
    }
};

// Get Vendor Profile
export const getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve vendor profile' });
    }
};

// Update Vendor Profile
export const updateVendorProfile = async (req, res) => {
    const updates = req.body;

    try {
        const vendor = await Vendor.findByIdAndUpdate(req.vendor.id, updates, { new: true });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json({ message: 'Profile updated successfully', vendor });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update vendor profile' });
    }
};

// Add a New Product
export const addProduct = async (req, res) => {
    const { name, description, price, stock, category, measurement, imageUrl } = req.body;
    // console.log('Request Body:', req.body);
    // Handle Image Upload to AWS S3
    try {
        const newProduct = new Product({
            vendor: req.vendor.id,
            name,
            description,
            price,
            stock,
            category,
            measurement,
            imageUrl,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add product', error });
    }
};

export const getSignedUrlForUpload = async (req, res) => {
    const { filename, filetype, category } = req.body;
    // console.log(filename);
    //   console.log(filetype);
    //   console.log(category);

    //   console.log('S3Client:', s3Client);
    // console.log(process.env.AWS_REGION);
    // console.log(process.env.AWS_ACCESS_KEY);
    // console.log(process.env.AWS_SECRET_KEY);
    // console.log(process.env.AWS_BUCKET_NAME);
    try {
        const key = `product-categories/${category}/${Date.now()}-${filename}`;
        // console.log("Key :"+key);
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: filetype,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        // console.log('Signed URL generated:', url);
        // console.log('Key:', key);
        res.status(200).json({ url, key });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ message: 'Failed to get signed URL', error });
    }
};

// List All Products for Vendor
export const getVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.vendor.id });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

// Update a Product
export const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const updates = req.body;

    try {
        const product = await Product.findOneAndUpdate({ _id: productId, vendor: req.vendor.id }, updates, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found or you do not have access' });

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product' });
    }
};

// Delete a Product
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findOneAndDelete({ _id: productId, vendor: req.vendor.id });
        if (!product) return res.status(404).json({ message: 'Product not found or you do not have access' });

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

// Get Vendor Orders
export const getVendorOrders = async (req, res) => {
    try {
        const orders = await Order.find({ vendor: req.vendor.id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
};

// Update Order Status for Vendor Orders
export const updateOrderStatus = async (req, res) => {
    const { id: orderId } = req.params;  // Extracting orderId from URL parameter
    const { status } = req.body;  // Getting new status from the request body
    const vendorId = req.user._id;  // Assuming the vendor is authenticated and their ID is in req.user

    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        // Check if the vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }

        // Find the specific order within vendor's orders
        const order = await Order.findOne({ _id: orderId, vendor: vendorId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Update the order status
        order.status = status;
        await order.save();

        return res.status(200).json({ message: 'Order status updated successfully.', order });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update order status.', error });
    }
};

// Basic Analytics (e.g., Total Sales, Total Orders)
export const getVendorDashboard = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({ vendor: req.vendor.id });
        const totalSales = await Order.aggregate([
            { $match: { vendor: req.vendor.id, status: 'Completed' } },
            { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
        ]);

        res.status(200).json({
            totalOrders,
            totalSales: totalSales[0] ? totalSales[0].totalSales : 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve analytics' });
    }
};
