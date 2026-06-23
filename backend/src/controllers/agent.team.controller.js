import Agent from '../models/Agent.model.js';

/**
 * @desc    Get agent team (downline agents)
 * @route   GET /api/v1/agent/team
 * @access  Private (Agent)
 */
export const getAgentTeam = async (req, res) => {
  try {
    const { role, _id } = req.user;
    
    let teamLeaders = [];
    let fieldAgents = [];

    if (role === 'Super Agent' || role === 'Admin') {
      // Get Team Leaders under this Super Agent
      teamLeaders = await Agent.find({ role: 'Team Leader', reportingManagerId: _id })
        .select('agentId fullName mobile email role status totalRegistrations joiningDate rank salesCount commissionRate')
        .lean();
      
      const tlIds = teamLeaders.map(tl => tl._id);

      // Get Field Agents under these Team Leaders
      fieldAgents = await Agent.find({ role: 'Field Agent', reportingManagerId: { $in: tlIds } })
        .select('agentId fullName mobile email role status totalRegistrations reportingManagerId joiningDate rank salesCount commissionRate')
        .lean();

      // Attach reporting manager name to field agents for display
      fieldAgents = fieldAgents.map(fa => {
        const manager = teamLeaders.find(tl => tl._id.toString() === fa.reportingManagerId?.toString());
        return {
          ...fa,
          reportingManagerName: manager ? manager.fullName : 'Unknown'
        };
      });
      
    } else if (role === 'Team Leader') {
      // Get Field Agents under this Team Leader
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
        teamLeaders,
        fieldAgents,
      },
    });
  } catch (error) {
    console.error('Error in getAgentTeam:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
