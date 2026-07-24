import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const findAndReset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcred');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Find the document in any collection
    for (let c of collections) {
      const doc = await db.collection(c.name).findOne({ mobile: '6269221163' });
      if (doc) {
        console.log(`Found in collection: ${c.name}`, doc._id);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Password@123', salt);
        
        await db.collection(c.name).updateOne(
          { _id: doc._id },
          { $set: { password: hashedPassword } }
        );
        console.log('Password reset successfully to Password@123');
        break;
      }
      
      // Also check mobileNumber field just in case
      const doc2 = await db.collection(c.name).findOne({ mobileNumber: '6269221163' });
      if (doc2) {
        console.log(`Found in collection (mobileNumber): ${c.name}`, doc2._id);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Password@123', salt);
        
        await db.collection(c.name).updateOne(
          { _id: doc2._id },
          { $set: { password: hashedPassword } }
        );
        console.log('Password reset successfully to Password@123');
        break;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};
findAndReset();
