import User from '../models/User.model.js';
import Card from '../models/Card.model.js';
import Claim from '../models/Claim.model.js';
import Agent from '../models/Agent.model.js';
import Order from '../models/Order.model.js';
import Transaction from '../models/Transaction.model.js';
import FamilyMember from '../models/FamilyMember.model.js';

// Helper to generate last 6 months list for charting
const getLast6Months = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth() + 1,
    });
  }
  return months;
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/reports
// @desc    Get reports data based on tab
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminGetReports = async (req, res) => {
  try {
    const tab = req.query.tab || 'users';
    
    // Default response structure
    let responseData = {
      summary: [],
      headers: [],
      keys: [],
      rows: [],
      monthlyChart: []
    };

    // 1. Generate Monthly Chart Data (Common for all tabs)
    const monthList = getLast6Months();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate monthly users
    const userAgg = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregate monthly revenue (Orders where paymentStatus='success')
    const revAgg = await Order.aggregate([
      { $match: { paymentStatus: 'success', paidAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          total: { $sum: '$finalAmount' }
        }
      }
    ]);

    responseData.monthlyChart = monthList.map(m => {
      const userMatch = userAgg.find(u => u._id.year === m.year && u._id.month === m.monthNum);
      const revMatch = revAgg.find(r => r._id.year === m.year && r._id.month === m.monthNum);
      return {
        month: m.month,
        users: userMatch ? userMatch.count : 0,
        revenue: revMatch ? revMatch.total : 0
      };
    });

    // 2. Tab Specific Logic
    if (tab === 'users') {
      const [totalUsers, kycVerified, activeCards, blockedUsers, recentUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ kycStatus: 'verified' }),
        Card.countDocuments({ status: 'active' }),
        User.countDocuments({ status: 'blocked' }),
        User.find()
          .select('userId fullName registeredAt kycStatus status cardId')
          .populate('cardId', 'planName status')
          .sort({ createdAt: -1 })
          .limit(100)
      ]);

      responseData.summary = [
        { label: 'Total Registered', value: totalUsers },
        { label: 'KYC Verified', value: kycVerified },
        { label: 'Active Cards', value: activeCards },
        { label: 'Blocked Accounts', value: blockedUsers }
      ];
      responseData.headers = ['User ID', 'Name', 'Registered', 'Plan', 'KYC', 'Card', 'Status'];
      responseData.keys = ['id', 'name', 'date', 'plan', 'kyc', 'card', 'status'];
      responseData.rows = recentUsers.map(u => ({
        id: u.userId,
        name: u.fullName,
        date: new Date(u.registeredAt || u._id.getTimestamp()).toLocaleDateString('en-IN'),
        plan: u.cardId ? u.cardId.planName : 'No Plan',
        kyc: u.kycStatus.charAt(0).toUpperCase() + u.kycStatus.slice(1),
        card: u.cardId ? (u.cardId.status.charAt(0).toUpperCase() + u.cardId.status.slice(1)) : 'None',
        status: u.status.charAt(0).toUpperCase() + u.status.slice(1)
      }));
    } 
    
    else if (tab === 'claims') {
      const [totalClaims, approvedClaims, pendingClaims, approvedSumAgg, recentClaims] = await Promise.all([
        Claim.countDocuments(),
        Claim.countDocuments({ status: 'approved' }),
        Claim.countDocuments({ status: 'pending' }),
        Claim.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$claimAmount' } } }]),
        Claim.find()
          .select('claimId claimAmount claimType status submittedAt userId hospitalName')
          .populate('userId', 'fullName')
          .sort({ submittedAt: -1 })
          .limit(100)
      ]);

      responseData.summary = [
        { label: 'Total Claims', value: totalClaims },
        { label: 'Approved', value: approvedClaims },
        { label: 'Pending Review', value: pendingClaims },
        { label: 'Total Approved Value', value: `₹${(approvedSumAgg[0]?.total || 0).toLocaleString('en-IN')}` }
      ];
      responseData.headers = ['Claim ID', 'Claimant', 'Submitted', 'Type', 'Amount', 'Status'];
      responseData.keys = ['id', 'name', 'date', 'type', 'amount', 'status'];
      responseData.rows = recentClaims.map(c => ({
        id: c.claimId,
        name: c.userId ? c.userId.fullName : 'Unknown',
        date: new Date(c.submittedAt).toLocaleDateString('en-IN'),
        type: c.claimType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        amount: `₹${c.claimAmount.toLocaleString('en-IN')}`,
        status: c.status.charAt(0).toUpperCase() + c.status.slice(1)
      }));
    }

    else if (tab === 'agents') {
      const [totalAgents, activeAgents, pendingAgents, salesAgg, recentAgents] = await Promise.all([
        Agent.countDocuments(),
        Agent.countDocuments({ status: 'Approved' }),
        Agent.countDocuments({ status: 'Pending Approval' }),
        Agent.aggregate([{ $match: { status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$salesCount' } } }]),
        Agent.find()
          .select('agentId fullName role salesCount earnings status')
          .sort({ createdAt: -1 })
          .limit(100)
      ]);

      responseData.summary = [
        { label: 'Total Registered', value: totalAgents },
        { label: 'Active (Approved)', value: activeAgents },
        { label: 'Pending Approval', value: pendingAgents },
        { label: 'Total Sales', value: salesAgg[0]?.total || 0 }
      ];
      responseData.headers = ['Agent ID', 'Name', 'Role', 'Sales', 'Earnings', 'Status'];
      responseData.keys = ['id', 'name', 'role', 'sales', 'earnings', 'status'];
      responseData.rows = recentAgents.map(a => ({
        id: a.agentId,
        name: a.fullName,
        role: a.role,
        sales: a.salesCount || 0,
        earnings: `₹${(a.earnings || 0).toLocaleString('en-IN')}`,
        status: a.status
      }));
    }

    else if (tab === 'financial') {
      const [revenueAgg, commAgg, totalOrders, pendingSettlements, recentOrders] = await Promise.all([
        Order.aggregate([{ $match: { paymentStatus: 'success' } }, { $group: { _id: null, total: { $sum: '$finalAmount' } } }]),
        Transaction.aggregate([{ $match: { category: 'commission', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Order.countDocuments({ paymentStatus: 'success' }),
        Transaction.countDocuments({ category: 'payout_settlement', status: 'pending' }),
        Order.find({ paymentStatus: 'success' })
          .select('orderId finalAmount paymentMethod paidAt planName userId')
          .populate('userId', 'fullName')
          .sort({ paidAt: -1 })
          .limit(100)
      ]);

      responseData.summary = [
        { label: 'Total Revenue', value: `₹${(revenueAgg[0]?.total || 0).toLocaleString('en-IN')}` },
        { label: 'Agent Commissions', value: `₹${(commAgg[0]?.total || 0).toLocaleString('en-IN')}` },
        { label: 'Successful Orders', value: totalOrders },
        { label: 'Pending Settlements', value: pendingSettlements }
      ];
      responseData.headers = ['Order ID', 'User', 'Date', 'Plan', 'Amount', 'Method'];
      responseData.keys = ['id', 'name', 'date', 'type', 'amount', 'status']; // re-using keys for table mapping
      responseData.rows = recentOrders.map(o => ({
        id: o.orderId,
        name: o.userId ? o.userId.fullName : 'Unknown',
        date: new Date(o.paidAt).toLocaleDateString('en-IN'),
        type: o.planName || 'Card',
        amount: `₹${o.finalAmount.toLocaleString('en-IN')}`,
        status: o.paymentMethod ? o.paymentMethod.toUpperCase() : 'N/A'
      }));
    }

    else if (tab === 'verification') {
      const [kycVerified, kycPending, kycRejected, membersVerified, recentUsers] = await Promise.all([
        User.countDocuments({ kycStatus: 'verified' }),
        User.countDocuments({ kycStatus: 'pending' }),
        User.countDocuments({ kycStatus: 'rejected' }),
        FamilyMember.countDocuments({ verificationStatus: 'verified' }),
        User.find()
          .select('userId fullName mobile kycStatus status registeredAt cardId')
          .populate('cardId', 'status')
          .sort({ createdAt: -1 })
          .limit(100)
      ]);

      responseData.summary = [
        { label: 'KYC Verified', value: kycVerified },
        { label: 'KYC Pending', value: kycPending },
        { label: 'KYC Rejected', value: kycRejected },
        { label: 'Member Verified', value: membersVerified }
      ];
      responseData.headers = ['User ID', 'Name', 'Mobile', 'KYC Status', 'Card Status', 'Registered'];
      responseData.keys = ['id', 'name', 'mobile', 'kyc', 'card', 'date'];
      responseData.rows = recentUsers.map(u => ({
        id: u.userId,
        name: u.fullName,
        mobile: u.mobile,
        kyc: u.kycStatus.charAt(0).toUpperCase() + u.kycStatus.slice(1),
        card: u.cardId ? (u.cardId.status.charAt(0).toUpperCase() + u.cardId.status.slice(1)) : 'None',
        date: new Date(u.registeredAt || u._id.getTimestamp()).toLocaleDateString('en-IN')
      }));
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Admin Get Reports Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
