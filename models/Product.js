import mongoose from 'mongoose';

// Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Fruits', 'Vegetables', 'Fast Food', 'Dairy', 'Other', 'Juices'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  measurement: {
    type: String,
    enum: ['Kg', 'L', 'per piece', 'gm', 'ml', 'Full', 'Half','Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL or path of the image
    required: true,
  },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
