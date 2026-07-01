// Script to update existing product imageUrls in MongoDB
// Run: node update_product_images.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const productImageMap = {
  'BP Monitor Pro':     '/uploads/Bloodpressure.webp',
  'Smart Glucometer':   '/uploads/Glucometer.webp',
  'Digital Thermometer':'/uploads/thermometer.jpg',
  'Smart Weighing Scale':'/uploads/Weighting.webp',
  'Acupressure Mat':    '/uploads/Acupressure.jpg',
  'Full Body Massager': '/uploads/Bodymassager.jpg',
};

async function updateProductImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    for (const [name, imageUrl] of Object.entries(productImageMap)) {
      const result = await mongoose.connection.db
        .collection('products')
        .updateOne({ name }, { $set: { imageUrl } });
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated: ${name} → ${imageUrl}`);
      } else {
        console.log(`⚠️  Not found in DB: ${name}`);
      }
    }

    console.log('\n🎉 All product images updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateProductImages();
