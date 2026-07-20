import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const TABS = ['All Agents', 'Super Agents', 'Agents', 'Field Agents', 'Pending Requests', 'Hierarchy'];

const ROLE_COLORS = {
  'Super Agent': 'bg-purple-100 text-purple-700',
  'Agent': 'bg-blue-100 text-blue-700',
  'Field Agent': 'bg-[#dae2ff] text-[#003d9b]',
  'Admin': 'bg-yellow-100 text-yellow-700',
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [activeTab, setTab] = useState('All Agents');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoad] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [approvingAgent, setApproving] = useState(null);
  const [assignedRole, setRole] = useState('Field Agent');
  const [assignedManager, setManager] = useState('');
  const [customCode, setCustomCode] = useState('');
  
  const [promotingAgent, setPromoting] = useState(null);
  const [promoteRole, setPromoteRole] = useState('Agent');
  const [promoteManager, setPromoteManager] = useState('');

  const [detailsAgent, setDetailsAgent] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, filterDistrict, filterCity]);

  // Commission Engine State
  const [commissions, setCommissions] = useState({});
  const [editingPlan, setEditingPlan] = useState(null);
  const [editFa, setEditFa] = useState(0);
  const [editTl, setEditTl] = useState(0);
  const [editSa, setEditSa] = useState(0);

  // ── Fetch all agents ───────────────────────────────────────────
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(ENDPOINTS.ADMIN_AGENTS);
      if (res.data.success) {
        setAgents(res.data.data);
      }
    } catch (err) {
      setError('Failed to load agents. Please refresh.');
      console.error('Fetch agents error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.PLANS);
      if (res.data?.success) {
        const comms = {};
        res.data.data.forEach(p => {
          comms[p.name] = {
            id: p.planId,
            fieldAgent: p.fieldAgentCommissionPct || 12,
            agent: p.agentCommissionPct || 4,
            superAgent: p.superAgentCommissionPct || 3,
          };
        });
        setCommissions(comms);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchPlans();
  }, [fetchAgents, fetchPlans]);

  // Auto-clear success message
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Prevent background scrolling when a modal is open
  useEffect(() => {
    if (approvingAgent || detailsAgent || editingPlan) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [approvingAgent, detailsAgent, editingPlan]);

  // ── Derived lists ─────────────────────────────────────────────
  const pending = agents.filter(a => a.status === 'Pending Approval');
  const active = agents.filter(a => a.status === 'Approved');
  const rejected = agents.filter(a => a.status === 'Rejected');
  
  const superAgents = active.filter(a => a.role === 'Super Agent');
  const midAgents = active.filter(a => a.role === 'Agent');
  const fieldAgents = active.filter(a => a.role === 'Field Agent');

  const listByTab = (tab) => {
    let arr = [];
    if (tab === 'All Agents') arr = agents;
    else if (tab === 'Super Agents') arr = superAgents;
    else if (tab === 'Agents') arr = midAgents;
    else if (tab === 'Field Agents') arr = fieldAgents;
    else if (tab === 'Pending Requests') arr = pending;
    
    // Apply filters
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(a =>
        a.fullName?.toLowerCase().includes(q) ||
        a.mobileNumber?.includes(search) ||
        a.email?.toLowerCase().includes(q) ||
        a.referralCode?.toLowerCase().includes(q)
      );
    }
    if (filterDistrict) {
      arr = arr.filter(a => a.district?.toLowerCase().includes(filterDistrict.toLowerCase()));
    }
    if (filterCity) {
      arr = arr.filter(a => a.city?.toLowerCase().includes(filterCity.toLowerCase()));
    }
    return arr;
  };

  const getPotentialManagers = (role) => {
    if (role === 'Field Agent') return [...superAgents, ...midAgents];
    if (role === 'Agent') return superAgents;
    return [];
  };

  // ── Hierarchy Helpers ──────────────────────────────────────────
  const buildHierarchy = () => {
    // Top level
    return superAgents.map(sa => {
      const children = midAgents.filter(ma => ma.reportingManagerId === sa._id);
      const saTotalFieldAgents = children.reduce((acc, ma) => {
        return acc + fieldAgents.filter(fa => fa.reportingManagerId === ma._id).length;
      }, 0);
      
      return {
        ...sa,
        totalAgents: children.length,
        totalFieldAgents: saTotalFieldAgents,
        children: children.map(ma => {
          const grandChildren = fieldAgents.filter(fa => fa.reportingManagerId === ma._id);
          return {
            ...ma,
            totalFieldAgents: grandChildren.length,
            children: grandChildren
          };
        })
      };
    });
  };

  // ── Actions ───────────────────────────────────────────────────
  const startEditCommission = (planName) => {
    setEditingPlan(planName);
    setEditFa(commissions[planName].fieldAgent);
    setEditTl(commissions[planName].agent);
    setEditSa(commissions[planName].superAgent);
  };

  const saveCommissionConfig = async () => {
    const fa = parseFloat(editFa);
    const tl = parseFloat(editTl);
    const sa = parseFloat(editSa);

    if (isNaN(fa) || fa < 0 || fa > 100 || isNaN(tl) || tl < 0 || tl > 100 || isNaN(sa) || sa < 0 || sa > 100) {
      setError('Commission percentages must be exactly between 0 and 100.');
      return;
    }

    try {
      const planId = commissions[editingPlan].id;
      const plansUpdate = {
        [planId]: {
          fieldAgentCommissionPct: parseFloat(editFa),
          agentCommissionPct: parseFloat(editTl),
          superAgentCommissionPct: parseFloat(editSa),
        }
      };
      const res = await api.patch(ENDPOINTS.ADMIN_PLANS_UPDATE, { plans: plansUpdate });
      if (res.data?.success) {
        setSuccessMsg(`Commission rates updated for ${editingPlan} plan!`);
        fetchPlans();
        setEditingPlan(null);
      }
    } catch (error) {
      setError('Failed to update commission rates');
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!assignedRole) return;
    const managers = getPotentialManagers(assignedRole);
    if (assignedRole !== 'Super Agent' && managers.length > 0 && !assignedManager) {
      setError('Please select a reporting manager.');
      return;
    }

    try {
      setActionLoad(true);
      setError('');
      const selectedManager = active.find(a => a._id === assignedManager);
      const payload = {
        role: assignedRole,
        reportingManagerId: assignedManager || null,
        reportingManagerName: selectedManager?.fullName || null,
        customReferralCode: customCode,
      };
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_APPROVE(approvingAgent._id), payload);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setApproving(null);
        setRole('Field Agent');
        setManager('');
        setCustomCode('');
        await fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve agent.');
    } finally {
      setActionLoad(false);
    }
  };

  const handleReject = async (agent) => {
    if (!window.confirm(`Are you sure you want to reject ${agent.fullName}?`)) return;
    try {
      setActionLoad(true);
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_STATUS(agent._id), { status: 'Rejected' });
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject agent.');
    } finally {
      setActionLoad(false);
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!promotingAgent) return;
    try {
      setActionLoad(true);
      setError('');
      
      const payload = { newRole: promoteRole };
      if (promoteManager) {
        // active array doesn't exist here, use agents
        const mgr = agents.find(a => a._id === promoteManager);
        if (mgr) {
          payload.reportingManagerId = mgr._id;
          payload.reportingManagerName = mgr.fullName;
        }
      }

      const res = await api.patch(`/admin/agents/${promotingAgent._id}/promote`, payload);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Agent promoted successfully!');
        setPromoting(null);
        setDetailsAgent(null);
        fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote agent');
    } finally {
      setActionLoad(false);
    }
  };

  const blockToggle = async (agent) => {
    const newStatus = agent.status === 'Blocked' ? 'Approved' : 'Blocked';
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      setActionLoad(true);
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_STATUS(agent._id), { status: newStatus });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchAgents();
      }
    } catch (err) {
      setError('Action failed.');
    } finally {
      setActionLoad(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Agent Network</span>
          <h2 className="text-xl font-extrabold mt-1">Agent Hierarchy & Management</h2>
          <p className="text-sm text-white/80 mt-1">Manage a 3-level agent hierarchy system across districts, assign parent agents, and approve registrations.</p>
        </div>
      </section>

      {/* Success / Error Toast */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Super Agents', value: superAgents.length, color: 'text-purple-700', bg: 'bg-purple-100', icon: 'stars' },
          { label: 'Agents', value: midAgents.length, color: 'text-blue-700', bg: 'bg-blue-100', icon: 'group' },
          { label: 'Field Agents', value: fieldAgents.length, color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', icon: 'person_pin' },
          { label: 'Pending Approval', value: pending.length, color: 'text-yellow-700', bg: 'bg-yellow-100', icon: 'how_to_reg' },
          { label: 'Approved', value: active.length, color: 'text-green-700', bg: 'bg-green-100', icon: 'verified' },
          { label: 'Rejected', value: rejected.length, color: 'text-red-700', bg: 'bg-red-100', icon: 'cancel' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
              </div>
              <p className="text-xl font-extrabold text-[#191b23]">{loading ? '—' : s.value}</p>
            </div>
            <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Commission Configuration Engine */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-[#191b23] text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003d9b]">settings_suggest</span>
          Commission Configuration Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(commissions).map((planName) => (
            <div key={planName} className="border border-[#c3c6d6]/30 p-5 rounded-xl space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-extrabold text-[#003d9b] text-base capitalize">{planName}</h4>
              <div className="space-y-2 text-sm mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#516161] text-xs">Field Agent</span>
                  <span className="font-extrabold text-[#191b23]">{commissions[planName].fieldAgent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#516161] text-xs">Agent</span>
                  <span className="font-extrabold text-[#191b23]">{commissions[planName].agent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#516161] text-xs">Super Agent</span>
                  <span className="font-extrabold text-[#191b23]">{commissions[planName].superAgent}%</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEditCommission(planName)}
                className="w-full mt-4 bg-[#f3f3fd] hover:bg-[#dae2ff] text-[#003d9b] py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                Modify Rates
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab ? 'bg-[#003d9b] text-white shadow-sm' : 'bg-[#f5f8ff] text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f0f4ff]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab !== 'Hierarchy' && (
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search by Name, Email, or Referral Code…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
              />
            </div>
            <input
              type="text"
              placeholder="District"
              value={filterDistrict}
              onChange={e => setFilterDistrict(e.target.value)}
              className="w-40 px-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
            />
            <input
              type="text"
              placeholder="City"
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-40 px-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'Hierarchy' ? (
          <div className="p-6">
            <h3 className="font-extrabold text-[#191b23] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003d9b]">account_tree</span>
              Agent Hierarchy Visualization
            </h3>
            {loading ? (
              <div className="text-sm text-[#516161]">Loading hierarchy...</div>
            ) : buildHierarchy().length === 0 ? (
              <div className="text-sm text-[#516161]">No hierarchy structure found. Add a Super Agent to begin.</div>
            ) : (
              <div className="space-y-6">
                {buildHierarchy().map(sa => (
                  <details key={sa._id} className="group bg-[#f5f8ff] border border-[#c3c6d6]/30 rounded-xl overflow-hidden" open>
                    <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#ebf0fe] transition-colors select-none">
                      <span className="material-symbols-outlined transition-transform group-open:rotate-90 text-[#003d9b]">chevron_right</span>
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">SA</div>
                      <div>
                        <p className="font-bold text-[#191b23]">{sa.fullName}</p>
                        <p className="text-xs text-[#516161]">{sa.district || 'Unassigned District'}</p>
                      </div>
                      <div className="ml-auto flex gap-3 text-xs font-semibold text-[#516161]">
                        <span><span className="text-blue-700">{sa.totalAgents}</span> Agents</span>
                        <span><span className="text-[#003d9b]">{sa.totalFieldAgents}</span> Field Agents</span>
                      </div>
                    </summary>
                    <div className="px-6 pb-6 pt-2 bg-white">
                      {sa.children.length === 0 ? (
                        <p className="text-xs text-[#737685] italic pl-8">No Agents under this Super Agent.</p>
                      ) : (
                        <div className="space-y-4 pl-4 border-l-2 border-purple-100 ml-4">
                          {sa.children.map(ma => (
                            <details key={ma._id} className="group/agent" open>
                              <summary className="flex items-center gap-3 py-2 cursor-pointer hover:text-[#003d9b] transition-colors select-none">
                                <span className="material-symbols-outlined transition-transform group-open/agent:rotate-90 text-[#737685] text-sm">chevron_right</span>
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">AG</div>
                                <div>
                                  <p className="font-bold text-[#191b23] text-sm">{ma.fullName}</p>
                                  <p className="text-[10px] text-[#516161]">{ma.city || 'Unassigned City'} • {ma.totalFieldAgents} Field Agents</p>
                                </div>
                              </summary>
                              <div className="pl-6 pt-2">
                                {ma.children.length === 0 ? (
                                  <p className="text-[10px] text-[#737685] italic pl-6">No Field Agents under this Agent.</p>
                                ) : (
                                  <div className="space-y-2 pl-4 border-l-2 border-blue-100 ml-2">
                                    {ma.children.map(fa => (
                                      <div key={fa._id} className="flex items-center gap-2 py-1 pl-2 hover:bg-[#faf8ff] rounded-md transition-colors">
                                        <div className="w-5 h-5 rounded-full bg-[#dae2ff] text-[#003d9b] font-bold text-[9px] flex items-center justify-center shrink-0">FA</div>
                                        <div>
                                          <p className="font-semibold text-[#191b23] text-xs">{fa.fullName}</p>
                                          <p className="text-[9px] text-[#516161]">{fa.area || 'Unassigned Area'}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[#516161] text-sm gap-2">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Loading...
              </div>
            ) : (
              <>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                    <th className="px-5 py-3">Agent Details</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Referral Code</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Role Type</th>
                    {activeTab !== 'Super Agents' && <th className="px-5 py-3">Parent Agent</th>}
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d6]/10">
                  {listByTab(activeTab).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(agent => (
                    <tr key={agent._id} className="hover:bg-[#faf8ff]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${ROLE_COLORS[agent.role] || 'bg-gray-100 text-gray-700'}`}>
                            {agent.fullName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-bold text-[#191b23]">{agent.fullName}</p>
                            <p className="text-[10px] text-[#737685] font-mono">{agent.mobileNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {agent.district || agent.city || agent.area ? (
                          <>
                            <p className="font-semibold text-[#191b23]">{agent.district || '—'}</p>
                            <p className="text-[#737685]">{agent.city || '—'} {agent.area ? `(${agent.area})` : ''}</p>
                          </>
                        ) : (
                          <span className="text-[#737685] italic">Not Provided</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0052cc]">
                        {agent.status === 'Approved' ? (agent.referralCode || '—') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                          agent.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          agent.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
                          agent.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          agent.role === 'Super Agent' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          agent.role === 'Agent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-[#f5f8ff] text-[#003d9b] border-[#dae2ff]'
                        }`}>
                          {agent.role}
                        </span>
                      </td>
                      {activeTab !== 'Super Agents' && (
                        <td className="px-5 py-3.5 text-xs">
                          {agent.reportingManagerName ? (
                            <span className="bg-[#f0f4ff] text-[#003d9b] px-2 py-1 rounded-md font-semibold">{agent.reportingManagerName}</span>
                          ) : (
                            <span className="text-[#737685]">None</span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 justify-center flex-wrap">
                          <button onClick={() => setDetailsAgent(agent)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">View</button>
                          
                          {activeTab === 'Pending Requests' && (
                            <>
                              <button
                                onClick={() => { setApproving(agent); setRole(agent.role || 'Field Agent'); setManager(agent.reportingManagerId || ''); }}
                                disabled={actionLoading}
                                className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(agent)}
                                disabled={actionLoading}
                                className="border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {activeTab !== 'Pending Requests' && agent.status !== 'Rejected' && (
                            <button onClick={() => blockToggle(agent)} disabled={actionLoading} className="border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">
                              {agent.status === 'Blocked' ? 'Unblock' : 'Block'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {listByTab(activeTab).length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#516161] text-sm">
                        <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">badge</span>
                        No agents found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-between items-center px-5 py-4 border-t border-[#c3c6d6]/20 bg-white">
                <span className="text-xs text-[#737685]">
                  Showing {listByTab(activeTab).length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, listByTab(activeTab).length)} of {listByTab(activeTab).length} Entries
                </span>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-[#c3c6d6] text-xs font-bold disabled:opacity-50 text-[#516161]">Prev</button>
                  <button disabled={currentPage >= Math.ceil(listByTab(activeTab).length / itemsPerPage) || Math.ceil(listByTab(activeTab).length / itemsPerPage) === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-[#c3c6d6] text-xs font-bold disabled:opacity-50 text-[#516161]">Next</button>
                </div>
              </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Approve Modal ──────────────────────────────────────── */}
      {approvingAgent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setApproving(null)}>
          <form
            onSubmit={handleApprove}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <div>
                <h3 className="font-extrabold text-[#003d9b]">Approve Agent Registration</h3>
                <p className="text-xs text-[#516161] mt-0.5">{approvingAgent.fullName}</p>
              </div>
              <button type="button" onClick={() => setApproving(null)} className="material-symbols-outlined text-[#737685] cursor-pointer text-xl">close</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Designation</label>
              <select
                value={assignedRole}
                onChange={e => { setRole(e.target.value); setManager(''); }}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none cursor-pointer"
              >
                <option value="Super Agent">Super Agent (Manages District)</option>
                <option value="Agent">Agent (Manages City)</option>
                <option value="Field Agent">Field Agent (Manages Area)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Custom Referral Code (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank to auto-generate"
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none"
              />
            </div>

            {assignedRole !== 'Super Agent' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Assign Parent</label>
                <select
                  value={assignedManager}
                  onChange={e => setManager(e.target.value)}
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">Select Reporting Manager...</option>
                  {getPotentialManagers(assignedRole).map(m => (
                    <option key={m._id} value={m._id}>{m.fullName} ({m.district || m.city || 'No Location'})</option>
                  ))}
                </select>
                {getPotentialManagers(assignedRole).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No suitable managers found. Please create one first.</p>
                )}
              </div>
            )}

            <div className="bg-[#f0f4ff] rounded-xl p-3 text-xs text-[#434654] space-y-1">
              <p className="font-bold text-[#003d9b]">Auto-generated on approval:</p>
              <p>🪪 Agent ID: <span className="font-mono font-bold">MC-XXXXX</span></p>
              <p>🔗 Referral Code Prefix: <span className="font-mono font-bold">{assignedRole === 'Super Agent' ? 'SA' : assignedRole === 'Agent' ? 'AG' : 'FA'}XX</span></p>
              <p>💰 Default Commission: <span className="font-bold">{assignedRole === 'Super Agent' ? '3%' : assignedRole === 'Agent' ? '4%' : '12%'}</span></p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproving(null)}
                className="flex-1 border border-[#c3c6d6]/40 text-[#434654] py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#f5f8ff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || (assignedRole !== 'Super Agent' && !assignedManager)}
                className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-70 flex items-center justify-center gap-1"
              >
                {actionLoading ? 'Approving...' : 'Approve Registration'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ── Details Modal ──────────────────────────────────────── */}
      {detailsAgent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setDetailsAgent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-[#c3c6d6]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center shrink-0 ${ROLE_COLORS[detailsAgent.role] || 'bg-gray-100 text-gray-700'}`}>
                  {detailsAgent.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#191b23] text-lg">{detailsAgent.fullName}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ROLE_COLORS[detailsAgent.role] || 'bg-gray-100 text-gray-700'}`}>
                    {detailsAgent.role}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetailsAgent(null)} className="material-symbols-outlined text-[#737685] cursor-pointer hover:text-black">close</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#737685] font-semibold">Mobile Number</p>
                <p className="font-bold text-[#191b23]">{detailsAgent.mobileNumber}</p>
              </div>
              <div>
                <p className="text-xs text-[#737685] font-semibold">Email</p>
                <p className="font-bold text-[#191b23]">{detailsAgent.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#737685] font-semibold">Referral Code</p>
                <p className="font-bold text-[#0052cc] font-mono">{detailsAgent.status === 'Approved' ? (detailsAgent.referralCode || 'N/A') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-[#737685] font-semibold">Status</p>
                <p className="font-bold text-[#191b23]">{detailsAgent.status}</p>
              </div>
              <div className="col-span-2 border-t border-[#c3c6d6]/20 pt-4 mt-2">
                <p className="text-xs font-bold text-[#003d9b] uppercase tracking-wider mb-2">Identity Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">Aadhaar Number</p>
                    <p className="font-semibold text-xs text-[#191b23] font-mono">{detailsAgent.aadhaarNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">PAN Number</p>
                    <p className="font-semibold text-xs text-[#191b23] font-mono uppercase">{detailsAgent.panNumber || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 border-t border-[#c3c6d6]/20 pt-4 mt-2">
                <p className="text-xs font-bold text-[#003d9b] uppercase tracking-wider mb-2">Address Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold mb-1">Permanent Address</p>
                    <p className="text-xs text-[#191b23] leading-relaxed">
                      {detailsAgent.permanentAddress?.houseNo ? `${detailsAgent.permanentAddress.houseNo}, ` : ''}
                      {detailsAgent.permanentAddress?.street ? `${detailsAgent.permanentAddress.street}, ` : ''}
                      {detailsAgent.permanentAddress?.area ? `${detailsAgent.permanentAddress.area}, ` : ''}
                      {detailsAgent.permanentAddress?.city ? `${detailsAgent.permanentAddress.city}, ` : ''}
                      {detailsAgent.permanentAddress?.district ? `${detailsAgent.permanentAddress.district}, ` : ''}
                      {detailsAgent.permanentAddress?.state ? `${detailsAgent.permanentAddress.state} - ` : ''}
                      {detailsAgent.permanentAddress?.pincode ? detailsAgent.permanentAddress.pincode : 'Not Provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold mb-1">Current/Working Address</p>
                    <p className="text-xs text-[#191b23] leading-relaxed">
                      {detailsAgent.currentAddress?.houseNo ? `${detailsAgent.currentAddress.houseNo}, ` : ''}
                      {detailsAgent.currentAddress?.street ? `${detailsAgent.currentAddress.street}, ` : ''}
                      {detailsAgent.currentAddress?.area ? `${detailsAgent.currentAddress.area}, ` : ''}
                      {detailsAgent.currentAddress?.city ? `${detailsAgent.currentAddress.city}, ` : ''}
                      {detailsAgent.currentAddress?.district ? `${detailsAgent.currentAddress.district}, ` : ''}
                      {detailsAgent.currentAddress?.state ? `${detailsAgent.currentAddress.state} - ` : ''}
                      {detailsAgent.currentAddress?.pincode ? detailsAgent.currentAddress.pincode : 'Not Provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 border-t border-[#c3c6d6]/20 pt-4 mt-2">
                <p className="text-xs font-bold text-[#003d9b] uppercase tracking-wider mb-2">Banking Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">Bank Name</p>
                    <p className="font-semibold text-xs text-[#191b23]">{detailsAgent.bankDetails?.bankName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">Account Holder</p>
                    <p className="font-semibold text-xs text-[#191b23]">{detailsAgent.bankDetails?.accountHolderName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">Account Number</p>
                    <p className="font-semibold text-xs text-[#191b23] font-mono">{detailsAgent.bankDetails?.accountNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">IFSC Code</p>
                    <p className="font-semibold text-xs text-[#191b23] font-mono uppercase">{detailsAgent.bankDetails?.ifscCode || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 border-t border-[#c3c6d6]/20 pt-4 mt-2">
                <p className="text-xs font-bold text-[#003d9b] uppercase tracking-wider mb-2">KYC Documents</p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[
                    { label: 'Profile Photo', url: detailsAgent.profilePhotoUrl },
                    { label: 'Aadhaar Front', url: detailsAgent.aadhaarFrontUrl },
                    { label: 'Aadhaar Back', url: detailsAgent.aadhaarBackUrl },
                    { label: 'PAN Card', url: detailsAgent.panCardUrl },
                    { label: 'Bank Passbook', url: detailsAgent.chequePassbookUrl }
                  ].map((doc, idx) => (
                    doc.url ? (
                      <a key={idx} href={`http://localhost:5000${doc.url}`} target="_blank" rel="noreferrer" className="flex-shrink-0 w-24 aspect-square bg-[#f5f8ff] rounded-xl overflow-hidden border border-[#c3c6d6]/40 hover:border-[#003d9b] transition-colors group relative">
                        <img src={`http://localhost:5000${doc.url}`} alt={doc.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm">open_in_new</span>
                        </div>
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold text-center py-1 uppercase">{doc.label}</span>
                      </a>
                    ) : (
                      <div key={idx} className="flex-shrink-0 w-24 aspect-square bg-[#f5f8ff] rounded-xl border border-dashed border-[#c3c6d6] flex flex-col items-center justify-center text-[#737685]">
                        <span className="material-symbols-outlined text-xl mb-1 opacity-50">image_not_supported</span>
                        <span className="text-[8px] font-bold uppercase text-center leading-tight px-1">{doc.label}<br/>Missing</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="col-span-2 border-t border-[#c3c6d6]/20 pt-4">
                <p className="text-xs font-bold text-[#003d9b] uppercase tracking-wider mb-2">Hierarchy</p>
                <div className="bg-[#f5f8ff] p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold">Parent Agent Name</p>
                    <p className="font-bold text-sm text-[#191b23]">{detailsAgent.reportingManagerName || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737685] font-semibold text-right">Registration Date</p>
                    <p className="font-semibold text-xs text-[#191b23]">{new Date(detailsAgent.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {detailsAgent.status === 'Pending Approval' && (
                <div className="col-span-2 flex gap-3 pt-4 border-t border-[#c3c6d6]/20">
                  <button
                    onClick={() => {
                      setDetailsAgent(null);
                      handleReject(detailsAgent);
                    }}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      setDetailsAgent(null);
                      setRole(detailsAgent.role || 'Field Agent');
                      setManager(detailsAgent.reportingManagerId || '');
                      setApproving(detailsAgent);
                    }}
                    className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Approve Application
                  </button>
                </div>
              )}
              {detailsAgent.status === 'Approved' && detailsAgent.role !== 'Super Agent' && (
                <div className="col-span-2 flex justify-end pt-4 border-t border-[#c3c6d6]/20 mt-4">
                  <button
                    onClick={() => {
                      setPromoteRole(detailsAgent.role === 'Field Agent' ? 'Agent' : 'Super Agent');
                      setPromoting(detailsAgent);
                    }}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">military_tech</span>
                    Promote Agent
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Commission Modal */}
      {editingPlan && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setEditingPlan(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-[#003d9b] text-lg border-b border-[#c3c6d6]/20 pb-3 capitalize">
              Configure {editingPlan} Rates
            </h3>
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Field Agent (%)</label>
                <input 
                  type="number" step="0.1" min="0" max="100" 
                  value={editFa} 
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                  onChange={(e) => setEditFa(e.target.value < 0 ? 0 : e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Agent (%)</label>
                <input 
                  type="number" step="0.1" min="0" max="100" 
                  value={editTl} 
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                  onChange={(e) => setEditTl(e.target.value < 0 ? 0 : e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Super Agent (%)</label>
                <input 
                  type="number" step="0.1" min="0" max="100" 
                  value={editSa} 
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                  onChange={(e) => setEditSa(e.target.value < 0 ? 0 : e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-3">
              <button type="button" onClick={() => setEditingPlan(null)} className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button type="button" onClick={saveCommissionConfig} className="bg-[#003d9b] text-white font-bold text-xs hover:bg-[#0052cc] px-6 py-2.5 rounded-xl cursor-pointer shadow-md">Save Rates</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Promote Agent Modal */}
      {promotingAgent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setPromoting(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-[#191b23] text-lg border-b border-[#c3c6d6]/20 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003d9b]">military_tech</span>
              Promote {promotingAgent.fullName}
            </h3>
            
            <form onSubmit={handlePromote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Current Role</label>
                <div className="bg-[#f5f8ff] px-4 py-3 rounded-xl border border-[#c3c6d6]/40 text-sm font-bold text-[#191b23]">
                  {promotingAgent.role}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">New Role</label>
                <select 
                  value={promoteRole} 
                  onChange={e => setPromoteRole(e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                  required
                >
                  {promotingAgent.role === 'Field Agent' && <option value="Agent">Agent</option>}
                  <option value="Super Agent">Super Agent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Assign Reporting Manager (Optional)</label>
                <select 
                  value={promoteManager} 
                  onChange={e => setPromoteManager(e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                >
                  <option value="">No Reporting Manager</option>
                  {active.filter(a => promoteRole === 'Agent' ? a.role === 'Super Agent' : false).map(mgr => (
                    <option key={mgr._id} value={mgr._id}>{mgr.fullName} ({mgr.role})</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#737685] mt-1 italic">
                  {promoteRole === 'Super Agent' ? 'Super Agents do not have reporting managers.' : 'Select a Super Agent to manage this newly promoted Agent.'}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button type="button" onClick={() => setPromoting(null)} className="text-[#516161] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={actionLoading} className="bg-[#003d9b] text-white font-bold text-xs hover:bg-[#0052cc] px-6 py-2.5 rounded-xl cursor-pointer shadow-md disabled:opacity-50">
                  {actionLoading ? 'Promoting...' : 'Confirm Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
