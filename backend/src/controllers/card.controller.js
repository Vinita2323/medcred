import Card from '../models/Card.model.js';

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/cards/my-card
// @desc    Get the current logged-in user's active digital card
// @access  Private (User only)
// ─────────────────────────────────────────────────────────────────
export const getMyCard = async (req, res) => {
  try {
    const card = await Card.findOne({ userId: req.user._id, status: 'active' }).populate('planId', 'name coverageAmount maxMembers hospitalClaimLimit');
    
    if (!card) {
      return res.status(404).json({ success: false, message: 'No active card found for this user.' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    console.error('Get My Card Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching card details.' });
  }
};
