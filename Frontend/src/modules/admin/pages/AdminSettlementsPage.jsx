import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AdminSettlementsPage() {
  const [settlements, setSettlements]   = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPaid, setTotalPaid]       = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch]             = useState('');
  const [processing, setProcessing]     = useState(null);
  const [loading, setLoading]           = useState(true);

  const fetchSettlements = async (status = statusFilter) => {
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.ADMIN_SETTLEMENTS}?status=${status}`);
      if (res.data?.success) {
        setSettlements(res.data.data.settlements);
        setTotalPending(res.data.data.totalPending);
        setTotalPaid(res.data.data.totalPaid);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleApprove = async (txnId, agentName, amount) => {
    if (!window.confirm(`Approve ₹${amount.toLocaleString('en-IN')} payout for ${agentName}?`)) return;
    setProcessing(txnId);
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_SETTLEMENT_APPROVE(txnId));
      if (res.data?.success) {
        alert(`✅ ${res.data.message}`);
        fetchSettlements();
      }
    } catch (error) {
      alert('Failed to approve settlement');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (txnId, agentName, amount) => {
    if (!window.confirm(`Reject ₹${amount.toLocaleString('en-IN')} payout for ${agentName}? Amount will be returned to their wallet.`)) return;
    setProcessing(txnId);
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_SETTLEMENT_REJECT(txnId));
      if (res.data?.success) {
        alert(`❌ ${res.data.message}`);
        fetchSettlements();
      }
    } catch (error) {
      alert('Failed to reject settlement');
    } finally {
      setProcessing(null);
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchSettlements(status);
  };

  const filtered = settlements.filter(s =>
    s.agent.name.toLowerCase().includes(search.toLowerCase()) ||
    s.agent.agentId.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_BADGE = {
    pending:   'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    failed:    'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Financial Operations</span>
          <h2 className="text-xl font-extrabold mt-1">Agent Settlements</h2>
          <p className="text-sm text-white/80 mt-1">Review and approve agent withdrawal requests. All transactions are logged.</p>
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

      {/* Filters + Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            {['pending', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-[#003d9b] text-white'
                    : 'bg-[#f0f4ff] text-[#003d9b] hover:bg-[#dae2ff]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
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
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#516161] text-sm gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              Loading settlements...
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                  <th className="px-5 py-3">Agent</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Requested At</th>
                  <th className="px-5 py-3">Status</th>
                  {statusFilter === 'pending' && <th className="px-5 py-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/10">
                {filtered.map(s => (
                  <tr key={s.txnId} className="hover:bg-[#faf8ff]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-[#191b23]">{s.agent.name}</p>
                      <p className="text-[10px] text-[#737685] font-mono">{s.agent.agentId} · {s.agent.mobile}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-[#516161]">{s.agent.role}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-extrabold text-[#191b23]">₹{s.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#516161]">
                      {new Date(s.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <br />
                      <span className="text-[10px]">{new Date(s.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_BADGE[s.status] || 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </td>
                    {statusFilter === 'pending' && (
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleApprove(s.txnId, s.agent.name, s.amount)}
                            disabled={processing === s.txnId}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {processing === s.txnId ? (
                              <span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(s.txnId, s.agent.name, s.amount)}
                            disabled={processing === s.txnId}
                            className="border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={statusFilter === 'pending' ? 6 : 5} className="text-center py-16 text-[#516161] text-sm">
                      <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">receipt_long</span>
                      No {statusFilter} settlements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
