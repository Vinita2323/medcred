import Order from '../models/Order.model.js';

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderType: 'medical_equipment' })
      .populate('userId', 'fullName email mobile')
      .populate('productId', 'name price imageUrl')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { deliveryStatus, trackingId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus, trackingId },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
