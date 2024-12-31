import Product from '../models/Product.js';

// Controller to get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller to get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.name;
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
