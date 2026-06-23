import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from '../models/Card.model.js';

dotenv.config();

const makeEligible = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcred';
    await mongoose.connect(uri);
    console.log('MongoDB Connected to', uri);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 35); // 35 days ago

    const eligibleFrom = new Date(pastDate);
    eligibleFrom.setDate(eligibleFrom.getDate() + 30); // 5 days ago

    const result = await Card.updateMany(
      {},
      { 
        $set: { 
          purchasedAt: pastDate,
          loanEligibleFrom: eligibleFrom
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} cards to be eligible for loans.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeEligible();
