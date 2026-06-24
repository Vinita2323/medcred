import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const CATEGORY_LABELS = {
  card_purchase:       'Plan Purchase',
  claim_payout:        'Claim Payout',
  refund:              'Refund',
  agent_commission:    'Agent Commission',
  payout_settlement:   'Agent Settlement',
  wallet_topup:        'Wallet Top-up',
  override_commission: 'Override Commission',
  wallet_usage:        'Wallet Usage',
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalCredit: 0, totalDebit: 0, pendingCount: 0, todayCount: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = categoryFilter === 'All' 
        ? ENDPOINTS.ADMIN_TRANSACTIONS 
        : `${ENDPOINTS.ADMIN_TRANSACTIONS}?category=${categoryFilter}`;
        
      const res = await api.get(url);
      if (res.data?.success) {
        setTransactions(res.data.data);
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [categoryFilter]);

  const filtered = transactions.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) || 
    t.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Financial Operations</span>
          <h2 className="text-xl font-extrabold mt-1">Global Ledger</h2>
          <p className="text-sm text-white/80 mt-1">Master record of all financial transactions across the platform.</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Credits',  value: `₹${stats.totalCredit.toLocaleString('en-IN')}`, color: 'text-green-700', bg: 'bg-green-100', icon: 'north_east' },
          { label: 'Total Debits',   value: `₹${stats.totalDebit.toLocaleString('en-IN')}`,  color: 'text-red-700',   bg: 'bg-red-100',   icon: 'south_west' },
          { label: 'Pending Action', value: stats.pendingCount,                              color: 'text-yellow-700',bg: 'bg-yellow-100',icon: 'pending_actions' },
          { label: 'Today\'s Txns',  value: stats.todayCount,                                color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', icon: 'today' },
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

      {/* Filters & Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-extrabold text-[#191b23]">All Transactions</h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search ID or User..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><span className="animate-spin material-symbols-outlined text-[#003d9b] text-3xl">progress_activity</span></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                  <th className="px-5 py-3 whitespace-nowrap">Tx ID</th>
                  <th className="px-5 py-3 whitespace-nowrap">Date</th>
                  <th className="px-5 py-3 whitespace-nowrap">Category</th>
                  <th className="px-5 py-3 whitespace-nowrap">Entity</th>
                  <th className="px-5 py-3 whitespace-nowrap">Amount</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/10">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#faf8ff]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{tx.id}</td>
                    <td className="px-5 py-3.5 text-xs text-[#516161] whitespace-nowrap">{tx.date}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#191b23] whitespace-nowrap">
                      {CATEGORY_LABELS[tx.category] || tx.category}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-[#191b23]">{tx.user}</p>
                      <p className="text-[10px] text-[#737685] font-mono">{tx.ref}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`font-extrabold ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'Credit' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        tx.status === 'Cancelled' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-[#516161] text-sm">
                      <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">receipt_long</span>
                      No transactions found.
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
