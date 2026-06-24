import Agent from '../models/Agent.model.js';

// ── Helper: Generate unique agentId ───────────────────────────────
const generateAgentId = async () => {
  let agentId;
  let isUnique = false;
  while (!isUnique) {
    const num = Math.floor(10000 + Math.random() * 90000);
    agentId = `MC-${num}`;
    const existing = await Agent.findOne({ agentId });
    if (!existing) isUnique = true;
  }
  return agentId;
};

// ── Helper: Generate referral code from role ──────────────────────
const generateReferralCode = async (role) => {
  const prefix =
    role === 'Super Agent' ? 'SA' :
    role === 'Agent' ? 'TL' : 'FIELD';
  let code;
  let isUnique = false;
  while (!isUnique) {
    const num = Math.floor(10 + Math.random() * 90);
    code = `${prefix}${num}`;
    const existing = await Agent.findOne({ referralCode: code });
    if (!existing) isUnique = true;
  }
  return code;
};

// ── Helper: Commission rate by role ──────────────────────────────
const getCommissionRate = (role) => {
  if (role === 'Super Agent') return 1.0;
  if (role === 'Agent') return 1.5;
  return 2.5; // Field Agent
};

// ── Helper: Initial rank by role ───────────────────────────────
const getInitialRank = (role) => {
  if (role === 'Super Agent') return 'Platinum';
  if (role === 'Agent') return 'Gold';
  return 'Bronze'; // Field Agent
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/agents
// @desc    Get all agents, optionally filtered by status
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────
export const getAllAgents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const agents = await Agent.find(filter)
      .select('-password -refreshToken -__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    console.error('Get All Agents Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/agents/:id
// @desc    Get a single agent by ID
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────
export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password -refreshToken');
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }
    res.status(200).json({ success: true, data: agent });
  } catch (error) {
    console.error('Get Agent By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/agents/:id/approve
// @desc    Approve a pending agent, assign role & generate agentId/referralCode
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────
export const approveAgent = async (req, res) => {
  try {
    const { role, reportingManagerId, reportingManagerName } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required to approve an agent.' });
    }

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    if (agent.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Agent is already approved.' });
    }

    // Auto-generate unique agentId and referralCode
    const agentId = await generateAgentId();
    const referralCode = await generateReferralCode(role);

    agent.status = 'Approved';
    agent.role = role;
    agent.agentId = agentId;
    agent.referralCode = referralCode;
    agent.commissionRate = getCommissionRate(role);
    agent.joiningDate = new Date();
    agent.approvedBy = req.user._id;
    agent.approvedAt = new Date();
    agent.rank = getInitialRank(role);
    agent.salesCount = 0;
    agent.earnings = 0;

    if (reportingManagerId) {
      agent.reportingManagerId = reportingManagerId;
    }
    if (reportingManagerName) {
      agent.reportingManagerName = reportingManagerName;
    }

    await agent.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${agent.fullName} has been approved as ${role}!`,
      data: {
        agentId: agent.agentId,
        referralCode: agent.referralCode,
        role: agent.role,
        status: agent.status,
      },
    });
  } catch (error) {
    console.error('Approve Agent Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/agents/:id/status
// @desc    Update agent status (Reject / Block / Unblock)
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────
export const updateAgentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Rejected', 'Blocked', 'Approved'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    agent.status = status;
    await agent.save({ validateModifiedOnly: true });

    const msgs = {
      Rejected: `${agent.fullName}'s registration has been rejected.`,
      Blocked: `${agent.fullName} has been blocked.`,
      Approved: `${agent.fullName} has been unblocked.`,
    };

    res.status(200).json({ success: true, message: msgs[status], data: { status: agent.status } });
  } catch (error) {
    console.error('Update Agent Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/agents/:id/promote
// @desc    Promote an approved agent to a higher role
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────
export const promoteAgent = async (req, res) => {
  try {
    const { newRole, reportingManagerId, reportingManagerName } = req.body;
    const validRoles = ['Field Agent', 'Agent', 'Super Agent'];

    if (!newRole || !validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Valid newRole is required.' });
    }

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    if (agent.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Only approved agents can be promoted.' });
    }

    agent.role = newRole;
    agent.commissionRate = getCommissionRate(newRole);
    agent.rank = getInitialRank(newRole);
    if (reportingManagerId) agent.reportingManagerId = reportingManagerId;
    if (reportingManagerName) agent.reportingManagerName = reportingManagerName;

    await agent.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${agent.fullName} has been promoted to ${newRole}.`,
      data: { role: agent.role, commissionRate: agent.commissionRate },
    });
  } catch (error) {
    console.error('Promote Agent Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
