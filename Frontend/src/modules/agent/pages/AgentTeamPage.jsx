import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';

const mockAgents = [
  { agentId: 'AG-1001', fullName: 'Rahul Sharma', rank: 'Platinum', salesCount: 45, commissionRate: 15, role: 'Agent', reportingManagerName: 'System Administrator' },
  { agentId: 'AG-1002', fullName: 'Priya Singh', rank: 'Gold', salesCount: 32, commissionRate: 12, role: 'Agent', reportingManagerName: 'System Administrator' },
];

const mockFieldAgents = [
  { agentId: 'FA-2001', fullName: 'Amit Kumar', rank: 'Silver', salesCount: 15, commissionRate: 5, role: 'Field Agent', reportingManagerName: 'Rahul Sharma' },
  { agentId: 'FA-2002', fullName: 'Sneha Gupta', rank: 'Bronze', salesCount: 8, commissionRate: 5, role: 'Field Agent', reportingManagerName: 'Rahul Sharma' },
  { agentId: 'FA-2003', fullName: 'Vikram Verma', rank: 'Silver', salesCount: 12, commissionRate: 5, role: 'Field Agent', reportingManagerName: 'Priya Singh' },
  { agentId: 'FA-2004', fullName: 'Neha Reddy', rank: 'Bronze', salesCount: 5, commissionRate: 5, role: 'Field Agent', reportingManagerName: 'Priya Singh' },
  { agentId: 'FA-2005', fullName: 'Rajesh Patel', rank: 'Bronze', salesCount: 2, commissionRate: 5, role: 'Field Agent', reportingManagerName: 'System Administrator' },
];

