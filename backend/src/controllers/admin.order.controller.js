import Order from '../models/Order.model.js';
import Card from '../models/Card.model.js';

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

export const getAdminMembershipOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderType: 'membership_card' })
      .populate('userId', 'fullName email mobile')
      .populate('planId', 'name price validityDays')
      .populate('agentId', 'fullName agentId referralCode')
      .sort({ createdAt: -1 })
      .lean();

    const orderIds = orders.map(o => o._id);
    const userIds = orders.map(o => o.userId?._id || o.userId);
    
    // Fetch cards matching either the exact orderId or belonging to the users in these orders
    const cards = await Card.find({
      $or: [
        { orderId: { $in: orderIds } },
        { userId: { $in: userIds } }
      ]
    }).lean();
    
    const cardMap = {};
    for (const c of cards) {
      if (c.orderId) {
        cardMap[c.orderId.toString()] = c;
      } else if (c.userId && c.planId) {
        cardMap[`${c.userId.toString()}_${c.planId.toString()}`] = c;
      }
    }

    const ordersWithCardStatus = orders.map(o => {
      let card = cardMap[o._id.toString()];
      if (!card && o.userId && o.planId) {
        const uId = (o.userId._id || o.userId).toString();
        const pId = (o.planId._id || o.planId).toString();
        card = cardMap[`${uId}_${pId}`];
      }

      let status = 'pending';
      if (card) {
        if (card.status === 'expired') {
          status = 'expired';
        } else if (card.validTill && new Date() > new Date(card.validTill)) {
          status = 'expired';
        } else {
          status = card.status; // typically 'active' or 'pending_verification'
        }
      }
      return { ...o, cardStatus: status };
    });

    res.status(200).json({ success: true, count: ordersWithCardStatus.length, data: ordersWithCardStatus });
  } catch (error) {
    console.error('Error fetching membership orders:', error);
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

export const getPendingOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({ orderType: 'medical_equipment', deliveryStatus: 'pending' });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
