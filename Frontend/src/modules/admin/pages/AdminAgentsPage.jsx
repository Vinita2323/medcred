import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const TABS = ['Pending Approval', 'Active Agents', 'Blocked'];

const ROLE_COLORS = {
  'Super Agent':  'bg-purple-100 text-purple-700',
  'Team Leader':  'bg-blue-100 text-blue-700',
  'Field Agent':  'bg-[#dae2ff] text-[#003d9b]',
  'Admin':        'bg-yellow-100 text-yellow-700',
};

const STATUS_MAP = {
  'Pending Approval': 'Pending Approval',
  'Active Agents':    'Approved',
  'Blocked':          'Blocked',
};

export default function AdminAgentsPage() {
  const [agents, setAgents]             = useState([]);
  const [activeTab, setTab]             = useState('Pending Approval');
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoad]  = useState(false);
  const [error, setError]               = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  // Approve modal state
  const [approvingAgent, setApproving]  = useState(null);
  const [assignedRole, setRole]         = useState('Field Agent');
  const [assignedManager, setManager]   = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Commission rates (local display only, admin can update separately)
  const [commissions] = useState({
    Basic:   { fieldAgent: 2.5, teamLeader: 1.5, superAgent: 1.0 },
    Premium: { fieldAgent: 3.0, teamLeader: 1.8, superAgent: 1.2 },
    Elite:   { fieldAgent: 4.5, teamLeader: 2.5, superAgent: 1.5 },
  });

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

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Auto-clear success message after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // ── Derived lists ─────────────────────────────────────────────
  const pending = agents.filter(a => a.status === 'Pending Approval');
  const active  = agents.filter(a => a.status === 'Approved');
  const blocked = agents.filter(a => a.status === 'Blocked');

  const listByTab = (tab) => {
    let arr = tab === 'Pending Approval' ? pending : tab === 'Active Agents' ? active : blocked;
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(a =>
        a.fullName?.toLowerCase().includes(q) ||
        a.mobileNumber?.includes(search) ||
        a.email?.toLowerCase().includes(q)
      );
    }
    return arr;
  };

  // ── Get potential managers for dropdown ───────────────────────
  const getPotentialManagers = (role) => {
    if (role === 'Team Leader') return active.filter(a => a.role === 'Super Agent');
    if (role === 'Field Agent')  return active.filter(a => a.role === 'Team Leader');
    return [];
  };

  // ── Approve ───────────────────────────────────────────────────
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
      };
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_APPROVE(approvingAgent._id), payload);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setApproving(null);
        setRole('Field Agent');
        setManager('');
        await fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve agent.');
    } finally {
      setActionLoad(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────
  const handleReject = async (agent) => {
    if (!window.confirm(`Reject ${agent.fullName}'s registration?`)) return;
    try {
      setActionLoad(true);
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_STATUS(agent._id), { status: 'Rejected' });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject agent.');
    } finally {
      setActionLoad(false);
    }
  };

  // ── Block / Unblock ───────────────────────────────────────────
  const blockToggle = async (agent) => {
    const newStatus = agent.status === 'Blocked' ? 'Approved' : 'Blocked';
    const confirmMsg = newStatus === 'Blocked'
      ? `Block ${agent.fullName}? They will not be able to login.`
      : `Unblock ${agent.fullName}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      setActionLoad(true);
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_STATUS(agent._id), { status: newStatus });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoad(false);
    }
  };

  // ── Promote ───────────────────────────────────────────────────
  const promote = async (agent, newRole) => {
    if (!window.confirm(`Promote ${agent.fullName} to ${newRole}?`)) return;
    try {
      setActionLoad(true);
      const res = await api.patch(ENDPOINTS.ADMIN_AGENT_PROMOTE(agent._id), { newRole });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Promotion failed.');
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
          <h2 className="text-xl font-extrabold mt-1">Agent Management</h2>
          <p className="text-sm text-white/80 mt-1">Approve registrations, manage the agent hierarchy, track performance.</p>
        </div>
      </section>

      {/* Success / Error Toast */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approval', value: pending.length, color: 'text-yellow-700', bg: 'bg-yellow-100', icon: 'how_to_reg' },
          { label: 'Active Agents',    value: active.length,  color: 'text-green-700',  bg: 'bg-green-100',  icon: 'badge' },
          { label: 'Blocked',          value: blocked.length, color: 'text-red-700',    bg: 'bg-red-100',    icon: 'block' },
          { label: 'Total Registered', value: agents.length,  color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', icon: 'group' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-[#191b23]">{loading ? '—' : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Commission Reference */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
        <h3 className="font-extrabold text-[#191b23] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003d9b] text-[20px]">settings_suggest</span>
          Commission Rates Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(commissions).map(plan => (
            <div key={plan} className="border border-[#c3c6d6]/30 rounded-xl p-4 space-y-2">
              <h4 className="font-extrabold text-[#003d9b]">{plan} Plan</h4>
              {[
                { role: 'Field Agent',  val: commissions[plan].fieldAgent },
                { role: 'Team Leader',  val: commissions[plan].teamLeader },
                { role: 'Super Agent',  val: commissions[plan].superAgent },
              ].map(r => (
                <div key={r.role} className="flex justify-between text-xs">
                  <span className="text-[#516161] font-semibold">{r.role}</span>
                  <span className="font-extrabold text-[#191b23]">{r.val}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab ? 'bg-[#003d9b] text-white shadow-sm' : 'bg-[#f5f8ff] text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f0f4ff]'}`}
            >
              {tab} ({(tab === 'Pending Approval' ? pending : tab === 'Active Agents' ? active : blocked).length})
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search agents by name, mobile, or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20 flex items-center justify-between">
          <h3 className="font-extrabold text-[#191b23]">
            {activeTab} <span className="text-sm font-semibold text-[#516161]">({listByTab(activeTab).length})</span>
          </h3>
          {actionLoading && (
            <div className="flex items-center gap-1 text-xs text-[#003d9b] font-semibold">
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Processing…
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#516161] text-sm gap-2">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading agents…
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                  <th className="px-5 py-3">Agent Name</th>
                  <th className="px-5 py-3">Contact</th>
                  {activeTab !== 'Pending Approval' && <th className="px-5 py-3">Role</th>}
                  {activeTab !== 'Pending Approval' && <th className="px-5 py-3">Referral Code</th>}
                  {activeTab === 'Active Agents' && <th className="px-5 py-3">Sales / Earnings</th>}
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/10">
                {listByTab(activeTab).map(agent => (
                  <tr key={agent._id} className="hover:bg-[#faf8ff]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#dae2ff] text-[#003d9b] font-bold text-xs flex items-center justify-center shrink-0">
                          {agent.fullName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-[#191b23]">{agent.fullName}</p>
                          {agent.agentId && <p className="text-[10px] text-[#737685] font-mono">{agent.agentId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="font-semibold text-[#191b23]">{agent.mobileNumber}</p>
                      <p className="text-[#737685]">{agent.email}</p>
                    </td>
                    {activeTab !== 'Pending Approval' && (
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[agent.role] || 'bg-gray-100 text-gray-700'}`}>
                          {agent.role}
                        </span>
                      </td>
                    )}
                    {activeTab !== 'Pending Approval' && (
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0052cc]">
                        {agent.referralCode || '—'}
                      </td>
                    )}
                    {activeTab === 'Active Agents' && (
                      <td className="px-5 py-3.5 text-xs">
                        <p className="font-bold text-[#191b23]">{agent.salesCount || 0} sales</p>
                        <p className="text-green-700 font-semibold">₹{(agent.earnings || 0).toLocaleString('en-IN')}</p>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {activeTab === 'Pending Approval' && (
                          <>
                            <button
                              onClick={() => { setApproving(agent); setRole('Field Agent'); setManager(''); }}
                              disabled={actionLoading}
                              className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
                            >
                              Assign & Approve
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
                        {activeTab === 'Active Agents' && (
                          <>
                            {agent.role === 'Field Agent' && (
                              <button onClick={() => promote(agent, 'Team Leader')} disabled={actionLoading} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">→ Team Leader</button>
                            )}
                            {agent.role === 'Team Leader' && (
                              <button onClick={() => promote(agent, 'Super Agent')} disabled={actionLoading} className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">→ Super Agent</button>
                            )}
                            <button onClick={() => blockToggle(agent)} disabled={actionLoading} className="border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">Block</button>
                          </>
                        )}
                        {activeTab === 'Blocked' && (
                          <button onClick={() => blockToggle(agent)} disabled={actionLoading} className="border border-green-300 text-green-700 hover:bg-green-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">Unblock</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {listByTab(activeTab).length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#516161] text-sm">
                      <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">badge</span>
                      No agents in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Approve Modal ──────────────────────────────────────── */}
      {approvingAgent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setApproving(null)}>
          <form
            onSubmit={handleApprove}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <div>
                <h3 className="font-extrabold text-[#003d9b]">Assign Role</h3>
                <p className="text-xs text-[#516161] mt-0.5">{approvingAgent.fullName} — {approvingAgent.mobileNumber}</p>
              </div>
              <button type="button" onClick={() => setApproving(null)} className="material-symbols-outlined text-[#737685] cursor-pointer text-xl">close</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>{error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Designation</label>
              <select
                value={assignedRole}
                onChange={e => { setRole(e.target.value); setManager(''); }}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none cursor-pointer"
              >
                <option>Super Agent</option>
                <option>Team Leader</option>
                <option>Field Agent</option>
              </select>
            </div>

            {assignedRole !== 'Super Agent' && getPotentialManagers(assignedRole).length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Reporting Manager</label>
                <select
                  value={assignedManager}
                  onChange={e => setManager(e.target.value)}
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Select Reporting Manager (Optional)</option>
                  {getPotentialManagers(assignedRole).map(m => (
                    <option key={m._id} value={m._id}>{m.fullName} ({m.role})</option>
                  ))}
                </select>
              </div>
            )}

            {assignedRole !== 'Super Agent' && getPotentialManagers(assignedRole).length === 0 && (
              <p className="text-xs text-[#737685] bg-[#f5f8ff] p-3 rounded-xl">
                ℹ️ No {assignedRole === 'Field Agent' ? 'Team Leaders' : 'Super Agents'} available yet. Agent will have no reporting manager.
              </p>
            )}

            <div className="bg-[#f0f4ff] rounded-xl p-3 text-xs text-[#434654] space-y-1">
              <p className="font-bold text-[#003d9b]">Auto-generated on approval:</p>
              <p>🪪 Agent ID: <span className="font-mono font-bold">MC-XXXXX</span> (unique)</p>
              <p>🔗 Referral Code: <span className="font-mono font-bold">{assignedRole === 'Super Agent' ? 'SA' : assignedRole === 'Team Leader' ? 'TL' : 'FIELD'}XX</span></p>
              <p>💰 Commission Rate: <span className="font-bold">{assignedRole === 'Super Agent' ? '1.0%' : assignedRole === 'Team Leader' ? '1.5%' : '2.5%'}</span></p>
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
                disabled={actionLoading}
                className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-70 flex items-center justify-center gap-1"
              >
                {actionLoading
                  ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Approving…</>
                  : 'Approve Registration'
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