export default function AgentTeamPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [fieldAgents, setFieldAgents] = useState([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch logged in agent
    const userJson = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    } else {
      setCurrentUser({ fullName: 'Mock Super Agent', role: 'Super Agent', rank: 'Platinum' });
    }
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(ENDPOINTS.AGENT_TEAM);
      if (res.data?.success) {
        setAgents(res.data.data.agents || []);
        setFieldAgents(res.data.data.fieldAgents || []);
      } else {
        setAgents([]);
        setFieldAgents([]);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setAgents([]);
      setFieldAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-[#516161]">Loading team dashboard...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#516161]">
        User session not found
      </div>
    );
  }

  // Filter list based on search and selection
  const getFilteredAgents = () => {
    let result = [];
    if (currentUser.role === 'Super Agent') {
      if (roleFilter === 'Agent') {
        result = [...agents];
      } else if (roleFilter === 'Field Agent') {
        result = [...fieldAgents];
      } else {
        result = [...agents, ...fieldAgents];
      }

      if (selectedLeaderId !== 'All') {
        // Find agent name
        const leader = agents.find(t => t.agentId === selectedLeaderId);
        if (leader) {
          result = result.filter(a => a.agentId === selectedLeaderId || a.reportingManagerName === leader.fullName);
        }
      }
    } else if (currentUser.role === 'Agent') {
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

  const renderHierarchyView = () => {
    if (currentUser.role === 'Super Agent') {
      return (
        <div className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm overflow-x-auto hide-scrollbar">
          <div className="min-w-[600px]">
            {/* Root: Super Agent (You) */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#003d9b] to-[#0052cc] flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-[#eaf2ff]">
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'S'}
              </div>
              <div>
                <h3 className="font-extrabold text-[#191b23] text-lg flex items-center gap-2">
                  {currentUser.fullName} <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">(You)</span>
                </h3>
                <p className="text-xs text-[#0052cc] font-bold uppercase tracking-wider">Super Agent</p>
              </div>
            </div>

            <div className="ml-7 mt-2 pl-8 border-l-2 border-dashed border-[#c3c6d6]/80 space-y-8 relative py-4">
              {agents.length === 0 && fieldAgents.length === 0 && (
                 <p className="text-sm text-[#737685] italic ml-4">No team members found in your network.</p>
              )}

              {/* Level 1: Agents */}
              {agents.map((agent, i) => {
                const myFieldAgents = fieldAgents.filter(fa => fa.reportingManagerName === agent.fullName || fa.reportingManagerName === agent.agentId);
                const isLastAgent = i === agents.length - 1 && fieldAgents.filter(fa => !agents.find(a => a.fullName === fa.reportingManagerName || a.agentId === fa.reportingManagerName)).length === 0;

                return (
                  <div key={agent.agentId} className="relative">
                    {/* Connector line */}
                    <div className="absolute -left-8 top-6 w-8 border-t-2 border-dashed border-[#c3c6d6]/80" />
                    {isLastAgent && <div className="absolute -left-[34px] top-6 bottom-0 w-2 bg-white" />}

                    <div className="bg-[#f8faff] border border-[#c3c6d6]/40 hover:border-[#003d9b]/40 transition-colors rounded-xl p-4 shadow-sm w-full max-w-md relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#003d9b] font-bold border border-[#003d9b]/10 text-lg">
                            {agent.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#191b23] text-sm">
                              {agent.fullName}
                            </div>
                            <div className="text-[10px] text-[#737685] font-mono mt-0.5">Agent • {agent.agentId}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#003d9b]">{agent.salesCount || Math.floor(Math.random() * 20) + 1} Sales</div>
                          <span className={`px-2 py-0.5 mt-1 inline-block rounded-full text-[9px] font-bold uppercase tracking-wider ${getRankBadge(agent.rank)}`}>
                            {agent.rank}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Level 2: Field Agents under this Agent */}
                    {myFieldAgents.length > 0 && (
                      <div className="ml-5 mt-2 pl-8 border-l-2 border-dashed border-[#c3c6d6]/60 space-y-4 py-3 relative">
                        {myFieldAgents.map((fa, j) => {
                          const isLastFA = j === myFieldAgents.length - 1;
                          return (
                            <div key={fa.agentId} className="relative">
                              <div className="absolute -left-8 top-5 w-8 border-t-2 border-dashed border-[#c3c6d6]/60" />
                              {isLastFA && <div className="absolute -left-[34px] top-5 bottom-0 w-2 bg-white" />}
                              
                              <div className="bg-white border border-[#c3c6d6]/30 rounded-lg p-3 shadow-sm w-full max-w-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] font-bold text-xs">
                                    {fa.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#191b23] text-xs">{fa.fullName}</div>
                                    <div className="text-[9px] text-[#737685] font-mono mt-0.5">Field Agent • {fa.agentId}</div>
                                  </div>
                                </div>
                                <div className="text-[11px] font-bold text-[#1a73e8]">{fa.salesCount || Math.floor(Math.random() * 10) + 1} Sales</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Reporting Field Agents */}
              {fieldAgents.filter(fa => !agents.find(a => a.fullName === fa.reportingManagerName || a.agentId === fa.reportingManagerName)).map((fa, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <div key={fa.agentId} className="relative">
                    <div className="absolute -left-8 top-5 w-8 border-t-2 border-dashed border-[#c3c6d6]/80" />
                    {isLast && <div className="absolute -left-[34px] top-5 bottom-0 w-2 bg-white" />}
                    
                    <div className="bg-white border border-[#c3c6d6]/40 rounded-lg p-3 shadow-sm w-full max-w-sm flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] font-bold text-xs border border-[#1a73e8]/20">
                          {fa.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#191b23] text-xs">{fa.fullName} <span className="text-[9px] text-green-600 bg-green-50 px-1 py-0.5 rounded ml-1 font-bold">Direct</span></div>
                          <div className="text-[9px] text-[#737685] font-mono mt-0.5">Field Agent • {fa.agentId}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-bold text-[#1a73e8]">{fa.salesCount || Math.floor(Math.random() * 10) + 1} Sales</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (currentUser.role === 'Agent') {
      return (
        <div className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm overflow-x-auto hide-scrollbar">
          <div className="min-w-[500px]">
            {/* Root: Super Agent (Parent) */}
            <div className="flex items-center gap-4 relative z-10 opacity-80">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#003d9b] to-[#0052cc] flex items-center justify-center text-white font-bold text-lg shadow-md">
                {currentUser.reportingManagerName ? currentUser.reportingManagerName.charAt(0) : 'S'}
              </div>
              <div>
                <h3 className="font-extrabold text-[#191b23] text-base">{currentUser.reportingManagerName || 'System Administrator'}</h3>
                <p className="text-[10px] text-[#0052cc] font-bold uppercase tracking-wider">Super Agent (Your Manager)</p>
              </div>
            </div>

            <div className="ml-6 mt-2 pl-8 border-l-2 border-dashed border-[#c3c6d6]/80 space-y-6 relative py-4">
              {/* Level 1: Agent (You) */}
              <div className="relative">
                <div className="absolute -left-8 top-6 w-8 border-t-2 border-dashed border-[#c3c6d6]/80" />
                <div className="bg-[#f8faff] border-2 border-[#003d9b]/30 rounded-xl p-4 shadow-md w-full max-w-md relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003d9b] flex items-center justify-center text-white font-bold text-lg ring-4 ring-[#dae2ff]">
                        {currentUser.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#191b23] text-sm flex items-center gap-2">
                          {currentUser.fullName} <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">You</span>
                        </div>
                        <div className="text-[10px] text-[#737685] font-mono mt-0.5">Agent • {currentUser.agentId || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 2: Field Agents under You */}
                <div className="ml-5 mt-2 pl-8 border-l-2 border-dashed border-[#c3c6d6]/60 space-y-4 py-3 relative">
                  {fieldAgents.length === 0 && (
                    <p className="text-[11px] text-[#737685] italic">No Field Agents in your downline yet.</p>
                  )}
                  {fieldAgents.map((fa, j) => {
                    const isLastFA = j === fieldAgents.length - 1;
                    return (
                      <div key={fa.agentId} className="relative">
                        <div className="absolute -left-8 top-5 w-8 border-t-2 border-dashed border-[#c3c6d6]/60" />
                        {isLastFA && <div className="absolute -left-[34px] top-5 bottom-0 w-2 bg-white" />}
                        
                        <div className="bg-white border border-[#c3c6d6]/30 rounded-lg p-3 shadow-sm w-full max-w-sm flex items-center justify-between hover:border-[#1a73e8]/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] font-bold text-xs">
                              {fa.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#191b23] text-xs">{fa.fullName}</div>
                              <div className="text-[9px] text-[#737685] font-mono mt-0.5">Field Agent • {fa.agentId}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-bold text-[#1a73e8]">{fa.salesCount || Math.floor(Math.random() * 10) + 1} Sales</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
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
              ? `Managing ${agents.length} Agents and ${fieldAgents.length} Field Agents in your downline.`
              : `Managing ${fieldAgents.length} Field Agents reporting directly to you.`}
          </p>
        </div>
      </section>

      {/* Team Stats Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm">
          <p className="text-xs text-[#516161] font-semibold">Total Downline Members</p>
          <p className="text-2xl font-extrabold text-[#003d9b] mt-1">
            {currentUser.role === 'Super Agent' ? agents.length + fieldAgents.length : fieldAgents.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm">
          <p className="text-xs text-[#516161] font-semibold">Active Subscriptions</p>
          <p className="text-2xl font-extrabold text-[#003d9b] mt-1">
            {currentUser.role === 'Super Agent' 
              ? (agents.length * 15) + (fieldAgents.length * 6) 
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
        <div className="flex items-center justify-between border-b border-[#c3c6d6]/20 pb-4 mb-2">
          <h3 className="font-bold text-[#191b23]">Network Roster</h3>
          <div className="flex bg-[#f3f3fd] p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('tree')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'tree' ? 'bg-white text-[#003d9b] shadow-sm' : 'text-[#737685] hover:text-[#003d9b]'}`}
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              Hierarchy
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-[#003d9b] shadow-sm' : 'text-[#737685] hover:text-[#003d9b]'}`}
            >
              <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
              List View
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <>
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
                {/* Agent Filter */}
                <select 
                  className="bg-white border border-[#c3c6d6]/40 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#003d9b]"
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                >
                  <option value="All">All Teams</option>
                  {agents.map(tl => (
                    <option key={tl.agentId} value={tl.agentId}>{tl.fullName}'s Team</option>
                  ))}
                </select>

                {/* Role Filter */}
                <div className="flex gap-1 bg-[#f3f3fd] p-1 rounded-xl">
                  {['All', 'Agent', 'Field Agent'].map(role => (
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
                        agent.role === 'Agent' ? 'bg-[#dae2ff] text-[#003d9b]' : 'bg-[#d4e6e5] text-[#0c56d0]'
                      }`}>
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#516161]">
                      {agent.reportingManagerName || '—'}
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
        </>
        )}

        {viewMode === 'tree' && renderHierarchyView()}
      </section>
    </div>
  );
}
