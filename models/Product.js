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
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL or path of the image
    required: true,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
