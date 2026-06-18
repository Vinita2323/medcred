import React, { useState, useEffect } from 'react';

export default function AgentAdminPage() {
  const [agents, setAgents] = useState([]);
  const [commissions, setCommissions] = useState({
    Basic: { fieldAgent: 2.0, teamLeader: 1.0, superAgent: 0.5 },
    Premium: { fieldAgent: 3.0, teamLeader: 1.5, superAgent: 0.8 },
    Elite: { fieldAgent: 4.5, teamLeader: 2.0, superAgent: 1.0 },
  });
  
  const [activeTab, setActiveTab] = useState('approvals');
  const [editingPlan, setEditingPlan] = useState(null);
  
  // Commission edit form fields
  const [editFa, setEditFa] = useState(0);
  const [editTl, setEditTl] = useState(0);
  const [editSa, setEditSa] = useState(0);

  // Approval Modal/Selector Form
  const [approvingAgent, setApprovingAgent] = useState(null);
  const [assignedRole, setAssignedRole] = useState('Field Agent');
  const [assignedManager, setAssignedManager] = useState('');

  useEffect(() => {
    // Load agents
    const agentsJson = localStorage.getItem('medcred_agents');
    if (agentsJson) {
      setAgents(JSON.parse(agentsJson));
    }

    // Load commissions
    const commsJson = localStorage.getItem('medcred_commissions');
    if (commsJson) {
      setCommissions(JSON.parse(commsJson));
    }
  }, []);

  const saveAgentsToStorage = (updatedAgents) => {
    setAgents(updatedAgents);
    localStorage.setItem('medcred_agents', JSON.stringify(updatedAgents));
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!approvingAgent) return;

    // Generate Unique Agent ID
    const randomId = `MC-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomRef = `${assignedRole.split(' ')[0].toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;

    const updated = agents.map(a => {
      if (a.mobileNumber === approvingAgent.mobileNumber) {
        return {
          ...a,
          status: 'Approved',
          role: assignedRole,
          reportingManager: assignedManager,
          agentId: randomId,
          referralCode: randomRef,
          commissionRate: assignedRole === 'Super Agent' ? 1.0 : assignedRole === 'Agent' ? 1.5 : 2.5,
          rank: 'Bronze',
          salesCount: 0,
          earnings: 0,
          joiningDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        };
      }
      return a;
    });

    saveAgentsToStorage(updated);
    setApprovingAgent(null);
    alert(`${approvingAgent.fullName} approved successfully as ${assignedRole}!`);
  };

  const handleReject = (agent) => {
    if (window.confirm(`Are you sure you want to reject ${agent.fullName}?`)) {
      const updated = agents.map(a => {
        if (a.mobileNumber === agent.mobileNumber) {
          return { ...a, status: 'Rejected' };
        }
        return a;
      });
      saveAgentsToStorage(updated);
    }
  };

  const handlePromoteAgent = (agent, newRole) => {
    const updated = agents.map(a => {
      if (a.mobileNumber === agent.mobileNumber) {
        return { 
          ...a, 
          role: newRole,
          commissionRate: newRole === 'Super Agent' ? 1.0 : newRole === 'Agent' ? 1.5 : 2.5 
        };
      }
      return a;
    });
    saveAgentsToStorage(updated);
    alert(`${agent.fullName} promoted to ${newRole}!`);
  };

  const startEditCommission = (planName) => {
    setEditingPlan(planName);
    setEditFa(commissions[planName].fieldAgent);
    setEditTl(commissions[planName].teamLeader);
    setEditSa(commissions[planName].superAgent);
  };

  const saveCommissionConfig = () => {
    const updated = {
      ...commissions,
      [editingPlan]: {
        fieldAgent: parseFloat(editFa),
        teamLeader: parseFloat(editTl),
        superAgent: parseFloat(editSa),
      }
    };
    setCommissions(updated);
    localStorage.setItem('medcred_commissions', JSON.stringify(updated));
    setEditingPlan(null);
    alert(`Commission rates updated for ${editingPlan} plan!`);
  };

  // Get list of potential managers (Super Agents for Agents, Agents for Field Agents)
  const getPotentialManagers = (role) => {
    if (role === 'Agent') {
      return agents.filter(a => a.role === 'Super Agent' && a.status === 'Approved');
    }
    if (role === 'Field Agent') {
      return agents.filter(a => a.role === 'Agent' && a.status === 'Approved');
    }
    return [];
  };

  const pendingApprovals = agents.filter(a => a.status === 'Pending Approval');
  const activeAgents = agents.filter(a => a.status === 'Approved');

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-modal {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 61, 155, 0.15);
        }
      ` }} />

      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="relative z-10 space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#ffdbcf] font-bold">Admin Console</span>
          <h2 className="text-xl md:text-2xl font-bold">Control Center</h2>
          <p className="text-xs opacity-90">Manage network hierarchy, approve agent onboarding, and dynamically adjust commission rates.</p>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-[#c3c6d6]/30 pb-2">
        {[
          { id: 'approvals', label: `Pending Approvals (${pendingApprovals.length})`, icon: 'how_to_reg' },
          { id: 'commissions', label: 'Commission Engine', icon: 'account_balance_wallet' },
          { id: 'agents', label: 'All Active Agents', icon: 'badge' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'bg-[#003d9b] text-white shadow-sm' 
                : 'bg-white text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f3f3fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approvals tab */}
      {activeTab === 'approvals' && (
        <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#c3c6d6]/20">
            <h3 className="font-bold text-[#191b23] text-base">Registration Approval Queue</h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Aadhaar</th>
                  <th className="px-6 py-4">Referral Entered</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/10">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((agent, idx) => (
                    <tr key={idx} className="hover:bg-[#faf8ff]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#191b23]">{agent.fullName}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold">{agent.mobileNumber}</div>
                        <div className="text-[#737685] mt-0.5">{agent.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{agent.aadhaarNumber || '—'}</td>
                      <td className="px-6 py-4 text-xs font-bold text-[#003d9b]">
                        {agent.referralCodeUsed ? (
                          <span className="bg-[#dae2ff] px-2.5 py-0.5 rounded-full">{agent.referralCodeUsed}</span>
                        ) : (
                          <span className="text-[#737685] font-normal">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setApprovingAgent(agent);
                              // Auto-determine suggested role
                              if (agent.referralCodeUsed === 'SUPER90') {
                                setAssignedRole('Agent');
                              } else if (agent.referralCodeUsed === 'LEADER80') {
                                setAssignedRole('Field Agent');
                              } else {
                                setAssignedRole('Field Agent');
                              }
                            }}
                            className="bg-[#003d9b] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0052cc] active:scale-95 transition-all cursor-pointer"
                          >
                            Assign &amp; Approve
                          </button>
                          <button
                            onClick={() => handleReject(agent)}
                            className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-[#516161]">
                      <span className="material-symbols-outlined text-4xl mb-2 text-green-600">done_all</span>
                      <p className="text-sm">Queue is empty! All registrations are reviewed.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Commission Engine tab */}
      {activeTab === 'commissions' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(commissions).map((planName) => (
            <div key={planName} className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-center border-b border-[#faf8ff] pb-3">
                <h3 className="font-extrabold text-[#003d9b] text-lg">{planName} Subscription</h3>
                <span className="material-symbols-outlined text-[#737685]">settings_suggest</span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#516161]">Field Agent Rate</span>
                  <span className="font-bold text-[#191b23]">{commissions[planName].fieldAgent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#516161]">Agent Override</span>
                  <span className="font-bold text-[#191b23]">{commissions[planName].teamLeader}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#516161]">Super Agent Override</span>
                  <span className="font-bold text-[#191b23]">{commissions[planName].superAgent}%</span>
                </div>
              </div>

              <button
                onClick={() => startEditCommission(planName)}
                className="w-full mt-2 bg-[#f3f3fd] hover:bg-[#dae2ff] text-[#003d9b] py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Modify Rates
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Active Agents list tab */}
      {activeTab === 'agents' && (
        <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#c3c6d6]/20">
            <h3 className="font-bold text-[#191b23] text-base">Active Roster Hierarchy</h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Reporting Manager</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4 text-center">Manage Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/10">
                {activeAgents.map((agent, idx) => (
                  <tr key={idx} className="hover:bg-[#faf8ff]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#191b23]">{agent.fullName}</div>
                      <div className="text-[10px] text-[#737685] font-mono mt-0.5">{agent.agentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#dae2ff] text-[#003d9b] px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#516161]">
                      {agent.reportingManager || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-xs text-[#0c56d0]">{agent.referralCode}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-1 justify-center">
                        {agent.role === 'Field Agent' && (
                          <button
                            onClick={() => handlePromoteAgent(agent, 'Agent')}
                            className="bg-[#f3f3fd] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Promote to TL
                          </button>
                        )}
                        {agent.role === 'Agent' && (
                          <button
                            onClick={() => handlePromoteAgent(agent, 'Super Agent')}
                            className="bg-[#f3f3fd] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Promote to SA
                          </button>
                        )}
                        {agent.role === 'Super Agent' && (
                          <span className="text-[10px] text-[#737685] font-semibold">Highest Rank</span>
                        )}
                        {agent.role === 'Admin' && (
                          <span className="text-[10px] text-[#737685] font-semibold">Primary Control</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Edit Commission Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="admin-modal w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 animate-fade-in">
            <h3 className="font-extrabold text-[#003d9b] text-lg border-b border-[#c3c6d6]/20 pb-3">
              Configure {editingPlan} Rates
            </h3>

            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Field Agent Commission (%)</label>
                <input 
                  type="number" 
                  value={editFa} 
                  onChange={(e) => setEditFa(e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Agent Override (%)</label>
                <input 
                  type="number" 
                  value={editTl} 
                  onChange={(e) => setEditTl(e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Super Agent Override (%)</label>
                <input 
                  type="number" 
                  value={editSa} 
                  onChange={(e) => setEditSa(e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                onClick={() => setEditingPlan(null)}
                className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveCommissionConfig}
                className="bg-[#003d9b] text-white font-bold text-xs hover:bg-[#0052cc] px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approvingAgent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleApproveSubmit} className="admin-modal w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-in">
            <h3 className="font-extrabold text-[#003d9b] text-lg border-b border-[#c3c6d6]/20 pb-3">
              Assign Role: {approvingAgent.fullName}
            </h3>

            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Designation Assignment</label>
                <select 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none"
                  value={assignedRole}
                  onChange={(e) => {
                    setAssignedRole(e.target.value);
                    setAssignedManager('');
                  }}
                >
                  <option value="Super Agent">Super Agent</option>
                  <option value="Agent">Agent</option>
                  <option value="Field Agent">Field Agent</option>
                </select>
              </div>

              {assignedRole !== 'Super Agent' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Reporting Manager</label>
                  <select 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none"
                    value={assignedManager}
                    onChange={(e) => setAssignedManager(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Reporting Manager</option>
                    {getPotentialManagers(assignedRole).map(m => (
                      <option key={m.agentId} value={m.fullName}>{m.fullName} ({m.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => setApprovingAgent(null)}
                className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#003d9b] text-white font-bold text-xs hover:bg-[#0052cc] px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Approve Registration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
