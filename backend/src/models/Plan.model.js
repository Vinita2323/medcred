import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxMembers: {
      type: Number,
      required: true,
    },
    coverageAmount: {
      type: Number,
      required: true,
    },
    validity: {
      type: String,
      required: true,
    },
    validityDays: {
      type: Number,
      required: true,
      default: 365,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: {
      type: [String],
      required: true,
    },
    loanEligibilityAfterDays: {
      type: Number,
      default: 30,
    },
    maxLoanAmount: {
      type: Number,
      default: 50000,
    },
    hospitalClaimLimit: {
      type: Number,
      required: true,
    },
    homeTreatmentClaimLimit: {
      type: Number,
      required: true,
    },
    agentCommission: {
      type: Number,
      default: 200,
    },
    fieldAgentCommissionPct: {
      type: Number,
      default: 12,
    },
    agentCommissionPct: {
      type: Number,
      default: 4,
    },
    superAgentCommissionPct: {
      type: Number,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
