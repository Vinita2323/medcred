import React, { useState, useEffect } from 'react';

const TABS = ['Pending Approval', 'Active Agents', 'Blocked'];

const ROLE_COLORS = {
  'Super Agent':  'bg-purple-100 text-purple-700',
  'Team Leader':  'bg-blue-100 text-blue-700',
  'Field Agent':  'bg-[#dae2ff] text-[#003d9b]',
  'Admin':        'bg-yellow-100 text-yellow-700',
};

export default function AdminAgentsPage() {
  const [agents, setAgents]           = useState([]);
  const [activeTab, setTab]           = useState('Pending Approval');
  const [approvingAgent, setApproving] = useState(null);
  const [assignedRole, setRole]       = useState('Field Agent');
  const [assignedManager, setManager] = useState('');
  const [commissions, setCommissions] = useState({
    Basic:   { fieldAgent: 2.0, teamLeader: 1.0, superAgent: 0.5 },
    Premium: { fieldAgent: 3.0, teamLeader: 1.5, superAgent: 0.8 },
    Elite:   { fieldAgent: 4.5, teamLeader: 2.0, superAgent: 1.0 },
  });
  const [editingPlan, setEditPlan]    = useState(null);
  const [editFa, setEfa] = useState(0);
  const [editTl, setEtl] = useState(0);
  const [editSa, setEsa] = useState(0);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('medcred_agents');
    setAgents(raw ? JSON.parse(raw) : []);
    const commsRaw = localStorage.getItem('medcred_commissions');
    if (commsRaw) setCommissions(JSON.parse(commsRaw));
  }, []);

  const saveAgents = (updated) => {
    setAgents(updated);
    localStorage.setItem('medcred_agents', JSON.stringify(updated));
  };

  const handleApprove = (e) => {
    e.preventDefault();
    const randomId  = `MC-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomRef = `${assignedRole.split(' ')[0].toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
    const updated = agents.map(a =>
      a.mobileNumber === approvingAgent.mobileNumber
        ? { ...a, status: 'Approved', role: assignedRole, reportingManager: assignedManager,
            agentId: randomId, referralCode: randomRef,
            commissionRate: assignedRole === 'Super Agent' ? 1.0 : assignedRole === 'Team Leader' ? 1.5 : 2.5,
            rank: 'Bronze', salesCount: 0, earnings: 0,
            joiningDate: new Date().toLocaleDateString('en-IN') }
        : a
    );
    saveAgents(updated);
    setApproving(null);
    alert(`${approvingAgent.fullName} approved as ${assignedRole}!`);
  };

  const handleReject = (agent) => {
    if (!window.confirm(`Reject ${agent.fullName}?`)) return;
    saveAgents(agents.map(a => a.mobileNumber === agent.mobileNumber ? { ...a, status: 'Rejected' } : a));
  };

  const blockToggle = (agent) => {
    saveAgents(agents.map(a =>
      a.mobileNumber === agent.mobileNumber
        ? { ...a, status: a.status === 'Blocked' ? 'Approved' : 'Blocked' }
        : a
    ));
  };

  const promote = (agent, newRole) => {
    saveAgents(agents.map(a =>
      a.mobileNumber === agent.mobileNumber
        ? { ...a, role: newRole, commissionRate: newRole === 'Super Agent' ? 1.0 : newRole === 'Team Leader' ? 1.5 : 2.5 }
        : a
    ));
  };

  const startEditCommission = (plan) => {
    setEditPlan(plan);
    setEfa(commissions[plan].fieldAgent);
    setEtl(commissions[plan].teamLeader);
    setEsa(commissions[plan].superAgent);
  };

  const saveCommission = () => {
    const updated = { ...commissions, [editingPlan]: { fieldAgent: parseFloat(editFa), teamLeader: parseFloat(editTl), superAgent: parseFloat(editSa) } };
    setCommissions(updated);
    localStorage.setItem('medcred_commissions', JSON.stringify(updated));
    setEditPlan(null);
    alert(`Commission rates updated for ${editingPlan} plan!`);
  };

  const getPotentialManagers = (role) => {
    if (role === 'Team Leader') return agents.filter(a => a.role === 'Super Agent' && a.status === 'Approved');
    if (role === 'Field Agent')  return agents.filter(a => a.role === 'Team Leader' && a.status === 'Approved');
    return [];
  };

  const pending = agents.filter(a => a.status === 'Pending Approval');
  const active  = agents.filter(a => a.status === 'Approved');
  const blocked = agents.filter(a => a.status === 'Blocked');

  const listByTab = (tab) => {
    let arr = tab === 'Pending Approval' ? pending : tab === 'Active Agents' ? active : blocked;
    if (search) arr = arr.filter(a => a.fullName?.toLowerCase().includes(search.toLowerCase()) || a.mobileNumber?.includes(search));
    return arr;
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Agent Network</span>
          <h2 className="text-xl font-extrabold mt-1">Agent Management</h2>
          <p className="text-sm text-white/80 mt-1">Approve registrations, manage the agent hierarchy, track performance, and configure commission rates.</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approval', value: pending.length, color:'text-yellow-700',  bg:'bg-yellow-100',  icon:'how_to_reg' },
          { label: 'Active Agents',    value: active.length,  color:'text-green-700',   bg:'bg-green-100',   icon:'badge' },
          { label: 'Blocked',          value: blocked.length, color:'text-red-700',      bg:'bg-red-100',     icon:'block' },
          { label: 'Total Registered', value: agents.length,  color:'text-[#003d9b]',   bg:'bg-[#dae2ff]',  icon:'group' },
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-[#191b23]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Commission Engine */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
        <h3 className="font-extrabold text-[#191b23] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003d9b] text-[20px]">settings_suggest</span>
          Commission Configuration Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(commissions).map(plan => (
            <div key={plan} className="border border-[#c3c6d6]/30 rounded-xl p-4 space-y-2.5">
              <h4 className="font-extrabold text-[#003d9b]">{plan} Plan</h4>
              {[
                { role: 'Field Agent',   val: commissions[plan].fieldAgent },
                { role: 'Team Leader',   val: commissions[plan].teamLeader },
                { role: 'Super Agent',   val: commissions[plan].superAgent },
              ].map(r => (
                <div key={r.role} className="flex justify-between text-xs">
                  <span className="text-[#516161] font-semibold">{r.role}</span>
                  <span className="font-extrabold text-[#191b23]">{r.val}%</span>
                </div>
              ))}
              <button
                onClick={() => startEditCommission(plan)}
                className="w-full mt-1 bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Modify Rates
              </button>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab===tab ? 'bg-[#003d9b] text-white shadow-sm' : 'bg-[#f5f8ff] text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f0f4ff]'}`}
            >
              {tab} ({(tab === 'Pending Approval' ? pending : tab === 'Active Agents' ? active : blocked).length})
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search agents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
          <h3 className="font-extrabold text-[#191b23]">{activeTab} <span className="text-sm font-semibold text-[#516161]">({listByTab(activeTab).length})</span></h3>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={agent.mobileNumber} className="hover:bg-[#faf8ff]/60 transition-colors">
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[agent.role] || 'bg-gray-100 text-gray-700'}`}>{agent.role}</span>
                    </td>
                  )}
                  {activeTab !== 'Pending Approval' && (
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0052cc]">{agent.referralCode || '—'}</td>
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
                          <button onClick={() => setApproving(agent)} className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Assign & Approve</button>
                          <button onClick={() => handleReject(agent)} className="border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Reject</button>
                        </>
                      )}
                      {activeTab === 'Active Agents' && (
                        <>
                          {agent.role === 'Field Agent' && <button onClick={() => promote(agent, 'Team Leader')} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">→ Team Leader</button>}
                          {agent.role === 'Team Leader' && <button onClick={() => promote(agent, 'Super Agent')} className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">→ Super Agent</button>}
                          <button onClick={() => blockToggle(agent)} className="border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Block</button>
                        </>
                      )}
                      {activeTab === 'Blocked' && (
                        <button onClick={() => blockToggle(agent)} className="border border-green-300 text-green-700 hover:bg-green-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Unblock</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {listByTab(activeTab).length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-[#516161] text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">badge</span>
                  No agents in this category.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {approvingAgent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setApproving(null)}>
          <form onSubmit={handleApprove} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <h3 className="font-extrabold text-[#003d9b]">Assign Role: {approvingAgent.fullName}</h3>
              <button type="button" onClick={() => setApproving(null)} className="material-symbols-outlined text-[#737685] cursor-pointer">close</button>
            </div>
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
            {assignedRole !== 'Super Agent' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Reporting Manager</label>
                <select
                  value={assignedManager}
                  onChange={e => setManager(e.target.value)}
                  required
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Reporting Manager</option>
                  {getPotentialManagers(assignedRole).map(m => (
                    <option key={m.agentId} value={m.fullName}>{m.fullName} ({m.role})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setApproving(null)} className="flex-1 border border-[#c3c6d6]/40 text-[#434654] py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#f5f8ff]">Cancel</button>
              <button type="submit" className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Approve Registration</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Commission Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditPlan(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <h3 className="font-extrabold text-[#003d9b]">Configure {editingPlan} Rates</h3>
              <button onClick={() => setEditPlan(null)} className="material-symbols-outlined text-[#737685] cursor-pointer">close</button>
            </div>
            {[
              { label: 'Field Agent Commission (%)', val: editFa, setter: setEfa },
              { label: 'Team Leader Override (%)',   val: editTl, setter: setEtl },
              { label: 'Super Agent Override (%)',   val: editSa, setter: setEsa },
            ].map((f,i)=>(
              <div key={i} className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">{f.label}</label>
                <input type="number" value={f.val} onChange={e=>f.setter(e.target.value)} step="0.1" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b]" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditPlan(null)} className="flex-1 border border-[#c3c6d6]/40 text-[#434654] py-2.5 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={saveCommission} className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
