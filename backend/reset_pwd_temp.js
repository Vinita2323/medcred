import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medcred');
    console.log('Connected to DB');

    const mobileNumber = '6269221163';
    const newPassword = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { mobile: mobileNumber },
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      console.log(`Successfully reset password for ${user.fullName} (${user.mobile}) to: ${newPassword}`);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

resetPassword();
