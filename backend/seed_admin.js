import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/Admin.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const email = 'admin@medcred.in';
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin account with email "${email}" already exists.`);
      // Reset password just to be sure it is correct
      existingAdmin.password = 'Admin@123';
      existingAdmin.isActive = true;
      existingAdmin.role = 'super_admin';
      await existingAdmin.save();
      console.log('Password reset/updated successfully to Admin@123.');
    } else {
      console.log('Creating new Admin account...');
      const newAdmin = new Admin({
        fullName: 'System Administrator',
        email: email,
        password: 'Admin@123',
        role: 'super_admin',
        isActive: true
      });
      await newAdmin.save();
      console.log('Admin account created successfully with password Admin@123.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
