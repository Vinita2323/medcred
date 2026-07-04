import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OtpStore from './src/models/OtpStore.model.js';
import User from './src/models/User.model.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('--- Recent OTP Store Entries ---');
    const otps = await OtpStore.find().sort({ createdAt: -1 }).limit(5);
    otps.forEach(o => {
      console.log(`Mobile: ${o.mobile}, OTP: ${o.otp}, Purpose: ${o.purpose}, isUsed: ${o.isUsed}, CreatedAt: ${o.createdAt}`);
    });

    console.log('--- Recent User Entries ---');
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    users.forEach(u => {
      console.log(`Name: ${u.fullName}, Mobile: ${u.mobile}, isMobileVerified: ${u.isMobileVerified}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
};

check();
