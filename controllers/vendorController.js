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

export const getVendorDashboard = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.vendor._id }); // Assuming `req.vendor._id` contains the logged-in vendor's ID

        const totalProducts = products.reduce((sum, product) => sum + product.stock, 0);

        const lowStockCount = products.filter(product => product.stock < 10).length;

        res.status(200).json({
            totalProducts,
            lowStockCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard data', error });
    }
};

export const deleteVendorAccount = async (req, res) => {
    try {
      const { vendorId } = req.params;
  
      // Check if vendor exists
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
  
      // Delete all vendor products
      await Product.deleteMany({ vendor: vendorId });
  
      // Delete vendor
      await Vendor.findByIdAndDelete(vendorId);
  
      res.status(200).json({ message: "Vendor account deleted successfully" });
    } catch (error) {
      console.error("Error deleting vendor account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
};

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
    console.log(1);
    try {
        let vendor = await Vendor.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

        if (actionType === 'signin' && !vendor) {
            console.log(2);
            return res.status(200).json({ message: 'Vendor not found. Please register first.', vendorExists: false });
        }

        if (actionType === 'signup' && vendor) {
            return res.status(200).json({ message: 'Vendor already exists. Please log in.', vendorExists: true });
        }

        // Sending OTP using Twilio for SMS
        if (method === 'sms') {
            await sendSMS(identifier);
            return res.status(200).json({ message: 'OTP sent via SMS.', vendorExists: !!vendor });
        }
        // console.log("Done from here.");
        return res.status(400).json({ message: 'Invalid method provided.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
    }
};

// Verify OTP for Vendor
export const verifyVendorOTP = async (req, res) => {
    const { identifier, otp, actionType, method } = req.body;
    // console.log('Request Body:', req.body);

    try {
        const phoneNumberObj = parsePhoneNumberFromString(identifier, 'IN');
        const formattedIdentifier = phoneNumberObj ? phoneNumberObj.format('E.164') : identifier;

        // console.log('Pretend Twilio verify for:', formattedIdentifier, 'with code:', otp);
        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: formattedIdentifier, code: otp });

        // console.log('Verification Check:', verificationCheck);
        if (verificationCheck.status === 'approved') {
            if (actionType === 'signin') {
                // console.log(identifier)
                const vendor = await Vendor.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

                if (!vendor) {
                    return res.status(404).json({ message: 'Vendor not found.' });
                }

                if (method === 'sms') {
                    vendor.isMobileVerified = true;
                    // console.log('Vendor:', vendor);
                } else if (method === 'email') {
                    vendor.isEmailVerified = true;
                }
                vendor.status = 'active';
                vendor.availability = true;
                // console.log("yha tk bhi ho gya bhn")
                try {
                    await vendor.save();
                    // console.log("chalo ye bhi ho gya");
                    const token = generateToken(vendor._id);
                    return res.status(200).json({ verified: true, token, vendor });
                } catch (saveError) {
                    console.error('Error saving vendor:', saveError);
                    return res.status(500).json({ error: 'Failed to save vendor. Please try again later.' });
                }
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
    const { name, email, mobile, businessName, businessType } = req.body;
    try {
        let existingVendor = await Vendor.findOne({ $or: [{ email }, { mobile }] });

        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists. Please log in.' });
        }
        console.log(1);
        const newVendor = new Vendor({
            name,
            email,
            mobile,
            businessName,
            businessType,
            isMobileVerified: true,
            location: { type: "Point", coordinates: [0, 0] },
        });

        await newVendor.save();
        const token = generateToken(newVendor._id);
        res.status(201).json({ token, vendor: newVendor });
    } catch (error) {
        console.error("Error saving vendor:", error);  // Log the full error message
    res.status(500).json({ error: 'Failed to register vendor.', details: error.message });
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

// get Vendor Dashboard
export const getOrderDashboard = async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const totalOrders = await Order.countDocuments({ vendor: vendorId });
        const pendingOrders = await Order.countDocuments({
            vendor: vendorId,
            status: { $in: ['placed', 'processing', 'shipped'] }
        });
        const completedOrders = await Order.countDocuments({
            vendor: vendorId,
            status: 'delivered'
        });
        const failedOrders = await Order.countDocuments({
            vendor: vendorId,
            status: 'failed'
        });

        // 🔍 STEP 1: Log all delivered orders for this vendor
        // const deliveredOrders = await Order.find({ vendor: vendorId, status: 'delivered' });
        // console.log("Delivered Orders:", JSON.stringify(deliveredOrders, null, 2));
        // const totalRevenueResult = await Order.aggregate([
        //     {
        //         $match: {
        //             vendor: new mongoose.Types.ObjectId(vendorId),
        //             status: { $eq: "delivered" },
        //         }
        //     },
        //     { $unwind: "$items" }, // Split array into separate documents
        //     {
        //         $group: {
        //             _id: null,
        //             totalRevenue: {
        //                 $sum: {
        //                     $multiply: [
        //                         { $toDouble: "$items.price" },
        //                         { $toDouble: "$items.quantity" }
        //                     ]
        //                 }
        //             }
        //         }
        //     }
        // ]);
        // console.log("Step 3: Aggregation Result:", JSON.stringify(totalRevenueResult, null, 2));

        // const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;
        // console.log(totalRevenue)
        // console.log(5);
        res.status(200).json({
            totalOrders,
            pendingOrders,
            completedOrders,
            failedOrders,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve analytics' });
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
    // console.log(req.body);
    // console.log(req.body.order.vendor);
    const { id: orderId } = req.params;  // Extracting orderId from URL parameter
    const { status, order } = req.body;  // Getting new status from the request body
    const vendorId = order?.vendor;  // Assuming the vendor is authenticated and their ID is in req.user

    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        // Check if the vendor exists
        // console.log(1);
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }
        // console.log(2);
        // Find the specific order within vendor's orders
        const order = await Order.findOne({ _id: orderId, vendor: vendorId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        // console.log(3);
        // Update the order status
        order.status = status;
        await order.save();
        // console.log(4);
        return res.status(200).json({ message: 'Order status updated successfully.', order });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update order status.', error });
    }
};

// Basic Analytics (e.g., Total Sales, Total Orders)
// export const getVendorDashboard = async (req, res) => {
//     try {
//         const totalOrders = await Order.countDocuments({ vendor: req.vendor.id });
//         const totalSales = await Order.aggregate([
//             { $match: { vendor: req.vendor.id, status: 'Completed' } },
//             { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
//         ]);

//         res.status(200).json({
//             totalOrders,
//             totalSales: totalSales[0] ? totalSales[0].totalSales : 0,
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to retrieve analytics' });
//     }
// };