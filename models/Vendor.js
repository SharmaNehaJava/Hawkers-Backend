import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const venderSchema = new mongoose.Schema({
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: { lat: Number, lng: Number }, required: true },
  products: [{ type: String }],
}, { timestamps: true });

venderSchema.pre('save',async function (next){
  if(!this.isModified('password')){
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})
const Vendor = mongoose.model('Vendor', venderSchema);

export default Vendor;