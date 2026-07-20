import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Card = mongoose.connection.collection('cards');
  await Card.updateOne(
    { _id: new mongoose.Types.ObjectId('6a33a4f02efb34a3c128fe20') },
    { $set: { planId: new mongoose.Types.ObjectId('6a3a6f2fe80dbcc8628ead6a') } }
  );
  await Card.updateOne(
    { _id: new mongoose.Types.ObjectId('6a3a1e5d68e0a2a029d66fe2') },
    { $set: { planId: new mongoose.Types.ObjectId('6a3a6f2fe80dbcc8628ead6b') } }
  );
  await Card.updateOne(
    { _id: new mongoose.Types.ObjectId('6a3a22f7a377638c38e30e41') },
    { $set: { planId: new mongoose.Types.ObjectId('6a3a6f2fe80dbcc8628ead6b') } }
  );
  console.log('Fixed cards!');
  process.exit(0);
});
