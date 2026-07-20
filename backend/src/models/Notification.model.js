import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for admin notifications
  },
  forAdmin: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reason: {
    type: String, // E.g., used for specific rejection reason string
  },
  type: {
    type: String,
    enum: ['success', 'warning', 'error', 'info'],
    default: 'info',
  },
  icon: {
    type: String,
    default: 'notifications', // Material symbols icon name
  },
  link: {
    type: String, // E.g., /loan-details/:id
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
