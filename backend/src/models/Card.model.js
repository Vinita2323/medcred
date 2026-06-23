import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      unique: true,
    },
    cardId: {
      type: String,
      required: true,
      unique: true,
    },
    qrCodeUrl: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planName: String,
    cardType: {
      type: String,
      enum: ['individual', 'family', 'premium'],
    },
    purchasePrice: Number,
    coverageAmount: Number,
    creditLimit: Number,
    purchasedAt: Date,
    validFrom: Date,
    validTill: Date,
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'expired', 'suspended', 'blocked'],
      default: 'active',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    paymentMethod: String,
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },
    referralCodeUsed: String,
    loanEligibleFrom: Date,
    isLoanEligible: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Card = mongoose.model('Card', cardSchema);
export default Card;
