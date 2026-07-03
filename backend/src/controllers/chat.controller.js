import ChatMessage from '../models/ChatMessage.model.js';
import User from '../models/User.model.js';

// @route   POST /api/v1/support/chat/send
// @desc    Send a message (User to Admin)
// @access  Private (User)
export const userSendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const chatMsg = await ChatMessage.create({
      senderId: req.user._id,
      senderModel: 'User',
      userId: req.user._id,
      message: message.trim(),
      isAdminMessage: false,
    });

    res.status(201).json({
      success: true,
      data: chatMsg,
    });
  } catch (error) {
    console.error('User Send Message Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/support/chat/history
// @desc    Get chat history (User perspective)
// @access  Private (User)
export const userGetChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('User Get Chat History Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   POST /api/v1/admin/support/chat/send
// @desc    Send a message (Admin to User)
// @access  Private (Admin)
export const adminSendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'User ID and Message are required' });
    }

    const chatMsg = await ChatMessage.create({
      senderId: req.user._id, // This is the admin's user ID in the session
      senderModel: 'Admin',
      userId,
      message: message.trim(),
      isAdminMessage: true,
    });

    res.status(201).json({
      success: true,
      data: chatMsg,
    });
  } catch (error) {
    console.error('Admin Send Message Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/admin/support/chat/history/:userId
// @desc    Get chat history for a specific user (Admin perspective)
// @access  Private (Admin)
export const adminGetChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Admin Get Chat History Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/admin/support/chat/users
// @desc    Get list of users with chat history (Admin perspective)
// @access  Private (Admin)
export const adminGetChatUsers = async (req, res) => {
  try {
    // Aggregate to get unique users who have chat messages
    const chatUsers = await ChatMessage.aggregate([
      {
        $group: {
          _id: '$userId',
          lastMessage: { $last: '$message' },
          lastMessageAt: { $last: '$createdAt' },
        },
      },
      {
        $sort: { lastMessageAt: -1 },
      },
    ]);

    // Populate user info manually or via lookup
    const populatedUsers = await Promise.all(
      chatUsers.map(async (item) => {
        const userInfo = await User.findById(item._id).select('fullName email profilePhoto mobile');
        if (!userInfo) return null;
        return {
          user: userInfo,
          lastMessage: item.lastMessage,
          lastMessageAt: item.lastMessageAt,
        };
      })
    );

    // Filter nulls (in case a user was deleted)
    const activeChats = populatedUsers.filter(Boolean);

    res.status(200).json({
      success: true,
      data: activeChats,
    });
  } catch (error) {
    console.error('Admin Get Chat Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
