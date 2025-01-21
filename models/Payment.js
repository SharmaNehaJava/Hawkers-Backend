import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
  },
  orderIds:[
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed'],
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;