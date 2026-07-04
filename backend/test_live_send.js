import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { saveOtp } from './src/services/otp.service.js';

dotenv.config();

const test = async () => {
  const number = process.argv[2];
  if (!number) {
    console.error('Please provide a 10-digit mobile number as an argument.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Sending live OTP to ${number}...`);
    const otp = await saveOtp(number, 'register');
    console.log(`OTP generated: ${otp}. Live SMS request completed.`);
    process.exit(0);
  } catch (err) {
    console.error('Error sending live OTP:', err);
    process.exit(1);
  }
};

test();
