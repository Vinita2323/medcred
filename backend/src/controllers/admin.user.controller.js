import User from '../models/User.model.js';
import Card from '../models/Card.model.js';
import KYC from '../models/KYC.model.js';
import Claim from '../models/Claim.model.js';
import Agent from '../models/Agent.model.js';
import Order from '../models/Order.model.js';
import FamilyMember from '../models/FamilyMember.model.js';

export const adminGetAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('kycRef')
      .sort({ createdAt: -1 });
    
    // We also need card info for the users. 
    // It's better to fetch active cards for these users.
    const userIds = users.map(u => u._id);
    const cards = await Card.find({ userId: { $in: userIds } }).populate('planId');

    const mappedUsers = users.map(u => {
      const card = cards.find(c => c.userId.toString() === u._id.toString());
      return {
        id: u.userId || u._id,
        dbId: u._id,
        name: u.fullName,
        mobile: u.mobile,
        email: u.email,
        kyc: u.kycStatus === 'verified' ? 'Verified' : u.kycStatus === 'pending' ? 'Pending' : u.kycStatus === 'rejected' ? 'Rejected' : 'Pending', // Fallback to pending if not submitted for UI mapping
        kycRef: u.kycRef,
        cardStatus: card ? (card.status.charAt(0).toUpperCase() + card.status.slice(1)) : 'Pending',
        plan: card && card.planId ? card.planId.name : 'N/A',
        status: u.status.charAt(0).toUpperCase() + u.status.slice(1),
        bypassLoanWaitingPeriod: u.bypassLoanWaitingPeriod || false,
        registeredAt: new Date(u.createdAt).toLocaleDateString(),
      };
    });

    res.status(200).json({
      success: true,
      data: mappedUsers,
    });
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/users/dashboard/stats
// @desc    Get real-time admin dashboard statistics
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminDashboardStats = async (req, res) => {
  try {
    // Run all DB queries in parallel for performance
    const [
      totalUsers,
      activeCards,
      pendingClaims,
      activeAgents,
      revenueResult,
      pendingKYC,
      claimsByStatus,
      topAgents,
      recentUsers,
      recentClaims,
      pendingAgents,
    ] = await Promise.all([
      // 1. Total registered users
      User.countDocuments(),

      // 2. Active cards issued
      Card.countDocuments({ status: 'active' }),

      // 3. Claims pending action
      Claim.countDocuments({ status: 'pending' }),

      // 4. Approved agents
      Agent.countDocuments({ status: 'Approved' }),

      // 5. Total revenue = sum of all successful order payments (real-world: money actually received)
      Order.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),

      // 6. Users awaiting KYC verification
      User.countDocuments({ kycStatus: 'pending' }),

      // 7. Claims grouped by status for breakdown chart
      Claim.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // 8. Top 4 agents by sales
      Agent.find({ status: 'Approved' })
        .select('fullName role salesCount totalRegistrations rank commissionRate')
        .sort({ salesCount: -1 })
        .limit(4),

      // 9. Recent 3 user registrations (for activity feed)
      User.find().select('fullName createdAt').sort({ createdAt: -1 }).limit(3),

      // 10. Recent 2 claims submitted (for activity feed)
      Claim.find().select('claimId userName claimedAmount claimType createdAt').sort({ createdAt: -1 }).limit(2),

      // 11. Pending agent approvals count (for activity feed)
      Agent.countDocuments({ status: 'Pending Approval' }),
    ]);

    // Format revenue
    const totalRevenue = revenueResult[0]?.total || 0;

    // Format claims breakdown
    const statusMap = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    const claimBreakdown = Object.entries(statusMap).map(([key, label]) => ({
      label,
      count: claimsByStatus.find(c => c._id === key)?.count || 0,
    }));

    // Build activity feed from real DB events
    const activityFeed = [
      ...recentUsers.map(u => ({
        icon: 'person_add',
        bg: 'bg-[#dae2ff]',
        text: 'text-[#003d9b]',
        title: 'New User Registered',
        desc: `${u.fullName} completed registration.`,
        time: getRelativeTime(u.createdAt),
      })),
      ...recentClaims.map(c => ({
        icon: 'description',
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        title: 'Claim Submitted',
        desc: `${c.userName} submitted a ₹${(c.claimedAmount || 0).toLocaleString('en-IN')} ${c.claimType} claim.`,
        time: getRelativeTime(c.createdAt),
      })),
      pendingAgents > 0 ? {
        icon: 'badge',
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        title: 'Agent Pending Approval',
        desc: `${pendingAgents} field agent(s) awaiting admin approval.`,
        time: 'Pending',
      } : null,
    ].filter(Boolean).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeCards,
        pendingClaims,
        activeAgents,
        totalRevenue,
        pendingKYC,
        claimBreakdown,
        topAgents,
        activityFeed,
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: convert date to relative time string
const getRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/users/:id/status
// @desc    Block or Unblock a user
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminUpdateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: 'blocked' or 'active'

    if (!['blocked', 'active'].includes(status?.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updatedStatus = status.toLowerCase();
    
    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { status: updatedStatus },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Handle Card status automatically
    if (updatedStatus === 'blocked') {
      // Suspend active card if blocked
      await Card.findOneAndUpdate(
        { userId: id, status: 'active' },
        { status: 'suspended' }
      );
    } else if (updatedStatus === 'active') {
      // Re-activate suspended card if unblocked
      await Card.findOneAndUpdate(
        { userId: id, status: 'suspended' },
        { status: 'active' }
      );
    }

    res.status(200).json({
      success: true,
      message: `User successfully ${updatedStatus}`,
      data: user,
    });
  } catch (error) {
    console.error('Admin Update User Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/users/:id/activate-card
// @desc    Manually activate a user's pending card
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminActivateCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findOneAndUpdate(
      { userId: id, status: { $ne: 'active' } },
      { status: 'active' },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found or already active' });
    }

    res.status(200).json({
      success: true,
      message: 'Card activated successfully',
      data: card,
    });
  } catch (error) {
    console.error('Admin Activate Card Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/users/:id/details
// @desc    Get user's family members and claims for the drawer
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminGetUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [user, familyMembers, claims, kycDoc] = await Promise.all([
      User.findById(id),
      FamilyMember.find({ userId: id }).sort({ createdAt: -1 }),
      Claim.find({ userId: id }).sort({ createdAt: -1 }),
      KYC.findOne({ userId: id }),
    ]);

    // Fallback to User object for KYC images if KYC document is missing or incomplete
    const kycImages = kycDoc ? {
      selfie: kycDoc.selfieUrl || user?.profilePhoto,
      aadhaarFront: kycDoc.aadhaarFrontUrl || user?.aadhaarFrontUrl,
      aadhaarBack: kycDoc.aadhaarBackUrl || user?.aadhaarBackUrl,
    } : {
      selfie: user?.profilePhoto,
      aadhaarFront: user?.aadhaarFrontUrl,
      aadhaarBack: user?.aadhaarBackUrl,
    };

    // Format for UI
    const formattedFamily = familyMembers.map(m => ({
      memberName: m.fullName,
      relation: m.relation,
      aadhaarStatus: m.aadhaarStatus === 'verified' ? 'Verified' : m.aadhaarStatus === 'pending' ? 'Pending' : m.aadhaarStatus === 'rejected' ? 'Rejected' : 'Pending',
    }));

    const formattedClaims = claims.map(c => ({
      id: c.claimId,
      type: c.claimType,
      amount: c.claimedAmount,
      status: c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' '),
      submittedAt: new Date(c.createdAt).toLocaleDateString(),
    }));

    res.status(200).json({
      success: true,
      data: {
        familyMembers: formattedFamily,
        claims: formattedClaims,
        kycImages,
      },
    });
  } catch (error) {
    console.error('Admin Get User Details Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/users/:id/verify-kyc
// @desc    Directly verify user's KYC (useful for agent-onboarded users without a KYC doc)
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminVerifyUserKYC = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.kycStatus = 'verified';
    user.aadhaarVerifiedAt = new Date();
    await user.save();

    // If there is an associated KYC document, verify it too
    if (user.kycRef) {
      await KYC.findByIdAndUpdate(user.kycRef, {
        status: 'verified',
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'User KYC verified successfully',
    });
  } catch (error) {
    console.error('Admin Verify User KYC Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/users/:id/toggle-loan-bypass
// @desc    Toggle urgent loan access (bypasses 30-day waiting period)
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminToggleLoanBypass = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.bypassLoanWaitingPeriod = !user.bypassLoanWaitingPeriod;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Urgent loan access ${user.bypassLoanWaitingPeriod ? 'enabled' : 'disabled'} successfully`,
      data: {
        bypassLoanWaitingPeriod: user.bypassLoanWaitingPeriod
      }
    });
  } catch (error) {
    console.error('Admin Toggle Loan Bypass Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
