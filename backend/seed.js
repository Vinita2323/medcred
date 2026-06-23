import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agent from './src/models/Agent.model.js';

dotenv.config();

const updateRanks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    await Agent.updateMany({ role: 'Super Agent' }, { $set: { rank: 'Platinum' } });
    await Agent.updateMany({ role: 'Agent' }, { $set: { rank: 'Gold' } });
    await Agent.updateMany({ role: 'Field Agent' }, { $set: { rank: 'Bronze' } });
    
    console.log('Agent ranks updated successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating ranks:', error);
    process.exit(1);
  }
};

updateRanks();
