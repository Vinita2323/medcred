import User from '../models/User.model.js';
import Claim from '../models/Claim.model.js';
import FamilyMember from '../models/FamilyMember.model.js';
import Wallet from '../models/Wallet.model.js';
import Card from '../models/Card.model.js';

// @route   GET /api/v1/user/profile
// @desc    Get current user profile
// @access  Private (User only)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   PATCH /api/v1/user/profile
// @desc    Update current user profile
// @access  Private (User only)
export const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, dob, gender, address, health, bloodGroup, occupation, income } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
    }

    if (name) user.fullName = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (address) user.address = address;

    // Direct profile fields that UI might send
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (occupation !== undefined) user.occupation = occupation;
    if (income !== undefined) user.annualIncome = income;

    // Handle health object explicitly if provided
    if (health) {
      let parsedHealth = health;
      if (typeof health === 'string') {
        try {
          parsedHealth = JSON.parse(health);
        } catch (e) {
          console.error("Failed to parse health string", e);
        }
      }
      user.health = { ...user.health, ...parsedHealth };
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: user 
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/user/profile/dashboard/stats
// @desc    Get user dashboard summary stats
// @access  Private (User only)
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch counts and data concurrently
    const [claimsCount, familyCount, wallet, activeCard] = await Promise.all([
      Claim.countDocuments({ userId }),
      FamilyMember.countDocuments({ primaryUserId: userId }),
      Wallet.findOne({ ownerId: userId, ownerType: 'User' }),
      Card.findOne({ userId, status: 'active' })
    ]);

    // Calculate loan status
    let loanStatus = 'Not Eligible';
    if (activeCard) {
      loanStatus = activeCard.isLoanEligible ? 'Eligible' : 'Waiting';
    }

    res.status(200).json({
      success: true,
      data: {
        claimsCount,
        familyCount,
        walletBalance: wallet ? wallet.availableBalance : 0,
        loanStatus
      }
    });
  } catch (error) {
    console.error('Get User Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
