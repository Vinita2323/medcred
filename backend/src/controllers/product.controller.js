import Product from '../models/Product.model.js';

// @route   GET /api/v1/products
// @desc    Get all active products
// @access  Public / Private
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/v1/products/seed
// @desc    Seed initial products
// @access  Public / Admin
export const seedProducts = async (req, res) => {
  try {
    const existing = await Product.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ success: false, message: 'Products already seeded.' });
    }

    const products = [
      {
        productId: 'PRD-BPM-01',
        name: 'BP Monitor Pro',
        category: 'bp_monitor',
        description: 'Premium quality BP Monitor designed for accurate and fast readings. Ideal for home healthcare use with MedCred guarantee.',
        imageUrl: '/uploads/Bloodpressure.webp',
        price: 3500,
        discountedPrice: 1575,
        brand: 'MedCred Health',
        stockCount: 100
      },
      {
        productId: 'PRD-GLC-01',
        name: 'Smart Glucometer',
        category: 'glucometer',
        description: 'Instant and accurate blood glucose monitoring device with test strips included.',
        imageUrl: '/uploads/Glucometer.webp',
        price: 2000,
        discountedPrice: 999,
        brand: 'MedCred Health',
        stockCount: 150
      },
      {
        productId: 'PRD-THM-01',
        name: 'Digital Thermometer',
        category: 'thermometer',
        description: 'High precision digital thermometer for quick fever checks.',
        imageUrl: '/uploads/thermometer.jpg',
        price: 500,
        discountedPrice: 250,
        brand: 'MedCred Health',
        stockCount: 500
      },
      {
        productId: 'PRD-WGS-01',
        name: 'Smart Weighing Scale',
        category: 'weighing_scale',
        description: 'Digital body weight scale with high accuracy sensors.',
        imageUrl: '/uploads/Weighting.webp',
        price: 2500,
        discountedPrice: 1200,
        brand: 'MedCred Health',
        stockCount: 80
      },
      {
        productId: 'PRD-ACP-01',
        name: 'Acupressure Mat',
        category: 'acupressure',
        description: 'Relieve stress and pain with this premium acupressure mat.',
        imageUrl: '/uploads/Acupressure.jpg',
        price: 1500,
        discountedPrice: 750,
        brand: 'MedCred Health',
        stockCount: 200
      },
      {
        productId: 'PRD-MSG-01',
        name: 'Full Body Massager',
        category: 'massager',
        description: 'Relax your muscles with this portable body massager.',
        imageUrl: '/uploads/Bodymassager.jpg',
        price: 4500,
        discountedPrice: 2200,
        brand: 'MedCred Health',
        stockCount: 50
      }
    ];

    await Product.insertMany(products);
    res.status(201).json({ success: true, message: 'Products seeded successfully' });
  } catch (error) {
    console.error('seedProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
