import User from '../models/User.model.js';
import Agent from '../models/Agent.model.js';
import Card from '../models/Card.model.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get all customers onboarded by the logged-in agent
 * @route   GET /api/v1/agent/customers
 * @access  Private (Agent)
 */
export const getAgentCustomers = async (req, res) => {
  try {
    const customers = await User.find({ agentId: req.user._id })
      .select('fullName mobile email userId status kycStatus createdAt planId profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error('Error in getAgentCustomers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Onboard a new customer by an agent
 * @route   POST /api/v1/agent/customers/onboard
 * @access  Private (Agent)
 */
export const onboardCustomer = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      dob,
      gender,
      address,
      aadhaarNumber,
    } = req.body;

    if (!fullName || !mobileNumber || !dob || !gender || !aadhaarNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile: mobileNumber });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Customer with this mobile number already exists' });
    }

    // Default password = last 6 digits of mobile number
    const defaultPassword = mobileNumber.slice(-6);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Get files if uploaded
    const profilePic = req.files?.profilePhoto ? req.files.profilePhoto[0].filename : undefined;
    
    // Create new user
    const user = new User({
      fullName,
      mobile: mobileNumber,
      email: email || undefined,
      password: hashedPassword,
      dob: dob,
      gender,
      address,
      aadhaarNumber,
      profilePhoto: profilePic,
      agentId: req.user._id, // Set the onboarding agent
      status: 'active',
      kycStatus: 'pending',
      consentGiven: true,     // Agent has taken consent
      isMobileVerified: true, // Agent has verified mobile
    });

    await user.save();

    // Increment agent's totalRegistrations
    await Agent.findByIdAndUpdate(req.user._id, {
      $inc: { totalRegistrations: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Customer onboarded successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        userId: user.userId,
      },
    });
  } catch (error) {
    console.error('Error in onboardCustomer:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all customers who used the agent's referral code
 * @route   GET /api/v1/agent/customers/referrals
 * @access  Private (Agent)
 */
export const getReferrals = async (req, res) => {
  try {
    const { referralCode, customReferralCode } = req.user;
    
    const queryCodes = [];
    if (referralCode) queryCodes.push(referralCode);
    if (customReferralCode) queryCodes.push(customReferralCode);

    if (queryCodes.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const referrals = await Card.find({ referralCodeUsed: { $in: queryCodes } })
      .populate('userId', 'fullName mobile email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    console.error('Error in getReferrals:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
