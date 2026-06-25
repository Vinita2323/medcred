import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const AgentSchema = new mongoose.Schema({
  role: String,
  commissionRate: Number,
}, { strict: false });

const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);

const getCommissionRate = (role) => {
  if (role === 'Super Agent') return 3;
  if (role === 'Agent') return 4;
  return 12; // Field Agent
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medcred');
    const agents = await Agent.find({});
    for (const agent of agents) {
      if (agent.role) {
        agent.commissionRate = getCommissionRate(agent.role);
        await agent.save();
        console.log(`Updated ${agent.role} to ${agent.commissionRate}%`);
      }
    }
    console.log('Finished updating agents');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
