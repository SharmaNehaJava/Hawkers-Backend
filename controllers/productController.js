import Product from '../models/Product.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const getObjectURL = async (Key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};

// Controller to get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('vendor');
    // console.log('Products fetched:', products);
    if (!Array.isArray(products)) {
      throw new Error('Products is not an array');
    }
    const productsWithUrls = await Promise.all(products.map(async (product) => {
      // console.log('Generating pre-signed URL for product:', product);
      const imageUrl = await getObjectURL(product.imageUrl);
      // console.log('Pre-signed URL generated:', imageUrl);
      return { ...product._doc, imageUrl };
    }));
    res.json(productsWithUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error', error: error.message  });
  }
};

// Controller to get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.name;
    const products = await Product.find({ category });
    const productsWithUrls = await Promise.all(products.map(async (product) => {
      const imageUrl = await getObjectURL(product.imageUrl);
      return { ...product._doc, imageUrl };
    }));
    res.json(productsWithUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const searchProductsByName = async (req, res) => {
  try {
    const name = req.query.name;
    const products = await Product.find({
      $or: [
        { name: { $regex: name, $options: 'i' } },
        { description: { $regex: name, $options: 'i' } },
        { category: { $regex: name, $options: 'i' } }
      ]
    });
    const productsWithUrls = await Promise.all(products.map(async (product) => {
      const imageUrl = await getObjectURL(product.imageUrl);
      return { ...product._doc, imageUrl };
    }));
    res.json(productsWithUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
