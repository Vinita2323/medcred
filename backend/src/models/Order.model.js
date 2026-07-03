import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderType: {
      type: String,
      default: 'membership_card',
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      // required: true, // Optional for product orders
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: String,
    planName: String,
    baseAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    referralCode: String,
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    agentDetail: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbank', 'razorpay', null],
      default: null,
    },
    paymentDetails: {
      upiId: String,
      bankName: String,
      cardLast4: String,
      cardHolderName: String,
    },
    paidAt: Date,
    invoiceNumber: String,
    deliveryAddress: String,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'returned', null],
      default: 'pending'
    },
    trackingId: String,
    estimatedDelivery: Date,
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      default: null,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
