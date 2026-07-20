import Notification from '../models/Notification.model.js';

// @desc    Get all admin notifications
// @route   GET /v1/admin/notifications
// @access  Private (Admin)
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ forAdmin: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get unread count of admin notifications
// @route   GET /v1/admin/notifications/unread-count
// @access  Private (Admin)
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ forAdmin: true, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching admin unread notifications count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark admin notification as read
// @route   PATCH /v1/admin/notifications/:id/read
// @access  Private (Admin)
export const markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, forAdmin: true },
      { isRead: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notif });
  } catch (error) {
    console.error('Error marking admin notification read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
