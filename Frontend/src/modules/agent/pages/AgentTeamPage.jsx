import React, { useState, useEffect } from 'react';

export default function AgentTeamPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [fieldAgents, setFieldAgents] = useState([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    // Fetch logged in agent
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const userObj = JSON.parse(userJson);
      setCurrentUser(userObj);

      // Fetch all agents
      const agentsJson = localStorage.getItem('medcred_agents');
      if (agentsJson) {
        const allAgents = JSON.parse(agentsJson);
        
        if (userObj.role === 'Super Agent') {
          // Team Leaders reporting to this Super Agent
          const tls = allAgents.filter(a => a.role === 'Team Leader' && a.reportingManager === userObj.fullName);
          setTeamLeaders(tls);
          
          // Field Agents reporting to those Team Leaders
          const tlNames = tls.map(t => t.fullName);
          const fas = allAgents.filter(a => a.role === 'Field Agent' && tlNames.includes(a.reportingManager));
          setFieldAgents(fas);
        } else if (userObj.role === 'Team Leader') {
          // Field Agents reporting directly to this Team Leader
          const fas = allAgents.filter(a => a.role === 'Field Agent' && a.reportingManager === userObj.fullName);
          setFieldAgents(fas);
        }
      }
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#516161]">
        Loading team dashboard...
      </div>
    );
  }

  // Filter list based on search and selection
  const getFilteredAgents = () => {
    let result = [];
    if (currentUser.role === 'Super Agent') {
      if (roleFilter === 'Team Leader') {
        result = [...teamLeaders];
      } else if (roleFilter === 'Field Agent') {
        result = [...fieldAgents];
      } else {
        result = [...teamLeaders, ...fieldAgents];
      }

      if (selectedLeaderId !== 'All') {
        // Find team leader name
        const leader = teamLeaders.find(t => t.agentId === selectedLeaderId);
        if (leader) {
          result = result.filter(a => a.agentId === selectedLeaderId || a.reportingManager === leader.fullName);
        }
      }
    } else if (currentUser.role === 'Team Leader') {
      result = [...fieldAgents];
    }

    return result.filter(a => 
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredList = getFilteredAgents();

  // Helper to render rank badge styling
  const getRankBadge = (rank) => {
    switch (rank) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200'; // Bronze
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Page Header banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="relative z-10 space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#ffdbcf] font-bold">Network Tree</span>
          <h2 className="text-xl md:text-2xl font-bold">Team Performance &amp; Network</h2>
          <p className="text-xs opacity-90 max-w-xl">
            {currentUser.role === 'Super Agent' 
              ? `Managing ${teamLeaders.length} Team Leaders and ${fieldAgents.length} Field Agents in your downline.` 
              : `Managing ${fieldAgents.length} Field Agents reporting directly to you.`}
          </p>
        </div>
      </section>

      {/* Team Stats Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm">
          <p className="text-xs text-[#516161] font-semibold">Total Downline Members</p>
          <p className="text-2xl font-extrabold text-[#003d9b] mt-1">
            {currentUser.role === 'Super Agent' ? teamLeaders.length + fieldAgents.length : fieldAgents.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm">
          <p className="text-xs text-[#516161] font-semibold">Active Subscriptions</p>
          <p className="text-2xl font-extrabold text-[#003d9b] mt-1">
            {currentUser.role === 'Super Agent' 
              ? (teamLeaders.length * 15) + (fieldAgents.length * 6) 
              : fieldAgents.length * 8}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm">
          <p className="text-xs text-[#516161] font-semibold">Total Network Sales</p>
          <p className="text-2xl font-extrabold text-[#003d9b] mt-1">
            ₹{currentUser.role === 'Super Agent' ? '8.4L' : '2.1L'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm">
          <p className="text-xs text-[#516161] font-semibold">Overriding Commission</p>
          <p className="text-2xl font-extrabold text-green-700 mt-1">
            ₹{currentUser.role === 'Super Agent' ? '25,800' : '8,400'}
          </p>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full md:w-72">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737685] group-focus-within:text-[#003d9b]">search</span>
            <input 
              className="w-full pl-12 pr-4 py-2.5 bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl focus:ring-2 focus:ring-[#003d9b] outline-none text-sm" 
              placeholder="Search by name or Agent ID..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {currentUser.role === 'Super Agent' && (
              <>
                {/* Team Leader Filter */}
                <select 
                  className="bg-white border border-[#c3c6d6]/40 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#003d9b]"
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                >
                  <option value="All">All Teams</option>
                  {teamLeaders.map(tl => (
                    <option key={tl.agentId} value={tl.agentId}>{tl.fullName}'s Team</option>
                  ))}
                </select>

                {/* Role Filter */}
                <div className="flex gap-1 bg-[#f3f3fd] p-1 rounded-xl">
                  {['All', 'Team Leader', 'Field Agent'].map(role => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        roleFilter === role ? 'bg-white text-[#003d9b] shadow-sm' : 'text-[#516161] hover:text-[#003d9b]'
                      }`}
                    >
                      {role === 'All' ? 'All Roles' : role}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-6 py-4">Agent Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Reporting Manager</th>
                <th className="px-6 py-4">Rank Badge</th>
                <th className="px-6 py-4">Onboarded Clients</th>
                <th className="px-6 py-4 text-right">Commission Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filteredList.length > 0 ? (
                filteredList.map((agent, idx) => (
                  <tr key={idx} className="hover:bg-[#faf8ff]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#003d9b]/10 bg-[#dae2ff] flex items-center justify-center text-[#003d9b] font-bold">
                          {agent.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#191b23]">{agent.fullName}</div>
                          <div className="text-[10px] text-[#737685] font-mono mt-0.5">{agent.agentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        agent.role === 'Team Leader' ? 'bg-[#dae2ff] text-[#003d9b]' : 'bg-[#d4e6e5] text-[#0c56d0]'
                      }`}>
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#516161]">
                      {agent.reportingManager || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRankBadge(agent.rank)}`}>
                        {agent.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-center sm:text-left text-[#191b23]">
                      {agent.salesCount || Math.floor(Math.random() * 20) + 1}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#003d9b]">
                      {agent.commissionRate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-[#516161]">
                    <span className="material-symbols-outlined text-4xl mb-2 text-[#737685]">group_off</span>
                    <p className="text-sm">No team members match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
