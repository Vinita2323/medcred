import Product from '../models/Product.model.js';

export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    // imageUrl is a base64 data string sent directly in the JSON body
    const { name, category, price, discountedPrice, stockCount, brand, isAvailable, imageUrl } = req.body;

    const product = await Product.create({
      productId: `PRD-${Date.now()}`,
      name,
      category,
      price,
      discountedPrice,
      stockCount,
      brand,
      isAvailable,
      imageUrl: imageUrl || '',
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, price, discountedPrice, stockCount, brand, isAvailable, imageUrl } = req.body;

    const updateData = { name, category, price, discountedPrice, stockCount, brand, isAvailable };
    // Only update imageUrl if a new one was sent
    if (imageUrl) updateData.imageUrl = imageUrl;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
