import Agent from '../models/Agent.model.js';
import Admin from '../models/Admin.model.js';
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
    const { mobileNumber, password, token, platform } = req.body;

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
    if (token) {
      agent.fcmToken = token;
    }
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
    const { mobileNumber, otp, token, platform } = req.body;

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
    if (token) {
      agent.fcmToken = token;
    }
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
      referralCodeUsed, // this will be the managerJoinCode
      aadhaarNumber,
      role,
      workingState,
      workingDistricts,
      workingDistrict,
      workingCity,
      permanentAddress,
      currentAddress,
      panNumber,
      bankDetails
    } = req.body;

    if (!fullName || !mobileNumber || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!req.files || !req.files.profilePic || !req.files.aadhaarFront || !req.files.aadhaarBack) {
      return res.status(400).json({ success: false, message: 'Please upload all required identity documents (Profile Photo, Aadhaar Front, Aadhaar Back)' });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingAgent) {
      return res.status(400).json({ success: false, message: 'Agent with this mobile or email already exists' });
    }

    // Parse stringified JSON payloads if they are sent as strings
    let parsedWorkingDistricts = [];
    if (workingDistricts) {
      try {
        parsedWorkingDistricts = typeof workingDistricts === 'string' ? JSON.parse(workingDistricts) : workingDistricts;
      } catch (e) {
        parsedWorkingDistricts = [workingDistricts];
      }
    }

    let parsedPermanentAddress = {};
    if (permanentAddress) {
      try {
        parsedPermanentAddress = typeof permanentAddress === 'string' ? JSON.parse(permanentAddress) : permanentAddress;
      } catch (e) {
        parsedPermanentAddress = {};
      }
    }

    let parsedCurrentAddress = {};
    if (currentAddress) {
      try {
        parsedCurrentAddress = typeof currentAddress === 'string' ? JSON.parse(currentAddress) : currentAddress;
      } catch (e) {
        parsedCurrentAddress = {};
      }
    }

    let parsedBankDetails = {};
    if (bankDetails) {
      try {
        parsedBankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;
      } catch (e) {
        parsedBankDetails = {};
      }
    }

    // Determine paths for uploaded files
    let profilePicPath = null;
    let aadhaarFrontPath = null;
    let aadhaarBackPath = null;
    let panCardPath = null;
    let chequePassbookPath = null;

    if (req.files) {
      if (req.files.profilePic && req.files.profilePic[0]) profilePicPath = `/uploads/${req.files.profilePic[0].filename}`;
      if (req.files.aadhaarFront && req.files.aadhaarFront[0]) aadhaarFrontPath = `/uploads/${req.files.aadhaarFront[0].filename}`;
      if (req.files.aadhaarBack && req.files.aadhaarBack[0]) aadhaarBackPath = `/uploads/${req.files.aadhaarBack[0].filename}`;
      if (req.files.panCard && req.files.panCard[0]) panCardPath = `/uploads/${req.files.panCard[0].filename}`;
      if (req.files.chequePassbook && req.files.chequePassbook[0]) chequePassbookPath = `/uploads/${req.files.chequePassbook[0].filename}`;
    }

    // Verify Manager Join Code and territory logic
    let suggManagerId = null;
    let suggManagerName = '';
    let commissionRate = 2.5;

    if (role === 'Agent') {
      commissionRate = 1.5;
    } else if (role === 'Field Agent') {
      commissionRate = 2.5;
    } else if (role === 'Super Agent') {
      commissionRate = 1.0;
    }

    if (referralCodeUsed) {
      // Look up in Admin collection
      const admin = await Admin.findOne({ $or: [{ adminId: referralCodeUsed }, { joinCode: referralCodeUsed }] });
      if (admin) {
        if (role !== 'Super Agent') {
          return res.status(400).json({ success: false, message: 'Admin join codes can only be used by Super Agents.' });
        }
        suggManagerId = admin._id;
        suggManagerName = admin.fullName;
      } else {
        // Look up in Agent collection
        const manager = await Agent.findOne({
          $or: [{ joinCode: referralCodeUsed }, { referralCode: referralCodeUsed }],
          status: 'Approved'
        });

        if (!manager) {
          return res.status(400).json({ success: false, message: 'Invalid or inactive manager join code.' });
        }

        if (role === 'Agent') {
          if (manager.role !== 'Super Agent') {
            return res.status(400).json({ success: false, message: 'Agents can only register under a Super Agent.' });
          }
          if (workingState !== manager.workingState) {
            return res.status(400).json({ success: false, message: 'Working state must match manager\'s assigned state.' });
          }
        } else if (role === 'Field Agent') {
          if (manager.role !== 'Agent') {
            return res.status(400).json({ success: false, message: 'Field Agents can only register under an Agent.' });
          }
          if (workingState !== manager.workingState) {
            return res.status(400).json({ success: false, message: 'Working state must match manager\'s assigned state.' });
          }
          if (!manager.workingDistricts.includes(workingDistrict)) {
            return res.status(400).json({ success: false, message: 'Working district must match one of manager\'s assigned districts.' });
          }
        } else if (role === 'Super Agent') {
          return res.status(400).json({ success: false, message: 'Super Agents can only register under Admin.' });
        }

        suggManagerId = manager._id;
        suggManagerName = manager.fullName;
      }
    }

    // Generate unique agentId
    let agentId;
    let isUnique = false;
    while (!isUnique) {
      const num = Math.floor(10000 + Math.random() * 90000);
      agentId = `MC-${num}`;
      const existing = await Agent.findOne({ agentId });
      if (!existing) isUnique = true;
    }

    const newAgent = await Agent.create({
      agentId,
      fullName,
      mobileNumber,
      email,
      password,
      referralCodeUsed: referralCodeUsed || '',
      managerJoinCode: referralCodeUsed || '',
      aadhaarNumber,
      role,
      workingState,
      workingDistricts: parsedWorkingDistricts,
      workingDistrict,
      workingCity,
      permanentAddress: parsedPermanentAddress,
      currentAddress: parsedCurrentAddress,
      panNumber,
      panCardUrl: panCardPath,
      chequePassbookUrl: chequePassbookPath,
      bankDetails: parsedBankDetails,
      reportingManagerId: suggManagerId,
      reportingManagerName: suggManagerName,
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

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/agent/auth/validate-join-code/:code
// @desc    Validate manager join code and return details
// @access  Public
// ─────────────────────────────────────────────────────────────────
const validateJoinCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Join code is required.' });
    }

    // 1. Search Admin collection
    const admin = await Admin.findOne({ $or: [{ adminId: code }, { joinCode: code }] });
    if (admin) {
      return res.status(200).json({
        success: true,
        type: 'admin',
        managerName: admin.fullName,
        managerId: admin._id
      });
    }

    // 2. Search Agent collection (must be Approved)
    const agent = await Agent.findOne({
      $or: [{ joinCode: code }, { referralCode: code }],
      status: 'Approved'
    });

    if (agent) {
      if (agent.role === 'Super Agent') {
        return res.status(200).json({
          success: true,
          type: 'super_agent',
          managerName: agent.fullName,
          managerId: agent._id,
          state: agent.workingState
        });
      } else if (agent.role === 'Agent') {
        return res.status(200).json({
          success: true,
          type: 'agent',
          managerName: agent.fullName,
          managerId: agent._id,
          state: agent.workingState,
          districts: agent.workingDistricts
        });
      } else {
        return res.status(400).json({ success: false, message: 'This join code belongs to a Field Agent and cannot be used as a manager code.' });
      }
    }

    return res.status(404).json({ success: false, message: 'Invalid or inactive manager join code.' });
  } catch (error) {
    console.error('Validate Join Code Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

export { agentRegister, agentLogin, agentVerifyOtp, agentSendOtp, forgotPassword, resetPassword, validateJoinCode };
