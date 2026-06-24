import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';

export default function AgentWalletPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [requestPending, setRequestPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletStats, setWalletStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userJson) {
<<<<<<< HEAD
      const user = JSON.parse(userJson);
      setCurrentUser(user);

      // Customize wallet details based on role and earnings
      let total = user.earnings;
      let balance = Math.floor(total * 0.4);
      let paid = Math.floor(total * 0.6);
      let pending = Math.floor(total * 0.2);

      if (user.role === 'Admin') {
        total = 125000;
        balance = 45000;
        paid = 80000;
        pending = 15000;
      }

      setWalletStats({
        totalEarnings: total,
        pendingEarnings: pending,
        paidEarnings: paid,
        balance: balance,
      });

      // Generate dynamic mock list based on role
      if (user.role === 'Admin') {
        setTransactions([
          { id: 'TX-44021', date: 'June 10, 2026', client: 'Basic Plan Sales Pool', details: 'Network Transaction Volume Override', amount: 15000, type: 'credit', status: 'Paid' },
          { id: 'TX-44018', date: 'June 08, 2026', client: 'Elite Card Activation', details: 'Corporate Channel override', amount: 12000, type: 'credit', status: 'Paid' },
          { id: 'TX-44011', date: 'June 05, 2026', client: 'Admin Account Withdrawal', details: 'Payout Settlement Approved', amount: 25000, type: 'debit', status: 'Paid' },
        ]);
      } else if (user.role === 'Super Agent') {
        setTransactions([
          { id: 'TX-99021', date: 'June 10, 2026', client: 'Sanjay Dutt (Agent)', details: 'Team Activations Override Commission', amount: 8500, type: 'credit', status: 'Paid' },
          { id: 'TX-99018', date: 'June 08, 2026', client: 'Amit Patel (Field Agent)', details: 'Field Activations Override Commission', amount: 4500, type: 'credit', status: 'Paid' },
          { id: 'TX-99014', date: 'June 05, 2026', client: 'Super Agent Withdrawal', details: 'Payout Settlement Approved', amount: 15000, type: 'debit', status: 'Paid' },
        ]);
      } else if (user.role === 'Agent') {
        setTransactions([
          { id: 'TX-88021', date: 'June 10, 2026', client: 'Amit Patel (Field Agent)', details: 'Field Activation Override Commission', amount: 4500, type: 'credit', status: 'Paid' },
          { id: 'TX-88018', date: 'June 08, 2026', client: 'Sanjay Dutt', details: 'Personal card sale reward', amount: 3750, type: 'credit', status: 'Paid' },
          { id: 'TX-88014', date: 'June 05, 2026', client: 'Agent Withdrawal', details: 'Payout Settlement Approved', amount: 8000, type: 'debit', status: 'Paid' },
        ]);
      } else {
        // Field Agent
        setTransactions([
          { id: 'TX-77021', date: 'June 10, 2026', client: 'Arjun Mehta', details: 'Personal Card Activation Commission', amount: 2500, type: 'credit', status: 'Paid' },
          { id: 'TX-77018', date: 'June 08, 2026', client: 'Amit Sharma', details: 'Personal Card Activation Commission', amount: 2500, type: 'credit', status: 'Paid' },
          { id: 'TX-77014', date: 'June 05, 2026', client: 'Field Agent Withdrawal', details: 'Payout Settlement Approved', amount: 3000, type: 'debit', status: 'Paid' },
        ]);
      }
=======
      setCurrentUser(JSON.parse(userJson));
>>>>>>> 318574f954edd436278ce82f30178632b2cae125
    }
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      // Fetch wallet stats
      const walletRes = await api.get(ENDPOINTS.AGENT_WALLET);
      if (walletRes.data?.success) {
        const w = walletRes.data.data;
        setWalletStats({
          totalEarnings: w.totalEarnings,
          pendingEarnings: w.pendingCommissions,
          paidEarnings: w.paidEarnings,
          balance: w.withdrawableBalance,
        });
      }

      // Fetch transactions
      const txRes = await api.get(ENDPOINTS.AGENT_WALLET_TRANSACTIONS);
      if (txRes.data?.success) {
        setTransactions(txRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (walletStats.balance <= 0) {
      alert('You have no withdrawable balance left.');
      return;
    }
    
    const amountToWithdraw = walletStats.balance;
    const confirmWithdrawal = window.confirm(`Are you sure you want to request a withdrawal of ₹${amountToWithdraw.toLocaleString('en-IN')}?`);
    if (!confirmWithdrawal) return;

    try {
      setRequestPending(true);
      const res = await api.post(ENDPOINTS.AGENT_WALLET_WITHDRAW, { amount: amountToWithdraw });
      if (res.data?.success) {
        alert('Settlement withdrawal request submitted successfully to the administrators.');
        // Refresh data to show updated balances and new pending transaction
        fetchWalletData();
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      alert(error.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setRequestPending(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-[#516161]">Loading wallet...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#516161]">
        Loading your wallet...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Wallet Balance Header Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        
        <div className="space-y-2 relative z-10">
          <span className="text-xs uppercase tracking-widest text-[#ffdbcf] font-bold">Withdrawable Balance</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">₹{walletStats.balance.toLocaleString('en-IN')}</h2>
          <p className="text-xs opacity-85">Last payout updated 4 hours ago.</p>
        </div>

        <button 
          onClick={handleRequestPayout}
          disabled={requestPending || walletStats.balance === 0}
          className="relative z-10 bg-white text-[#003d9b] hover:bg-[#faf8ff] active:scale-95 transition-all font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
        >
          {requestPending ? (
            <>
              <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
              Processing Settlement...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              Request Payout Settlement
            </>
          )}
        </button>
      </section>

      {/* Wallet Earning Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Earnings */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d6]/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-[#dae2ff] text-[#003d9b] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
          <div>
            <p className="text-xs text-[#516161] font-semibold">Total Earnings</p>
            <p className="text-xl font-bold text-[#003d9b] mt-0.5">₹{walletStats.totalEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d6]/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-[#ffdbcf] text-[#7b2600] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">hourglass_empty</span>
          </div>
          <div>
            <p className="text-xs text-[#516161] font-semibold">Pending Commissions</p>
            <p className="text-xl font-bold text-[#7b2600] mt-0.5">₹{walletStats.pendingEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Paid / Cleared */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d6]/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-xs text-[#516161] font-semibold">Paid Settlements</p>
            <p className="text-xl font-bold text-green-700 mt-0.5">₹{walletStats.paidEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </section>

      {/* Transaction History Table */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#c3c6d6]/20">
          <h3 className="font-bold text-[#191b23] text-base md:text-lg">Commission Ledger</h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Source / Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#faf8ff]/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-[#003d9b]">{tx.id}</td>
                  <td className="px-6 py-4 text-xs text-[#516161]">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#191b23]">{tx.client}</div>
                    <div className="text-[10px] text-[#737685] mt-0.5">{tx.details}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : tx.status === 'Pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-[#dae2ff] text-[#003d9b]'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-sm ${
                    tx.type === 'debit' ? 'text-red-600' : 'text-green-700'
                  }`}>
                    {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
