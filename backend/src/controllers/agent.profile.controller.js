import Agent from '../models/Agent.model.js';

// @route   GET /api/v1/agent/profile
// @desc    Get current agent profile
// @access  Private (Agent only)
export const getProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.status(200).json({ success: true, data: agent });
  } catch (error) {
    console.error('Get Agent Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   PATCH /api/v1/agent/profile
// @desc    Update current agent profile basic info
// @access  Private (Agent only)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, bankDetails } = req.body;

    const agent = await Agent.findById(req.user._id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    if (fullName) agent.fullName = fullName;
    if (email) agent.email = email;
    if (mobileNumber) agent.mobileNumber = mobileNumber;
    
    if (bankDetails) {
      if (!agent.bankDetails) agent.bankDetails = {};
      if (bankDetails.bankName !== undefined) agent.bankDetails.bankName = bankDetails.bankName;
      if (bankDetails.accountHolderName !== undefined) agent.bankDetails.accountHolderName = bankDetails.accountHolderName;
      if (bankDetails.accountNumber !== undefined) agent.bankDetails.accountNumber = bankDetails.accountNumber;
      if (bankDetails.ifscCode !== undefined) agent.bankDetails.ifscCode = bankDetails.ifscCode;
    }

    if (req.file) {
      agent.profilePhotoUrl = `/uploads/${req.file.filename}`;
    }

    await agent.save({ validateModifiedOnly: true });

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: agent 
    });
  } catch (error) {
    console.error('Update Agent Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/agent/profile/dashboard
// @desc    Get dashboard stats for agent
// @access  Private (Agent only)
export const getDashboardStats = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    // Role based stats
    let subordinateStats = null;
    let networkSalesAmt = agent.totalSalesRevenue || 0; // Now accurately fetched from exact dynamic plan amounts
    let networkOverride = agent.earnings || 0; // Agent's earnings naturally reflect exact commission from dynamic plans

    if (agent.role === 'Super Agent') {
      const agentsList = await Agent.find({ role: 'Agent', reportingManagerId: agent._id });
      const agentIds = agentsList.map(a => a._id);
      const fieldAgentsList = await Agent.find({ role: 'Field Agent', reportingManagerId: { $in: [...agentIds, agent._id] } });
      subordinateStats = { agents: agentsList.length, fieldAgents: fieldAgentsList.length };
    } else if (agent.role === 'Agent') {
      const fieldAgentsList = await Agent.find({ role: 'Field Agent', reportingManagerId: agent._id });
      subordinateStats = { fieldAgents: fieldAgentsList.length };
    } else if (agent.role === 'Admin') {
      const pendingAgents = await Agent.countDocuments({ status: 'Pending Approval' });
      const approvedAgents = await Agent.countDocuments({ status: 'Approved' });
      const activeAgents = await Agent.countDocuments({ role: 'Agent', status: 'Approved' });
      subordinateStats = { pendingAgents, approvedAgents, activeAgents };
    }

    res.status(200).json({
      success: true,
      data: {
        agentId: agent.agentId,
        fullName: agent.fullName,
        role: agent.role,
        status: agent.status,
        rank: agent.rank,
        commissionRate: agent.commissionRate,
        salesCount: agent.salesCount,
        totalRegistrations: agent.totalRegistrations,
        earnings: agent.earnings,
        networkSalesAmt,
        networkOverride,
        subordinateStats
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
