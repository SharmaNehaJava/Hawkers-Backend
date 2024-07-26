// File: controllers/productController.js
import Vendor from '../models/Vendor.js';

// Add Product
export const addProduct = async (req, res) => {
    const { name, description, price } = req.body;

    try {
        const vendor = await Vendor.findById(req.vendor._id);

        if (vendor) {
            const product = { name, description, price };
            vendor.products.push(product);
            await vendor.save();
            res.status(201).json({ message: 'Product added successfully' });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    const { productId, name, description, price } = req.body;

    try {
        const vendor = await Vendor.findById(req.vendor._id);

        if (vendor) {
            const product = vendor.products.id(productId);
            if (product) {
                product.name = name || product.name;
                product.description = description || product.description;
                product.price = price || product.price;
                await vendor.save();
                res.json({ message: 'Product updated successfully' });
            } else {
                res.status(404).json({ message: 'Product not found' });
            }
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove Product
export const removeProduct = async (req, res) => {
    const { productId } = req.body;

    try {
        const vendor = await Vendor.findById(req.vendor._id);

        if (vendor) {
            vendor.products.id(productId).remove();
            await vendor.save();
            res.json({ message: 'Product removed successfully' });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
