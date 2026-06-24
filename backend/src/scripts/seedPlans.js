import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.model.js';

dotenv.config();

const plans = [
  {
    planId: 'individual',
    name: 'Individual Plan',
    price: 999,
    maxMembers: 1,
    coverageAmount: 200000,
    validity: '1 Year',
    validityDays: 365,
    isPopular: false,
    features: [
      'Hospital Cashless Claims',
      'OPD Consultation Cover',
      'Medicine Reimbursement',
      'Emergency Ambulance',
      'Loan Eligibility (after 30 days)',
    ],
    loanEligibilityAfterDays: 30,
    maxLoanAmount: 50000,
    hospitalClaimLimit: 200000,
    homeTreatmentClaimLimit: 80000,
    agentCommission: 200,
    isActive: true,
  },
  {
    planId: 'family',
    name: 'Family Plan',
    price: 2499,
    maxMembers: 4,
    coverageAmount: 300000,
    validity: '1 Year',
    validityDays: 365,
    isPopular: true,
    features: [
      'All Individual Benefits',
      'Includes Parents & In-laws',
      'Up to 4 Family Members',
      'Family Floater Coverage',
      'Higher Loan Eligibility',
    ],
    loanEligibilityAfterDays: 30,
    maxLoanAmount: 100000,
    hospitalClaimLimit: 300000,
    homeTreatmentClaimLimit: 80000,
    agentCommission: 400,
    isActive: true,
  },
  {
    planId: 'premium',
    name: 'Premium Family',
    price: 4999,
    maxMembers: 6,
    coverageAmount: 500000,
    validity: '1 Year',
    validityDays: 365,
    isPopular: false,
    features: [
      'All Family Plan Benefits',
      'Includes Parents & In-laws',
      'Up to 6 Family Members',
      'International Coverage',
      'Dedicated Health Manager',
    ],
    loanEligibilityAfterDays: 30,
    maxLoanAmount: 200000,
    hospitalClaimLimit: 500000,
    homeTreatmentClaimLimit: 80000,
    agentCommission: 800,
    isActive: true,
  },
];

const seedPlans = async () => {
  try {
    // Assuming URI is already available or use local
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcred_db';
    await mongoose.connect(uri);
    console.log('MongoDB connected...');

    await Plan.deleteMany(); // Clear existing plans
    console.log('Cleared existing plans...');

    await Plan.insertMany(plans);
    console.log('Successfully seeded 3 plans!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
