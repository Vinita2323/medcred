import React, { useState, useEffect } from 'react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Generate some mock global transactions
    const tx = [
      { id: 'TX-9281', date: '2026-06-15 10:23', type: 'Credit', category: 'Plan Purchase',  amount: 2999, user: 'Arjun Mehta', ref: 'USR001', status: 'Success' },
      { id: 'TX-9282', date: '2026-06-15 11:05', type: 'Debit',  category: 'Claim Payout',   amount: 85000,user: 'Apollo Hospitals', ref: 'CLM001', status: 'Success' },
      { id: 'TX-9283', date: '2026-06-14 16:40', type: 'Credit', category: 'Plan Purchase',  amount: 1499, user: 'Priya Sharma', ref: 'USR002', status: 'Success' },
      { id: 'TX-9284', date: '2026-06-14 14:20', type: 'Debit',  category: 'Agent Commission',amount: 750, user: 'Suresh Kumar', ref: 'AG-8821', status: 'Pending' },
      { id: 'TX-9285', date: '2026-06-13 09:15', type: 'Debit',  category: 'Refund',         amount: 1499, user: 'Sneha Patil', ref: 'USR004', status: 'Success' },
    ];
    setTransactions(tx);
  }, []);

  const filtered = transactions.filter(t => t.id.includes(search) || t.user.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

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

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20 flex justify-between items-center">
          <h3 className="font-extrabold text-[#191b23]">All Transactions</h3>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search ledger..."
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
                <th className="px-5 py-3">Tx ID</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-[#faf8ff]/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{tx.id}</td>
                  <td className="px-5 py-3.5 text-xs text-[#516161]">{tx.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#191b23]">{tx.category}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#191b23]">{tx.user}</p>
                    <p className="text-[10px] text-[#737685] font-mono">{tx.ref}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-extrabold ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'Credit' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
