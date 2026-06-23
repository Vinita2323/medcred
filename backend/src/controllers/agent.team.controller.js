import Agent from '../models/Agent.model.js';

/**
 * @desc    Get agent team (downline agents)
 * @route   GET /api/v1/agent/team
 * @access  Private (Agent)
 */
export const getAgentTeam = async (req, res) => {
  try {
    const { role, _id } = req.user;
    
    let agents = [];
    let fieldAgents = [];

    if (role === 'Super Agent' || role === 'Admin') {
      // Get Agents under this Super Agent
      agents = await Agent.find({ role: 'Agent', reportingManagerId: _id })
        .select('agentId fullName mobile email role status totalRegistrations joiningDate rank salesCount commissionRate')
        .lean();
      
      const agentIds = agents.map(tl => tl._id);

      // Get Field Agents under these Agents
      fieldAgents = await Agent.find({ role: 'Field Agent', reportingManagerId: { $in: agentIds } })
        .select('agentId fullName mobile email role status totalRegistrations reportingManagerId joiningDate rank salesCount commissionRate')
        .lean();

      // Attach reporting manager name to field agents for display
      fieldAgents = fieldAgents.map(fa => {
        const manager = agents.find(tl => tl._id.toString() === fa.reportingManagerId?.toString());
        return {
          ...fa,
          reportingManagerName: manager ? manager.fullName : 'Unknown'
        };
      });
      
    } else if (role === 'Agent') {
      // Get Field Agents under this Agent
      fieldAgents = await Agent.find({ role: 'Field Agent', reportingManagerId: _id })
        .select('agentId fullName mobile email role status totalRegistrations joiningDate rank salesCount commissionRate')
        .lean();
        
      fieldAgents = fieldAgents.map(fa => ({
        ...fa,
        reportingManagerName: req.user.fullName
      }));
      
    } else {
      // Field Agent - no downline
      fieldAgents = [];
    }

    res.status(200).json({
      success: true,
      data: {
        agents,
        fieldAgents,
      },
    });
  } catch (error) {
    console.error('Error in getAgentTeam:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
