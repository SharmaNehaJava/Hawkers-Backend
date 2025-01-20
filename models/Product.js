import mongoose from 'mongoose';

// Product schema
const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
    required: true,
  },
  category: {
    type: String,
    enum: ['Fruits', 'Vegetables', 'Fast Food', 'Dairy','Juices', 'Other'],
    required: true,
  },
  measurement: {
    type: String,
    enum: ['Kg', 'L', 'per piece', 'gm', 'ml', 'Dozen','Other'],
    required: true,
  },
  imageUrl: {
    type: String, // URL or path of the image
    required: true,
  },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
