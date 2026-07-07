import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agent from './src/models/Agent.model.js';

dotenv.config();

const generateJoinCode = async (role) => {
  const prefix = role === 'Super Agent' ? 'J-SA' : 'J-AG';
  let code;
  let isUnique = false;
  while (!isUnique) {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `${prefix}${num}`;
    const existing = await Agent.findOne({ joinCode: code });
    if (!existing) isUnique = true;
  }
  return code;
};

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const agentsToUpdate = await Agent.find({
      status: 'Approved',
      role: { $in: ['Super Agent', 'Agent'] },
      joinCode: { $exists: false }
    });

    console.log(`Found ${agentsToUpdate.length} agents needing join codes.`);

    for (const agent of agentsToUpdate) {
      const code = await generateJoinCode(agent.role);
      agent.joinCode = code;
      await agent.save({ validateModifiedOnly: true });
      console.log(`Assigned ${code} to ${agent.fullName} (${agent.role})`);
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

runMigration();
