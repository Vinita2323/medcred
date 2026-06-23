import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './configs/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 MedCred Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    console.log(`\n📌 Auth Routes:`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/verify-otp`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/forgot-password`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/reset-password`);
    console.log(`   POST http://localhost:${PORT}/api/v1/agent/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/v1/admin/auth/login`);
    console.log(`\n🏥 Health: http://localhost:${PORT}/api/v1/health\n`);
  });
};

startServer();
