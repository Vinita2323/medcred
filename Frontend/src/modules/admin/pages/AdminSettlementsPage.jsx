import React, { useState, useEffect } from 'react';

export default function AdminSettlementsPage() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    // We add fake pending/paid earnings to the agents for demo purposes
    const raw = localStorage.getItem('medcred_agents');
    let data = raw ? JSON.parse(raw) : [];
    
    if (data.filter(a => a.status === 'Approved').length === 0) {
      const dummyAgents = [
        { agentId: 'MC-10023', fullName: 'Rajesh Kumar', mobileNumber: '9876543210', email: 'rajesh@example.com', role: 'Super Agent', status: 'Approved', pendingEarnings: 12500, paidEarnings: 45000 },
        { agentId: 'MC-20045', fullName: 'Priya Sharma', mobileNumber: '9876543211', email: 'priya@example.com', role: 'Agent', status: 'Approved', pendingEarnings: 8200, paidEarnings: 21000 },
        { agentId: 'MC-30067', fullName: 'Amit Patel', mobileNumber: '9876543212', email: 'amit@example.com', role: 'Field Agent', status: 'Approved', pendingEarnings: 3400, paidEarnings: 12000 },
        { agentId: 'MC-40089', fullName: 'Neha Singh', mobileNumber: '9876543213', email: 'neha@example.com', role: 'Field Agent', status: 'Approved', pendingEarnings: 0, paidEarnings: 8500 }
      ];
      data = [...data, ...dummyAgents];
      localStorage.setItem('medcred_agents', JSON.stringify(data));
    }

    data = data.filter(a => a.status === 'Approved').map(a => ({
      ...a,
      pendingEarnings: a.pendingEarnings !== undefined ? a.pendingEarnings : Math.floor(Math.random() * 15000),
      paidEarnings: a.paidEarnings !== undefined ? a.paidEarnings : Math.floor(Math.random() * 50000)
    }));
    setAgents(data);
  }, []);

  const handlePayout = (agent) => {
    if (agent.pendingEarnings === 0) return;
    setProcessing(agent.agentId);
    setTimeout(() => {
      const updated = agents.map(a => 
        a.agentId === agent.agentId 
          ? { ...a, paidEarnings: a.paidEarnings + a.pendingEarnings, pendingEarnings: 0 }
          : a
      );
      setAgents(updated);
      
      // Also update localStorage so it reflects across the app
      const fullAgents = JSON.parse(localStorage.getItem('medcred_agents') || '[]');
      const synced = fullAgents.map(a => {
        const u = updated.find(up => up.agentId === a.agentId);
        return u ? { ...a, pendingEarnings: u.pendingEarnings, paidEarnings: u.paidEarnings } : a;
      });
      localStorage.setItem('medcred_agents', JSON.stringify(synced));
      
      setProcessing(null);
      alert(`Successfully processed payout of ₹${agent.pendingEarnings.toLocaleString('en-IN')} for ${agent.fullName}`);
    }, 1200);
  };

  const filtered = agents.filter(a => a.fullName?.toLowerCase().includes(search.toLowerCase()) || a.agentId?.includes(search));

  const totalPending = agents.reduce((sum, a) => sum + (a.pendingEarnings || 0), 0);
  const totalPaid = agents.reduce((sum, a) => sum + (a.paidEarnings || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Financial Operations</span>
          <h2 className="text-xl font-extrabold mt-1">Agent Settlements</h2>
          <p className="text-sm text-white/80 mt-1">Process commission payouts and manage agent wallet balances.</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#c3c6d6]/20 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_empty</span>
          </div>
          <div>
            <p className="text-xs text-[#516161] font-semibold">Total Pending Payouts</p>
            <p className="text-2xl font-extrabold text-[#191b23]">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#c3c6d6]/20 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs text-[#516161] font-semibold">Total Paid to Agents</p>
            <p className="text-2xl font-extrabold text-[#191b23]">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20 flex justify-between items-center">
          <h3 className="font-extrabold text-[#191b23]">Agent Balances</h3>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">Agent</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Paid Earnings</th>
                <th className="px-5 py-3">Pending Payout</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(agent => (
                <tr key={agent.agentId} className="hover:bg-[#faf8ff]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#191b23]">{agent.fullName}</p>
                    <p className="text-[10px] text-[#737685] font-mono">{agent.agentId}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#516161]">{agent.role}</td>
                  <td className="px-5 py-3.5 font-bold text-green-700">₹{(agent.paidEarnings || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                      ₹{(agent.pendingEarnings || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handlePayout(agent)}
                      disabled={agent.pendingEarnings === 0 || processing === agent.agentId}
                      className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                      {processing === agent.agentId ? (
                        <><span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span> Processing...</>
                      ) : (
                        'Process Payout'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#516161] text-sm">
                    No active agents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
