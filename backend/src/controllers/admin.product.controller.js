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
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const product = await Product.create({
      ...data,
      productId: `PRD-${Date.now()}`
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
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
