import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  pincode: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  houseNumber: {
    type: String,
    required: true,
  },
  building: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  localityTown: {
    type: String,
    required: true,
  },
  cityDistrict: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['home', 'office', 'other'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

export default Address;
