import Agent from '../models/Agent.model.js';
import { saveOtp, verifyOtp } from '../services/otp.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/agent/auth/login
// @desc    Agent login with mobileNumber + password
// @access  Public
// Source:  AgentLoginPage.jsx — handleSubmit (line 101-143)
// ─────────────────────────────────────────────────────────────────
const agentLogin = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number and password are required' });
    }

    // Find agent with password
    const agent = await Agent.findOne({ mobileNumber }).select('+password');
    if (!agent) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    // Check password
    const isMatch = await agent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    // Status checks — AgentLoginPage line 130-137
    if (agent.status === 'Pending Approval') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Your registration is currently pending administrator approval.',
      });
    }

    if (agent.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Your application has been rejected by the administrator.',
      });
    }

    if (agent.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Your account has been blocked. Contact support.',
      });
    }

    // Generate Tokens
    const payload = { id: agent._id, role: 'agent' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    agent.refreshToken = refreshToken;
    await agent.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        agent: {
          agentId: agent.agentId,
          fullName: agent.fullName,
          mobileNumber: agent.mobileNumber,
          email: agent.email,
          role: agent.role,
          rank: agent.rank,
          status: agent.status,
          referralCode: agent.referralCode,
          salesCount: agent.salesCount,
          earnings: agent.earnings,
        },
      },
    });
  } catch (error) {
    console.error('Agent Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/agent/auth/verify-otp
// @desc    Agent login via OTP (AgentOtpPage)
// @access  Public
// ─────────────────────────────────────────────────────────────────
const agentVerifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    const result = await verifyOtp(mobileNumber, otp, 'login');
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const agent = await Agent.findOne({ mobileNumber });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    if (agent.status !== 'Approved') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Account not approved.',
      });
    }

    // Generate Tokens
    const payload = { id: agent._id, role: 'agent' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    agent.refreshToken = refreshToken;
    await agent.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'OTP verified. Login successful.',
      data: {
        accessToken,
        refreshToken,
        agent: {
          agentId: agent.agentId,
          fullName: agent.fullName,
          role: agent.role,
          rank: agent.rank,
          status: agent.status,
        },
      },
    });
  } catch (error) {
    console.error('Agent OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/agent/auth/send-otp
// @desc    Send OTP to agent mobile for OTP login
// @access  Public
// ─────────────────────────────────────────────────────────────────
const agentSendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const agent = await Agent.findOne({ mobileNumber });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'No agent account found with this mobile' });
    }

    if (agent.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Account not approved for login' });
    }

    await saveOtp(mobileNumber, 'login');

    res.status(200).json({ success: true, message: 'OTP sent to your mobile number' });
  } catch (error) {
    console.error('Agent Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/agent/auth/register
// @desc    Register a new agent
// @access  Public
// ─────────────────────────────────────────────────────────────────
const agentRegister = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      referralCodeUsed, // they send this as referralCodeUsed or referralCode
      aadhaarNumber,
      role,
    } = req.body;

    if (!fullName || !mobileNumber || !email || !password || !aadhaarNumber || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingAgent) {
      return res.status(400).json({ success: false, message: 'Agent with this mobile or email already exists' });
    }

    // Determine paths for uploaded files
    let profilePicPath = null;
    let aadhaarFrontPath = null;
    let aadhaarBackPath = null;

    if (req.files) {
      if (req.files.profilePic && req.files.profilePic[0]) profilePicPath = `/uploads/${req.files.profilePic[0].filename}`;
      if (req.files.aadhaarFront && req.files.aadhaarFront[0]) aadhaarFrontPath = `/uploads/${req.files.aadhaarFront[0].filename}`;
      if (req.files.aadhaarBack && req.files.aadhaarBack[0]) aadhaarBackPath = `/uploads/${req.files.aadhaarBack[0].filename}`;
    }

    // Role specific logic
    let suggManager = '';
    let commissionRate = 2.5;
    
    if (role === 'Agent') {
      suggManager = 'Rajesh Kumar';
      commissionRate = 1.5;
    } else if (role === 'Field Agent') {
      suggManager = 'Sanjay Dutt';
      commissionRate = 2.5;
    } else if (role === 'Super Agent') {
      suggManager = 'System Administrator';
      commissionRate = 1.0;
    }

    // Generate unique agentId
    const count = await Agent.countDocuments();
    const agentId = `MC-${8000 + count + 1}`;

    const newAgent = await Agent.create({
      agentId,
      fullName,
      mobileNumber,
      email,
      password,
      referralCodeUsed: referralCodeUsed || '',
      aadhaarNumber,
      role,
      reportingManagerName: suggManager,
      commissionRate,
      status: 'Pending Approval',
      rank: 'Bronze',
      salesCount: 0,
      earnings: 0,
      profilePhotoUrl: profilePicPath,
      aadhaarFrontUrl: aadhaarFrontPath,
      aadhaarBackUrl: aadhaarBackPath,
    });

    res.status(201).json({
      success: true,
      message: 'Agent registration submitted successfully. Pending Approval.',
      data: {
        agentId: newAgent.agentId,
      }
    });

  } catch (error) {
    console.error('Agent Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/agent/auth/forgot-password
// @desc    Send OTP to agent mobile for password reset
// @access  Public
// ─────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const agent = await Agent.findOne({ mobileNumber });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'No agent account found with this mobile number' });
    }

    await saveOtp(mobileNumber, 'agent_forgot_password');

    res.status(200).json({ success: true, message: 'OTP sent to your mobile number' });
  } catch (error) {
    console.error('Agent Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/agent/auth/reset-password
// @desc    Verify OTP + set new password
// @access  Public
// ─────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { mobileNumber, otp, newPassword, confirmPassword } = req.body;

    if (!mobileNumber || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Verify OTP
    const result = await verifyOtp(mobileNumber, otp, 'agent_forgot_password');
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Update password
    const agent = await Agent.findOne({ mobileNumber }).select('+password');
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    agent.password = newPassword;
    await agent.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Agent Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

export { agentRegister, agentLogin, agentVerifyOtp, agentSendOtp, forgotPassword, resetPassword };
